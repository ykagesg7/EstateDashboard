import { supabase } from './supabase';
import { getStoragePublicUrl, uploadAvatar } from './imageUtils';

/**
 * ユーザープロフィールのアバターURLを更新する
 * @param userId ユーザーID
 * @param avatarUrl アバターの公開URL
 * @returns 更新結果
 */
export const updateProfileAvatar = async (userId: string, avatarUrl: string) => {
  console.log('Updating profile avatar URL in database:', { userId, avatarUrl });
  
  try {
    // プロフィールテーブルを直接更新
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Error updating profile avatar:', error);
      throw error;
    }
    
    console.log('Profile update success, returned data:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Exception in updateProfileAvatar:', error);
    return { success: false, error };
  }
};

/**
 * ユーザープロフィールを取得する
 * @param userId ユーザーID
 * @returns プロフィールデータ
 */
export const getProfile = async (userId: string) => {
  console.log('Directly fetching profile from database:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    console.log('Profile fetch success, returned data:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Exception in getProfile:', error);
    return { success: false, error };
  }
};

/**
 * ユーザープロフィールを完全に更新する
 * @param userId ユーザーID
 * @param profileData 更新するプロフィールデータ
 * @returns 更新結果
 */
export const updateProfile = async (userId: string, profileData: any) => {
  console.log('Updating profile in database:', { userId, profileData });
  
  try {
    // プロフィールテーブルを更新
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    console.log('Profile update success, returned data:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Exception in updateProfile:', error);
    return { success: false, error };
  }
};

/**
 * アバター画像をアップロードする
 * @param userId ユーザーID
 * @param file ファイルオブジェクト
 * @returns アップロード結果
 */
export const uploadAvatarImage = async (userId: string, file: File) => {
  try {
    // 画像をアップロード
    const result = await uploadAvatar(userId, file);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload avatar');
    }
    
    // アップロードに成功したら、プロフィールのavatar_urlを更新
    if (result.publicUrl) {
      await updateProfileAvatar(userId, result.publicUrl);
    }
    
    return result;
  } catch (error) {
    console.error('Exception in uploadAvatarImage:', error);
    return { success: false, error };
  }
}; 