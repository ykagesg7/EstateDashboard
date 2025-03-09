import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedAvatar from "@/components/avatar/EnhancedAvatar";
import { AvatarUploader } from "@/components/avatar/AvatarUploader";
import { ProfileForm, ProfileFormData } from "@/components/profile/ProfileForm";
import { SettingsForm, SettingsData } from "@/components/profile/SettingsForm";
import * as api from '@/lib/api';

// 全体の設定データ型定義
interface ProfileSettings extends ProfileFormData, SettingsData {}

const Profile = () => {
  const { userData, isLoading, getInitials, refreshAvatar, updateAvatarUrl } = useUserData();
  const { toast } = useToast();
  
  // プロフィール設定データの状態
  const [settings, setSettings] = useState<ProfileSettings>({
    full_name: "",
    bio: "",
    phone: "",
    job_title: "",
    company: "",
    address: "",
    website: "",
    language: "ja",
    theme: "system",
    email_notifications: true,
    marketing_emails: false,
    security_emails: true,
    two_factor_auth: false,
  });
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // プロフィール情報の初期化
  useEffect(() => {
    if (userData) {
      const fetchProfileData = async () => {
        try {
          // APIを使用してプロフィールデータを取得
          const profileResult = await api.getProfile(userData.id);
          const data = profileResult.success ? profileResult.data : null;
          
          if (data) {
            setSettings({
              full_name: data.full_name || '',
              bio: data.bio || '',
              phone: data.phone || '',
              job_title: data.job_title || '',
              company: data.company || '',
              address: data.address || '',
              website: data.website || '',
              language: data.language || 'ja',
              theme: data.theme || 'system',
              email_notifications: data.email_notifications !== false,
              marketing_emails: !!data.marketing_emails,
              security_emails: data.security_emails !== false,
              two_factor_auth: !!data.two_factor_auth,
            });
          }
          
          // アバターURLの設定
          // Supabaseの認証からメタデータを取得
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user?.user_metadata?.avatar_url) {
            setAvatarUrl(authData.user.user_metadata.avatar_url);
          }
        } catch (error) {
          console.error('Failed to fetch profile data:', error);
          toast({
            title: "プロフィールデータの取得に失敗しました",
            description: "後でもう一度お試しください。",
            variant: "destructive",
          });
        }
      };
      
      fetchProfileData();
    }
  }, [userData, toast]);

  // 設定変更のハンドラ
  const handleSettingChange = (key: keyof ProfileSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // アバター更新のハンドラ
  const handleAvatarUpdate = async (url: string) => {
    try {
      if (!userData) return;
      
      // 新しいアバターURLを設定
      setAvatarUrl(url);
      updateAvatarUrl(url);
      
      toast({
        title: "アバターを更新しました",
        description: "プロフィール画像が正常に更新されました。",
      });
    } catch (error) {
      console.error('Avatar update error:', error);
      toast({
        title: "アバター更新エラー",
        description: "アバターの更新中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  // アバター強制更新（キャッシュクリア）
  const forceUpdateAvatar = async () => {
    if (!userData) return;
    
    try {
      await refreshAvatar();
      toast({
        title: "アバターを再読み込みしました",
        description: "プロフィール画像が更新されました。",
      });
    } catch (error) {
      console.error('Avatar refresh error:', error);
      toast({
        title: "アバター更新エラー",
        description: "アバターの更新中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  // プロフィール保存
  const saveProfile = async () => {
    if (!userData) return;
    
    setSaving(true);
    
    try {
      // APIを通じてプロフィールを更新
      const result = await api.updateProfile(userData.id, settings);
      
      if (result.success) {
        toast({
          title: "プロフィールを保存しました",
          description: "プロフィール情報が正常に更新されました。",
        });
      } else {
        throw new Error(result.error || '不明なエラーが発生しました');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      toast({
        title: "プロフィール保存エラー",
        description: "プロフィールの保存中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // プロフィールフォーム用のデータを抽出
  const profileFormData: ProfileFormData = {
    full_name: settings.full_name,
    bio: settings.bio,
    phone: settings.phone,
    job_title: settings.job_title,
    company: settings.company,
    address: settings.address,
    website: settings.website
  };
  
  // 設定フォーム用のデータを抽出
  const settingsData: SettingsData = {
    language: settings.language,
    theme: settings.theme,
    email_notifications: settings.email_notifications,
    marketing_emails: settings.marketing_emails,
    security_emails: settings.security_emails,
    two_factor_auth: settings.two_factor_auth
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  return (
    <div className="container py-6 space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>アカウント情報とプロフィールを管理します</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="flex flex-col items-center gap-3">
            <EnhancedAvatar
              url={avatarUrl}
              fallback={userData ? getInitials(userData.email) : "??"}
              size="xl"
            />
            <div className="flex gap-2">
              {userData && (
                <AvatarUploader 
                  userId={userData.id}
                  currentAvatarUrl={avatarUrl}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              )}
              <Button variant="outline" size="sm" onClick={forceUpdateAvatar}>
                更新
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="profile">プロフィール</TabsTrigger>
                <TabsTrigger value="settings">設定</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-4">
                <ProfileForm 
                  formData={profileFormData}
                  onFormDataChange={handleSettingChange}
                  onSave={saveProfile}
                  isSaving={saving}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4">
                <SettingsForm 
                  settings={settingsData}
                  onSettingChange={handleSettingChange}
                  onSave={saveProfile}
                  isSaving={saving}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 