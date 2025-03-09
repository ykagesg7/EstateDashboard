import { Home, Building, DollarSign, Settings, FileText, Users, LogOut, User } from "lucide-react";

// メインナビゲーション項目
export const mainNavItems = [
  { icon: Home, label: "ダッシュボード", href: "/dashboard" },
  { icon: Building, label: "物件一覧", href: "/properties" },
  { icon: DollarSign, label: "財務管理", href: "/finances" },
  { icon: FileText, label: "契約書", href: "/contracts" },
  { icon: Users, label: "顧客管理", href: "/clients" },
];

// ユーザー関連のメニュー項目
export const userNavItems = [
  { icon: User, label: "プロフィールと設定", href: "/profile" },
  { icon: LogOut, label: "ログアウト", href: "#logout", isAction: true }
]; 