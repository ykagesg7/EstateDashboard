import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react'; // useEffect を追加

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false); // リダイレクトを制御する状態を追加

  useEffect(() => {
    if (!isLoading && !session) {
      // isLoading が false になった後、少し遅延させてからリダイレクトを実行
      const timeoutId = setTimeout(() => {
        setShouldRedirect(true);
      }, 500); // 500ミリ秒の遅延

      return () => clearTimeout(timeoutId);
    } else {
      setShouldRedirect(false);
    }
  }, [isLoading, session]);

  if (isLoading || shouldRedirect) {
    return <div>Loading...</div>; // ローディング中またはリダイレクト待機中はインジケーターを表示
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAuth;