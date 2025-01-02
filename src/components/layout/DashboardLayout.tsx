import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { MobileNav } from "./MobileNav";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <MobileNav />
        <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};