import { Menu, Award } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { mainNavItems } from "@/config/navigation";
import { UserNav } from "./UserNav";

export const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-gold" />
        <h1 className="text-lg font-bold premium-text-gradient">PropManager</h1>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              PropManager
            </SheetTitle>
          </SheetHeader>
          
          {/* メインメニュー */}
          <div className="py-4">
            <div className="px-4 mb-2">
              <h3 className="text-xs uppercase font-medium text-muted-foreground">メインメニュー</h3>
            </div>
            <nav className="grid gap-1 px-2">
              {mainNavItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                      location.pathname === item.href ? "bg-accent" : ""
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
          
          {/* ユーザーナビゲーション */}
          <UserNav mobileView={true} />
        </SheetContent>
      </Sheet>
    </div>
  );
};