import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Upload, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Dropzone from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';
import { getBase64FromUrl, canvasToBlob } from './AvatarHelper';
import * as api from '@/lib/api';
import { formatImageUrl, uploadAvatar as uploadAvatarUtil } from '@/lib/imageUtils';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
  size?: number;
}

export const AvatarUploader = ({ userId, currentAvatarUrl, onAvatarUpdate, size = 150 }: AvatarUploaderProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const editorRef = useRef<AvatarEditor>(null);
  
  // ダイアログが開かれたときに現在のアバターを初期表示
  useEffect(() => {
    const initCurrentAvatar = async () => {
      if (currentAvatarUrl && open) {
        try {
          // アバターURLが有効かチェック（avatars/で始まる場合は絶対URLに変換）
          if (currentAvatarUrl.startsWith('avatars/')) {
            // 相対パスの場合は公開URLに変換
            const { data } = supabase.storage.from('avatars').getPublicUrl(currentAvatarUrl);
            const publicUrl = data.publicUrl;
            
            // Base64変換を試みる
            const base64 = await getBase64FromUrl(publicUrl);
            setImage(base64);
          } else {
            // 画像のクロスオリジン問題を回避するためBase64に変換
            const base64 = await getBase64FromUrl(currentAvatarUrl);
            setImage(base64);
          }
        } catch (error) {
          console.error('Failed to load current avatar:', error);
          // エラーが発生した場合は画像なしの状態にする
          setImage(null);
          setPreviewUrl(null);
        }
      }
    };

    if (open) {
      initCurrentAvatar();
    }
  }, [currentAvatarUrl, open]);

  // 画像の初期設定
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        // 画像の圧縮オプション
        const options = {
          maxSizeMB: 1, // 最大1MB
          maxWidthOrHeight: 1024, // 最大幅または高さ
          useWebWorker: true,
          fileType: file.type
        };
        
        // 大きすぎる画像を事前に圧縮
        let processedFile = file;
        if (file.size > 1024 * 1024) { // 1MB以上の場合
          toast({
            title: "画像を最適化しています",
            description: "大きなサイズの画像を処理中です...",
          });
          processedFile = await imageCompression(file, options);
        }
        
        // 画像をFileReaderでBase64に変換
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            setImage(e.target.result);
            setPreviewUrl(e.target.result);
          }
        };
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        console.error('画像処理エラー:', error);
        toast({
          variant: "destructive",
          title: "画像処理エラー",
          description: "画像の処理中にエラーが発生しました。",
        });
      }
    }
  }, [toast]);

  // 画像のクリア
  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setScale(1);
  };

  // エディタからのキャンバスデータを取得
  const getImageData = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!editorRef.current) {
        return reject(new Error('エディタが利用できません'));
      }

      try {
        // Canvas要素を取得
        const canvas = editorRef.current.getImageScaledToCanvas();
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        
        // 画像データが存在することを確認
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        if (!dataUrl || dataUrl === 'data:,') {
          return reject(new Error('キャンバスから画像データを取得できませんでした'));
        }
        
        // Base64データをBlobに変換
        canvasToBlob(canvas, 'image/jpeg', 0.95)
          .then(blob => {
            console.log('Generated blob size:', blob.size);
            resolve(blob);
          })
          .catch(error => {
            console.error('Blob conversion error:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Canvas processing error:', error);
        reject(error);
      }
    });
  };

  // 画像をアップロードする処理
  const uploadAvatar = async () => {
    if (!image) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "画像が選択されていません。もう一度お試しください。",
      });
      return;
    }

    setUploading(true);

    try {
      // エディタから編集済み画像データを取得
      const blob = await getImageData();
      
      // Blobのチェック
      if (!blob || blob.size <= 0) {
        throw new Error('有効な画像データが取得できませんでした');
      }
      
      console.log('Upload blob size:', blob.size);
      
      // Blobをファイルに変換
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // 新しいimageUtilsのアップロード関数を使用
      const result = await uploadAvatarUtil(userId, file);
      
      if (!result.success) {
        throw new Error('アップロードに失敗しました');
      }
      
      console.log('Avatar upload successful, public URL:', result.publicUrl);
      
      // 公開URLは既に整形済み
      const avatarUrl = result.publicUrl;
      
      // APIを使用してプロフィールのアバターURLを更新
      const profileUpdate = await api.updateProfileAvatar(userId, avatarUrl);
      console.log('Profile update successful:', profileUpdate);
      
      // 親コンポーネントに通知
      onAvatarUpdate(avatarUrl);
      
      toast({
        title: "アバターをアップロードしました",
        description: "プロフィール画像が更新されました",
      });
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "アップロードエラー",
        description: error.message || "画像のアップロードに失敗しました",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    clearImage();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group">
          <Button
            variant="ghost"
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 h-auto rounded-full cursor-pointer shadow-lg opacity-90 hover:opacity-100 transition-opacity"
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">アバターをアップロード</span>
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>プロフィール画像を変更</DialogTitle>
          <DialogDescription>
            プロフィール画像をアップロードまたは編集できます。変更を保存するには「保存」ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>
        
        {!image ? (
          <Dropzone
            onDrop={onDrop}
            accept={{
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'], 
              'image/webp': ['.webp']
            }}
            maxSize={5 * 1024 * 1024} // 5MB
            multiple={false}
          >
            {({getRootProps, getInputProps, isDragActive}) => (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {isDragActive ? '画像をドロップしてください' : '画像をドラッグ&ドロップするか、クリックして選択'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP形式（最大5MB）
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                color={[0, 0, 0, 0.6]} // RGBA
                scale={scale}
                rotate={0}
                crossOrigin="anonymous" // クロスオリジン画像の読み込みを許可
                onLoadFailure={(e) => {
                  console.error('Image load failure:', e);
                  toast({
                    variant: "destructive",
                    title: "画像読み込みエラー",
                    description: "画像を読み込めませんでした。別の画像を試してください。",
                  });
                  clearImage();
                }}
                onLoadSuccess={() => console.log('Image loaded successfully in editor')}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="zoom">拡大/縮小</Label>
                <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                id="zoom"
                min={0.5}
                max={2}
                step={0.01}
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
              />
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {image ? (
            <>
              <Button variant="outline" type="button" onClick={clearImage} disabled={uploading}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              <Button type="button" onClick={uploadAvatar} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    保存
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 