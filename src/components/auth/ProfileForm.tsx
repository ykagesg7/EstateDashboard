import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const ProfileForm = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // アバター URL を管理する状態変数
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "プロフィール更新完了",
        description: "プロフィールが更新されました。",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "プロフィールの更新中にエラーが発生しました。",
      });
    }
  };

  if (!profile) return null;

  const handlePasswordReset = async () => {
    setIsPasswordResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        (await supabase.auth.getSession()).data.session?.user?.email as string
      );
      if (error) {
        toast({
          variant: "destructive",
          title: "パスワード再設定エラー",
          description: error.message,
        });
      } else {
        toast({
          title: "パスワード再設定メールを送信しました",
          description: "登録されたメールアドレスに再設定用のリンクを送信しました。",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "予期せぬエラー",
        description: "パスワード再設定中にエラーが発生しました。",
      });
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // ストレージのバケット名
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl); // アップロードされたアバターの URL を状態に保存

      // ユーザーの metadata にアバター URL を保存 (必要に応じて)
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "アバターを更新しました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "アバターのアップロードに失敗しました",
        description: error.message,
      });
    } finally {
      setIsAvatarUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">プロフィール編集</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              氏名
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="氏名を入力"
            />
          </div>
          <Button type="submit" className="w-full">
            更新
          </Button>
        </form>

        <div className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePasswordReset}
            disabled={isPasswordResetLoading}
          >
            {isPasswordResetLoading ? "送信中..." : "パスワードを再設定する"}
          </Button>
        </div>

        <div className="border-t pt-4">
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
            アバター
          </label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            className="mt-1 block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100
              "
            onChange={handleAvatarUpload}
            disabled={isAvatarUploading}
          />
          {isAvatarUploading && <p>アップロード中...</p>}
          {avatarUrl && (
            <div className="mt-2">
              <img src={avatarUrl} alt="アバター" className="rounded-full w-16 h-16 object-cover" />
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
};