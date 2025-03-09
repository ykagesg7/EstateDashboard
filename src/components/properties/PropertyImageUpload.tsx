import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PropertyImage } from "@/types/property";
import { Image, X, Upload, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface PropertyImageUploadProps {
  propertyId: string;
  existingImages?: PropertyImage[];
  onImagesChange?: (images: PropertyImage[]) => void;
}

export const PropertyImageUpload = ({ 
  propertyId, 
  existingImages = [],
  onImagesChange 
}: PropertyImageUploadProps) => {
  const [images, setImages] = useState<PropertyImage[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingImages.length > 0) {
      setImages(existingImages);
    } else {
      fetchImages();
    }
  }, [propertyId, existingImages]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
      onImagesChange?.(data || []);
    } catch (error) {
      // エラー処理
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("認証が必要です");

      // 複数ファイルのアップロードを処理
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${propertyId}/${uuidv4()}.${fileExt}`;
        
        // Supabaseへのアップロード
        const { data, error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, file, {
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 公開URLの取得
        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        // データベースに画像情報を保存
        const isPrimary = images.length === 0 && i === 0; // 最初の画像はプライマリ
        const { data: imageData, error: insertError } = await supabase
          .from("property_images")
          .insert({
            property_id: propertyId,
            user_id: user.id,
            url: publicUrl,
            is_primary: isPrimary,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // 画像リストを更新
        if (imageData) {
          setImages(prev => [imageData, ...prev]);
          onImagesChange?.([imageData, ...images]);
        }
        
        // 進捗を更新
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: "アップロード完了",
        description: `${files.length}件の画像をアップロードしました`,
      });

      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: `画像のアップロードに失敗しました: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = ''; // 入力をリセット
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // 既存のプライマリ画像をリセット
      await supabase
        .from("property_images")
        .update({ is_primary: false })
        .eq("property_id", propertyId);
      
      // 新しいプライマリ画像を設定
      const { error } = await supabase
        .from("property_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      if (error) throw error;
      
      // ローカルの状態を更新
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      
      onImagesChange?.(images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));

      toast({
        title: "メイン画像を設定しました",
      });
      
      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: `メイン画像の設定に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      // データベースから削除
      const { error } = await supabase
        .from("property_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
      
      // ローカルの状態を更新
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      
      toast({
        title: "画像を削除しました",
      });
      
      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: `画像の削除に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="images">物件画像</Label>
        <div>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Label
            htmlFor="images"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            画像をアップロード
          </Label>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group rounded-md overflow-hidden border aspect-square">
              <img
                src={image.url}
                alt="物件画像"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mr-2 bg-white"
                  onClick={() => setPrimaryImage(image.id)}
                  title="メイン画像に設定"
                >
                  {image.is_primary ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="bg-white"
                  onClick={() => deleteImage(image.id)}
                  title="画像を削除"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
                  メイン
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            まだ画像がありません。物件の画像をアップロードしてください。
          </p>
        </div>
      )}
    </div>
  );
}; 