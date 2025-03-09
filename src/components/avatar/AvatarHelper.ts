/**
 * 画像URLからBase64エンコードされた画像データを取得する
 */
export const getBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * データURLから画像要素を作成
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous'; // クロスオリジン画像の読み込みを許可
    image.src = url;
  });

/**
 * キャンバスからBlobデータを取得する
 */
export const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.95): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        type,
        quality
      );
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * ファイル選択イベントからファイルオブジェクトを取得
 */
export const getFileFromEvent = (e: React.ChangeEvent<HTMLInputElement>): File | null => {
  if (e.target.files && e.target.files.length > 0) {
    return e.target.files[0];
  }
  return null;
};

/**
 * 画像をリサイズするためのシンプルな関数
 */
export const resizeImage = (
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  
  let width = image.width;
  let height = image.height;
  
  // アスペクト比を維持しながら最大幅/高さに合わせる
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}; 