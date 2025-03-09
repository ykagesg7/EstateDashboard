import { Award, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useSearch } from "@/hooks/useSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mainNavItems } from "@/config/navigation";
import { UserNav } from "./UserNav";

export const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, searchResults, isLoading, isSearching } = useSearch();

  // 物件をクリックしたときの処理
  const handlePropertyClick = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
    setSearchTerm('');
  };

  return (
    <div className="w-full border-b premium-shadow">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* ロゴとブランド名 */}
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-bold premium-text-gradient">PropManager</h1>
        </div>

        {/* メインナビゲーション - デスクトップ表示 */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {mainNavItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === item.href ? "bg-accent" : "",
                    "gap-2"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* 検索バー - デスクトップ表示 */}
        <div className="relative max-w-sm w-full hidden lg:flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <DropdownMenu open={isSearching && searchResults.length > 0}>
            <DropdownMenuTrigger asChild>
              <div className="w-full">
                <Input 
                  placeholder="物件を検索..." 
                  className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/20 hover:bg-secondary/70 transition-colors w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {isLoading ? (
                <div className="p-2 text-sm text-center">検索中...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((property) => (
                  <DropdownMenuItem 
                    key={property.id}
                    onClick={() => handlePropertyClick(property.id)}
                    className="cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{property.name}</div>
                      <div className="text-xs text-muted-foreground">{property.address}</div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-2 text-sm text-center">
                  {searchTerm.length >= 2 ? "検索結果がありません" : "検索語を入力してください"}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ユーザーナビゲーション */}
        <UserNav />
      </div>
    </div>
  );
}; 