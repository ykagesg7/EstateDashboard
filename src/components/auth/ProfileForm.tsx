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
  // avatar_data_url?: string | null; // このカラムはデータベースに存在しない
  created_at: string;
  updated_at: string;
  role: string;
}

export const ProfileForm = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // イニシャルからカラーを生成する関数
  const getColorFromName = (name: string) => {
    const colors = [
      '#F87171', '#FB923C', '#FBBF24', '#A3E635', 
      '#34D399', '#22D3EE', '#60A5FA', '#818CF8', 
      '#A78BFA', '#E879F9', '#FB7185'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // イニシャルベースのアバターSVGを生成
  const getInitialsAvatar = (name: string) => {
    const initials = name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    const bgColor = getColorFromName(name);
    
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="${bgColor.replace('#', '%23')}" /><text x="50%" y="50%" dy=".1em" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  };

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

      console.log('プロフィールデータを取得:', data);
      setProfile(data);
      setFullName(data.full_name || '');
      
      // URLの二重パス問題を修正
      let avatarUrlFromDB = data.avatar_url || null;
      
      if (avatarUrlFromDB && avatarUrlFromDB.includes('/avatars/avatars/')) {
        avatarUrlFromDB = avatarUrlFromDB.replace('/avatars/avatars/', '/avatars/');
        
        // DBのURLも修正
        const { error: fixUrlError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrlFromDB })
          .eq('id', user.id);
          
        if (fixUrlError) {
          console.error('URL修正エラー:', fixUrlError);
        }
      }
      
      console.log('アバターURL設定:', avatarUrlFromDB);
      
      // データURLはもはや保存されないため、URLのみを使用
      if (avatarUrlFromDB) {
        // URLにタイムスタンプとダウンロードパラメータを追加
        const urlWithParams = `${avatarUrlFromDB}?t=${new Date().getTime()}&download=true`;
        setAvatarUrl(urlWithParams);
        
        // バックアップとして、直接ダウンロードを試みる
        try {
          // 画像が利用可能か直接確認（CORSを回避）
          // URLからファイルパスを抽出（例："https://～/public/avatars/user-id/filename.png" から "user-id/filename.png"を抽出）
          const urlParts = avatarUrlFromDB.split('/public/avatars/');
          const filePath = urlParts.length > 1 ? urlParts[1] : '';
          console.log('ダウンロードを試みる：', filePath);
          
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('avatars')
            .download(filePath);
            
          if (downloadError) {
            console.error('ファイルのダウンロードに失敗:', downloadError);
            // 失敗した場合はイニシャルに戻す
            setAvatarUrl(null);
          } else if (fileData) {
            // ダウンロードに成功した場合はDataURLに変換
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                const dataUrl = e.target.result.toString();
                console.log('画像を直接ダウンロードして表示します');
                setAvatarUrl(dataUrl);
              }
            };
            reader.readAsDataURL(fileData);
          }
        } catch (e) {
          console.error('画像ダウンロード中のエラー:', e);
          // エラー時はURLを使い続ける
        }
      } else {
        setAvatarUrl(null); // URLがなければイニシャルアバター
      }
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
      // FileReader APIを使用して直接ファイルを表示
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        // console.log('Data URL生成完了（先頭100文字）:', dataUrl.substring(0, 100) + '...');
        
        // ローカルステートにData URLを設定
        setAvatarUrl(dataUrl);
        
        // Supabaseへのアップロードは続けて行う
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          
          // ユーザーIDを取得
          const { data: { user } } = await supabase.auth.getUser();
          const filePath = `${user?.id}/${fileName}`;
          
          // Supabaseへのアップロード
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
          
          if (uploadError) {
            console.error('ストレージへのアップロードエラー:', uploadError);
            // エラーがあってもローカル表示は成功しているので続行
          } else {
            console.log('ストレージへのアップロード成功:', filePath);
            
            // 公開URLの取得とデータベース更新
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            
            // プロフィールテーブルにURLとData URLを保存
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                avatar_url: publicUrl,
                // avatar_data_url: dataUrl, // このカラムはデータベースに存在しない
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (profileError) {
              console.error('プロフィール更新エラー:', profileError);
            }
          }
          
          toast({
            title: "アバターを更新しました",
            description: "ページを更新しても保持されます。",
          });
        } catch (innerError: any) {
          console.error('アップロード処理エラー:', innerError);
          toast({
            variant: "default",
            title: "ローカル表示のみ成功",
            description: "クラウドへの保存に失敗しました。ページを更新すると表示されなくなります。",
          });
        }
      };
      
      // ファイルをData URLとして読み込み
      reader.readAsDataURL(file);
      
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
          <div className="mt-2">
            <img 
              src={avatarUrl || (fullName ? getInitialsAvatar(fullName) : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMUE3IDcgMCAwIDAgNSAyMSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==')}
              alt="アバター"
              className="rounded-full w-16 h-16 object-cover"
              onLoad={() => console.log('アバター画像の読み込み成功')}
              onError={(e) => {
                console.log('アバター画像の読み込みに失敗:', e.currentTarget.src);
                // 画像URLがデータURLでなければ、イニシャルアバターに切り替え
                if (!e.currentTarget.src.startsWith('data:')) {
                  e.currentTarget.src = fullName 
                    ? getInitialsAvatar(fullName)
                    : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMUE3IDcgMCAwIDAgNSAyMSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==';
                }
              }}
              // タイムアウトでの自動リトライを追加
              ref={(imgEl) => {
                if (imgEl && avatarUrl && !avatarUrl.startsWith('data:')) {
                  // 指定時間後にイメージの読み込み状態をチェック
                  setTimeout(() => {
                    if (!imgEl.complete || imgEl.naturalHeight === 0) {
                      console.log('画像の読み込みタイムアウト、イニシャルアバターに切り替えます');
                      imgEl.src = fullName 
                        ? getInitialsAvatar(fullName)
                        : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMUE3IDcgMCAwIDAgNSAyMSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==';
                    }
                  }, 3000); // 3秒後にチェック
                }
              }}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};