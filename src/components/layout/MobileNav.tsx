import { Home, Building, DollarSign, Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  { icon: Home, label: "ダッシュボード", href: "/dashboard" },
  { icon: Building, label: "物件一覧", href: "/properties" },
  { icon: DollarSign, label: "財務管理", href: "/finances" },
  { icon: Settings, label: "設定", href: "/settings" },
];

export const MobileNav = () => {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between bg-background border-b md:hidden z-50">
      <h1 className="text-xl font-bold">PropManager</h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>メニュー</SheetTitle>
          </SheetHeader>
          <nav className="mt-8">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};