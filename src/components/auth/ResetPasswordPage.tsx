import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth'; // useAuth フックをインポート

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { session } = useAuth(); // useAuth フックから session を取得

  useEffect(() => {
    // セッションが取得されたら、/dashboard/properties にリダイレクト
    if (session) {
      navigate('/dashboard/properties'); // リダイレクト先を変更
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '無効なリクエストです。',
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'パスワードが一致しません。',
      });

      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) { throw error; }

      toast({
        title: 'パスワードが更新されました',
        description: '新しいパスワードでログインできます。',
      });

      // ここではリダイレクトしない
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'パスワードの更新に失敗しました',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          パスワード再設定
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              新しいパスワード
            </label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="新しいパスワードを入力" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              新しいパスワード（確認）
            </label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="新しいパスワードを再入力" required />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '処理中...' : 'パスワードを更新'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordPage;