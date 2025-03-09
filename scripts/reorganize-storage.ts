import { supabase } from "../src/lib/supabase.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function reorganizeStorage() {
  console.log("ストレージファイルの再整理を開始します...");

  try {
    // 1. すべての物件画像レコードを取得
    console.log("データベースからすべての画像レコードを取得中...");
    const { data: imageRecords, error: fetchError } = await supabase
      .from("property_images")
      .select("*");

    if (fetchError) {
      throw new Error(`画像レコードの取得に失敗しました: ${fetchError.message}`);
    }

    console.log(`${imageRecords.length}件の画像レコードが見つかりました`);

    // 一時保存用ディレクトリ
    const tempDir = path.join(__dirname, "temp_images");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 各画像に対して処理
    for (const record of imageRecords) {
      try {
        console.log(`処理中: ${record.id} - ${record.url}`);
        
        // 既存のURLからファイル名部分を抽出
        const urlParts = record.url.split("/");
        const originalFileName = urlParts[urlParts.length - 1];
        const fileExt = originalFileName.split(".").pop();
        
        // 物件IDを取得
        const propertyId = record.property_id;
        
        // 2. 既存のファイルを一時的にダウンロード
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("property-images")
          .download(record.url.replace(/^.*?\/property-images\//, ""));

        if (downloadError) {
          console.error(`ファイルのダウンロードに失敗しました: ${record.url}`, downloadError);
          continue;
        }

        // 一時ファイルに保存
        const tempFilePath = path.join(tempDir, originalFileName);
        fs.writeFileSync(tempFilePath, Buffer.from(await fileData.arrayBuffer()));

        // 3. 新しいシンプルなパスでアップロード
        const newFileName = `${uuidv4()}.${fileExt}`;
        const newFilePath = `${propertyId}/${newFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(newFilePath, fs.readFileSync(tempFilePath), {
            upsert: true,
            contentType: `image/${fileExt}`
          });

        if (uploadError) {
          throw new Error(`新しいパスへのアップロードに失敗しました: ${uploadError.message}`);
        }

        // 4. 新しいURLを生成
        const { data: publicUrl } = supabase.storage
          .from("property-images")
          .getPublicUrl(newFilePath);

        // 5. データベースのURLを更新
        const { error: updateError } = await supabase
          .from("property_images")
          .update({ url: publicUrl.publicUrl })
          .eq("id", record.id);

        if (updateError) {
          throw new Error(`データベースの更新に失敗しました: ${updateError.message}`);
        }

        console.log(`✅ 成功: ${record.id} - 新しいURL: ${publicUrl.publicUrl}`);
        
        // 一時ファイルを削除
        fs.unlinkSync(tempFilePath);
        
      } catch (recordError) {
        console.error(`レコード処理エラー: ${record.id}`, recordError);
      }
    }

    console.log("🎉 ストレージファイルの再整理が完了しました");
    
    // 一時ディレクトリを削除
    fs.rmdirSync(tempDir, { recursive: true });
    
  } catch (error) {
    console.error("処理中にエラーが発生しました:", error);
  }
}

// スクリプトを実行
reorganizeStorage();
