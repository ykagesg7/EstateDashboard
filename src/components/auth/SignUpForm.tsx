import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting signup with:", { email, fullName });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        
        // Handle rate limit error specifically
        if (error.status === 429) {
          toast({
            variant: "destructive",
            title: "エラー",
            description: "登録の試行回数が多すぎます。しばらく時間をおいてから再度お試しください。",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "エラー",
          description: error.message,
        });
        return;
      }

      console.log("Signup successful:", data);
      toast({
        title: "アカウント作成完了",
        description: "確認メールを送信しました。メールを確認してアカウントを有効化してください。",
      });
      navigate('/properties');
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "アカウント作成中にエラーが発生しました。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          新規登録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              氏名
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="氏名を入力"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              placeholder="メールアドレスを入力"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <Input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登録中..." : "登録"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};