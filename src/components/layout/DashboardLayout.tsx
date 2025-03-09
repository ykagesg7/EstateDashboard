import { TopNav } from "./TopNav";
import { Outlet } from "react-router-dom";
import { MobileNav } from "./MobileNav";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* モバイルヘッダー（md以下で表示） */}
      <MobileNav />
      
      {/* デスクトップ用ヘッダー（md以上で表示） */}
      <TopNav />
      
      {/* メインコンテンツ */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};