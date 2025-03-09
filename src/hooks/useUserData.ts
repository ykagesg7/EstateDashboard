import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import * as api from '@/lib/api';
import { formatImageUrl } from '@/lib/imageUtils';

export interface UserData {
  id: string;
  email: string | undefined;
  name: string;
  avatar_url: string | null;
  bio?: string;
  phone?: string;
}

export function useUserData() {
  const {
    data: userData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["userData"],
    queryFn: async (): Promise<UserData | null> => {
      try {
        console.log('Fetching user data...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found');
          return null;
        }
        
        console.log(`User authenticated: ${user.id}`);
        
        // APIから直接プロフィール情報を取得
        const profileResult = await api.getProfile(user.id);
        
        if (!profileResult.success) {
          console.error('Error fetching profile via API');
          // エラーがあってもユーザー基本情報は返す
          return {
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'ユーザー',
            avatar_url: null
          };
        }
        
        const data = profileResult.data;
        console.log('Profile data retrieved via API:', data);

        // アバターURLの処理 - 新しいformatImageUrl関数を使用
        let avatarUrl = data?.avatar_url;
        console.log('Raw avatar URL from database:', avatarUrl);
        
        if (avatarUrl) {
          // 新しいformatImageUrl関数を使用してURLを整形
          avatarUrl = formatImageUrl(avatarUrl);
          console.log('Avatar URL found and formatted:', avatarUrl);
        } else {
          console.log('No avatar URL found in profile');
        }
        
        const userData = {
          id: user.id,
          email: user.email,
          name: data?.full_name || user.email?.split('@')[0] || 'ユーザー',
          avatar_url: avatarUrl,
          bio: data?.bio,
          phone: data?.phone
        };
        
        console.log('Final user data with avatar:', userData);
        return userData;
      } catch (e) {
        console.error('Error in useUserData hook:', e);
        return null;
      }
    },
    staleTime: 10000, // 10秒間キャッシュ (超短くして更新を即時反映)
    retry: 1, // エラー時に1回だけ再試行
  });

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string = '') => {
    return name.charAt(0).toUpperCase() || 'ユ';
  };

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // 明示的にアバターを取得・更新する関数
  const refreshAvatar = async () => {
    console.log('Explicitly refreshing avatar...');
    await refetch();
  };

  // 直接プロフィール情報を更新する関数
  const updateAvatarUrl = async (url: string): Promise<boolean> => {
    if (!userData?.id) {
      console.error('Cannot update avatar: No user ID available');
      return false;
    }
    
    try {
      console.log('Updating avatar URL via hook:', url);
      const result = await api.updateProfileAvatar(userData.id, url);
      
      if (result.success) {
        console.log('Avatar update successful, refreshing data');
        await refetch();
        return true;
      } else {
        console.error('Avatar update failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error in updateAvatarUrl:', error);
      return false;
    }
  };

  return {
    userData,
    isLoading,
    error,
    refetch,
    refreshAvatar,
    updateAvatarUrl,
    getInitials,
    handleLogout
  };
} 