import { supabase } from './supabase';

/**
 * 画像URLを整形して返す
 * クエリパラメータを削除し、必要に応じてエンコード
 */
export function formatImageUrl(url: string | null): string | null {
  if (!url) return null;
  
  try {
    // URLからクエリパラメータを削除
    const baseUrl = url.split('?')[0];
    
    // URLにスペースや特殊文字が含まれている場合、適切にエンコード
    if (baseUrl !== encodeURI(baseUrl)) {
      console.log('URL needs encoding:', baseUrl);
      return encodeURI(baseUrl);
    }
    
    return baseUrl;
  } catch (error) {
    console.error('URL formatting error:', error);
    return url; // エラー時は元のURLを返す
  }
}

/**
 * 画像URLが有効かどうかを検証
 */
export function validateImageUrl(url: string | null): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      console.warn('No URL provided for validation');
      resolve(false);
      return;
    }
    
    // クリーンなURLを使用
    const cleanUrl = formatImageUrl(url);
    
    const img = new Image();
    const timeoutId = setTimeout(() => {
      console.warn('Image validation timed out:', cleanUrl);
      resolve(false);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      console.log('Image URL validation successful:', cleanUrl);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      console.error('Image URL validation failed:', cleanUrl);
      resolve(false);
    };
    
    img.src = cleanUrl || '';
  });
}

/**
 * Supabaseストレージからの公開URLを取得
 */
export async function getStoragePublicUrl(bucket: string, path: string): Promise<string | null> {
  try {
    console.log(`Getting public URL for ${bucket}/${path}`);
    
    // 直接URLを構築（シンプルな方法）
    const directUrl = `https://amrleuqngqtfbrjadcky.supabase.co/storage/v1/object/public/${bucket}/${path}`;
    
    // Supabase APIを使用
    const { data } = await supabase.storage.from(bucket).getPublicUrl(path);
    
    if (data?.publicUrl) {
      const apiUrl = formatImageUrl(data.publicUrl);
      console.log('Generated public URL via API:', apiUrl);
      return apiUrl;
    }
    
    console.log('Falling back to direct URL:', directUrl);
    return directUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
}

/**
 * 画像ファイルをリサイズして最適化
 */
export async function optimizeImage(file: File, maxWidth = 512, maxHeight = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // アスペクト比を維持しながらリサイズ
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 高品質なJPEGとして出力
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Image optimized: ${file.size} bytes -> ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Blob creation failed'));
            }
          },
          'image/jpeg',
          0.85  // 品質: 85%
        );
      };
      
      img.onerror = () => {
        reject(new Error('Image loading failed during optimization'));
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Image optimization error:', error);
      reject(error);
    }
  });
}

/**
 * ユーザーIDに基づいた短く一貫性のあるファイル名を生成
 */
export function generateAvatarFilename(userId: string): string {
  // UUIDの先頭8文字だけを使用し、タイムスタンプを追加
  const shortId = userId.split('-')[0] || userId.substring(0, 8);
  const timestamp = Date.now();
  return `avatar-${shortId}-${timestamp}.jpg`;
}

/**
 * 画像ファイルをアップロードして公開URLを取得する
 */
export async function uploadAvatar(userId: string, file: File): Promise<{success: boolean, publicUrl?: string, error?: any}> {
  try {
    console.log('Preparing to upload avatar for user:', userId);
    
    // 画像を最適化
    const optimizedBlob = await optimizeImage(file);
    
    // ファイル名を生成
    const fileName = generateAvatarFilename(userId);
    
    console.log(`Uploading optimized avatar (${optimizedBlob.size} bytes) as ${fileName}`);
    
    // アップロード実行
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, optimizedBlob, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return { success: false, error };
    }
    
    // 公開URLを取得
    const publicUrl = await getStoragePublicUrl('avatars', fileName);
    
    if (!publicUrl) {
      return { 
        success: false, 
        error: 'Failed to generate public URL' 
      };
    }
    
    return {
      success: true,
      publicUrl
    };
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return { success: false, error };
  }
} 