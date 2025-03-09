import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { formatImageUrl, validateImageUrl } from "@/lib/imageUtils";
import './enhanced-avatar.css';

interface EnhancedAvatarProps {
  url?: string | null;
  src?: string | null;
  alt?: string;
  fallback?: string;
  fallbackText?: string;
  className?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  url,
  src,
  alt = "Avatar",
  fallback,
  fallbackText,
  className = "h-10 w-10",
  size = 40,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { toast } = useToast();
  
  // サイズの計算
  const getNumericSize = () => {
    if (typeof size === 'number') return size;
    
    switch(size) {
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 64;
      case 'xl': return 96;
      default: return 40;
    }
  };
  
  const numericSize = getNumericSize();
  const finalFallbackText = fallback || fallbackText || "?";
  const imageSource = url || src;
  
  // 画像URLの初期化と読み込み
  useEffect(() => {
    if (!imageSource) {
      setImageUrl(null);
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    const loadImage = async () => {
      setIsLoading(true);
      setLoadError(false);
      
      try {
        // URLを整形
        const formattedUrl = formatImageUrl(imageSource);
        console.log('Loading image with formatted URL:', formattedUrl);
        
        // URLの有効性を検証
        const isValid = await validateImageUrl(formattedUrl);
        
        if (isValid) {
          setImageUrl(formattedUrl);
          setLoadError(false);
        } else {
          // 検証に失敗した場合
          console.warn('Image URL validation failed');
          setLoadError(true);
          
          // キャッシュ問題の可能性があるため、キャッシュバスティングを試みる
          const cacheBustUrl = `${formattedUrl}?t=${Date.now()}`;
          const retryValid = await validateImageUrl(cacheBustUrl);
          
          if (retryValid) {
            console.log('Image loaded with cache busting');
            setImageUrl(cacheBustUrl);
            setLoadError(false);
          } else {
            // フォールバック
            setImageUrl(null);
            setLoadError(true);
            toast({
              title: "プロフィール画像の読み込みに失敗しました",
              description: "デフォルトのアバターを表示します",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [imageSource, toast]);

  return (
    <Avatar 
      className={`enhanced-avatar-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {imageUrl && !loadError && (
        <AvatarImage 
          src={imageUrl} 
          alt={alt}
          className={`enhanced-avatar-image ${isLoading ? 'avatar-loading' : ''}`}
          style={{
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      
      {(isLoading || loadError || !imageUrl) && (
        <AvatarFallback
          className="enhanced-avatar-fallback"
          style={{
            fontSize: numericSize > 32 ? numericSize / 3 : numericSize / 2.5,
            zIndex: 2,
          }}
        >
          {finalFallbackText}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default EnhancedAvatar; 