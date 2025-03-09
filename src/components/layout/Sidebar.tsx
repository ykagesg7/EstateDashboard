import { Home, Building, DollarSign, Settings, ChevronLeft, FileText, Users, Award } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: Home, label: "ダッシュボード", href: "/dashboard" },
  { icon: Building, label: "物件一覧", href: "/properties" },
  { icon: DollarSign, label: "財務管理", href: "/finances" },
  { icon: FileText, label: "契約書", href: "/contracts" },
  { icon: Users, label: "顧客管理", href: "/clients" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export const AppSidebar = () => {
  const { isMobile, state, setOpen } = useSidebar();
  const isMobileDevice = useIsMobile();
  const location = useLocation();
  
  // モバイルでは初期状態でサイドバーを折りたたむ
  useEffect(() => {
    if (isMobileDevice) {
      setOpen(false);
    }
  }, [isMobileDevice, setOpen]);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarRail />
      <SidebarContent>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-gold" />
            <h1 className="text-xl font-bold premium-text-gradient">PropManager</h1>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <SidebarSeparator className="mx-4 bg-sidebar-border/30" />
        <div className="px-4 py-3">
          <span className="text-xs uppercase font-medium tracking-wider text-sidebar-muted-foreground">メインメニュー</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild
                    tooltip={item.label}
                    isActive={isActiveRoute(item.href)}
                    className={`hover-lift ${isActiveRoute(item.href) ? 'border-l-2 border-gold pl-[calc(0.5rem-2px)]' : 'pl-4'}`}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${isActiveRoute(item.href) ? 'text-gold' : ''}`} />
                      <span className={isActiveRoute(item.href) ? 'font-medium' : ''}>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-4 my-4 bg-sidebar-border/30" />
        <div className="p-4 mt-auto">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <h4 className="text-sm font-medium text-gold mb-2">プレミアムプラン</h4>
            <p className="text-xs text-sidebar-muted-foreground mb-3">
              高度な機能をご利用いただけます
            </p>
            <Button size="sm" className="w-full bg-gold hover:bg-gold/90 text-sidebar-accent-foreground">
              アップグレード
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};