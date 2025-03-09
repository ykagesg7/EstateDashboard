import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserData } from "@/hooks/useUserData";
import { userNavItems } from "@/config/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SheetClose } from "@/components/ui/sheet";
import { useEffect } from "react";
import EnhancedAvatar from "@/components/avatar/EnhancedAvatar";

interface UserNavProps {
  mobileView?: boolean;
}

export const UserNav = ({ mobileView = false }: UserNavProps) => {
  const { userData, isLoading, getInitials, handleLogout } = useUserData();
  const { toast } = useToast();

  // ユーザー情報のデバッグ
  useEffect(() => {
    if (userData) {
      console.log('UserNav: User data loaded', { 
        name: userData.name, 
        avatar: userData.avatar_url?.substring(0, 100) + '...' 
      });
    }
  }, [userData]);

  // メニュー項目がクリックされたときの処理
  const handleMenuItemClick = (item: typeof userNavItems[0]) => {
    if (item.isAction && item.href === '#logout') {
      handleLogout();
    }
  };

  // 各メニュー項目のレンダリング
  const renderMenuItem = (item: typeof userNavItems[0], isMobile: boolean) => {
    // ログアウトアクションの場合
    if (item.isAction) {
      const content = (
        <div className="flex items-center">
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </div>
      );

      return (
        <Button
          key={item.label}
          variant="ghost"
          size={isMobile ? "default" : "sm"}
          className="w-full justify-start"
          onClick={() => handleMenuItemClick(item)}
        >
          {content}
        </Button>
      );
    }

    // 通常のリンクの場合
    const linkContent = (
      <Button
        variant="ghost"
        size={isMobile ? "default" : "sm"}
        className="w-full justify-start"
        asChild
      >
        <Link to={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      </Button>
    );

    // モバイル表示の場合はSheetCloseでラップ
    if (isMobile) {
      return (
        <SheetClose key={item.label} asChild>
          {linkContent}
        </SheetClose>
      );
    }

    return <div key={item.label}>{linkContent}</div>;
  };

  // モバイル表示のときは異なるレイアウトを返す
  if (mobileView) {
    return (
      <div className="border-t mt-4 pt-4 px-2">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <EnhancedAvatar
            src={userData?.avatar_url}
            alt={`${userData?.name || "ユーザー"}のアバター`}
            fallbackText={isLoading ? "..." : getInitials(userData?.name)}
            className="h-10 w-10"
            size={40}
          />
          <div>
            <p className="font-medium text-sm">
              {isLoading ? "読み込み中..." : userData?.name || "ユーザー"}
            </p>
            {userData?.email && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{userData.email}</p>
            )}
          </div>
        </div>
        <div className="grid gap-1">
          {userNavItems.map((item) => renderMenuItem(item, true))}
        </div>
      </div>
    );
  }

  // デスクトップ表示
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-2 hover:bg-accent">
          <EnhancedAvatar
            src={userData?.avatar_url}
            alt={`${userData?.name || "ユーザー"}のアバター`}
            fallbackText={isLoading ? "..." : getInitials(userData?.name)}
            className="h-8 w-8"
            size={32}
          />
          <span className="hidden md:inline">
            {isLoading ? "読み込み中..." : userData?.name || "ユーザー"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">
              {isLoading ? "読み込み中..." : userData?.name || "ユーザー"}
            </p>
            {userData?.email && (
              <p className="text-xs text-muted-foreground">{userData.email}</p>
            )}
          </div>
          <div className="border-t pt-2 grid gap-1">
            {userNavItems.map((item) => renderMenuItem(item, false))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 