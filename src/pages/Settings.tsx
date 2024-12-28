import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProfileForm } from "@/components/auth/ProfileForm";

const Settings = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ログアウトに失敗しました。",
      });
    } else {
      toast({
        title: "ログアウト完了",
        description: "正常にログアウトしました。",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">設定</h1>
      
      <div className="grid gap-6">
        <ProfileForm />
        
        <Card>
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" onClick={handleLogout}>
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;