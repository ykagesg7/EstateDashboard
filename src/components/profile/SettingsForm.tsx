import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Lock, Languages, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface SettingsData {
  language: string;
  theme: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  security_emails: boolean;
  two_factor_auth: boolean;
}

const LANGUAGES = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
];

const THEMES = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "system", label: "システム設定に合わせる" },
];

interface SettingsFormProps {
  settings: SettingsData;
  onSettingChange: (key: keyof SettingsData, value: any) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export const SettingsForm = ({
  settings,
  onSettingChange,
  onSave,
  isSaving
}: SettingsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Languages className="h-5 w-5" />
            <div>
              <p className="font-medium">言語</p>
              <p className="text-sm text-muted-foreground">
                アプリケーションの表示言語を選択します
              </p>
            </div>
          </div>
          <Select
            value={settings.language}
            onValueChange={(value) => onSettingChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
            <div>
              <p className="font-medium">テーマ</p>
              <p className="text-sm text-muted-foreground">
                アプリケーションの表示テーマを選択します
              </p>
            </div>
          </div>
          <Select
            value={settings.theme}
            onValueChange={(value) => onSettingChange('theme', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="テーマを選択" />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5" />
            <div>
              <p className="font-medium">通知</p>
              <p className="text-sm text-muted-foreground">
                通知設定をカスタマイズします
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications" className="flex-1">
                メール通知
              </Label>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => onSettingChange('email_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing_emails" className="flex-1">
                マーケティングメール
              </Label>
              <Switch
                id="marketing_emails"
                checked={settings.marketing_emails}
                onCheckedChange={(checked) => onSettingChange('marketing_emails', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="security_emails" className="flex-1">
                セキュリティ通知
              </Label>
              <Switch
                id="security_emails"
                checked={settings.security_emails}
                onCheckedChange={(checked) => onSettingChange('security_emails', checked)}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Lock className="h-5 w-5" />
            <div>
              <p className="font-medium">セキュリティ</p>
              <p className="text-sm text-muted-foreground">
                アカウントのセキュリティ設定
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="two_factor_auth" className="flex-1">
              二要素認証
            </Label>
            <Switch
              id="two_factor_auth"
              checked={settings.two_factor_auth}
              onCheckedChange={(checked) => onSettingChange('two_factor_auth', checked)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
      </CardFooter>
    </Card>
  );
}; 