import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false); // セッション情報取得後にローディング終了
      }
    );

    // 初回セッション取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading }; // isLoading を返す
};