import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface ProfileFormData {
  full_name: string;
  bio: string;
  phone: string;
  job_title: string;
  company: string;
  address: string;
  website: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  onFormDataChange: (key: keyof ProfileFormData, value: any) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export const ProfileForm = ({ 
  formData, 
  onFormDataChange, 
  onSave, 
  isSaving 
}: ProfileFormProps) => {
  const { toast } = useToast();
  
  const handleInputChange = (key: keyof ProfileFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFormDataChange(key, e.target.value);
  };
  
  const handleSave = async () => {
    try {
      await onSave();
      toast({
        title: "プロフィールを保存しました",
        description: "プロフィール情報が正常に更新されました。",
      });
    } catch (error) {
      console.error("プロフィール保存エラー:", error);
      toast({
        title: "エラーが発生しました",
        description: "プロフィールの保存中にエラーが発生しました。後でもう一度お試しください。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">氏名</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={handleInputChange('full_name')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">自己紹介</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleInputChange('phone')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">職業</Label>
          <Input
            id="job_title"
            value={formData.job_title}
            onChange={handleInputChange('job_title')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">会社名</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={handleInputChange('company')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">住所</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={handleInputChange('address')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Webサイト</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={handleInputChange('website')}
            placeholder="https://example.com"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "変更を保存"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}; 