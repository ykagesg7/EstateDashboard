import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/formatters";
import { Building2, BedDouble, Bath, SquareStack, TrendingUp, PiggyBank, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface PropertyCardProps {
  property: Property;
  userRole?: string | null;
}

export const PropertyCard = ({ property, userRole }: PropertyCardProps) => {
  const { session } = useAuth();
  const isOwner = session?.user?.id === property.user_id;
  const [imageError, setImageError] = useState(false);
  
  // デバッグ用
  console.log("Property images:", property.images);
  console.log("Images type:", Array.isArray(property.images) ? "Array" : typeof property.images);
  
  // 主要画像のURLを取得（より堅牢な方法）
  const primaryImage = Array.isArray(property.images) && property.images.length > 0
    ? (property.images.find(img => img.is_primary)?.url || property.images[0]?.url)
    : null;

  console.log("Primary image URL:", primaryImage);

  // 画像URLの代替手段
  const getImageUrl = (url: string) => {
    if (!url) return null;
    
    try {
      // 既存URLから情報を抽出
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];  // ファイル名部分の取得
      
      // 簡略化したURL形式に変換
      return `https://amrleuqngqtfbrjadcky.supabase.co/storage/v1/object/public/property-images/${property.id}/${fileName}`;
    } catch (e) {
      return url;
    }
  };

  // 使用例
  const primaryImageUrl = primaryImage ? getImageUrl(primaryImage) : null;

  // 利回り計算
  const calculateYield = () => {
    // 年間家賃収入（月額家賃 × 12）
    const annualRentalIncome = property.rental_plans?.[0]?.monthly_rent * 12 || 0;
    
    // 年間経費の計算
    let annualExpenses = 0;
    property.expense_plans?.forEach(expense => {
      if (expense.frequency === 'monthly') {
        annualExpenses += expense.amount * 12;
      } else if (expense.frequency === 'yearly') {
        annualExpenses += expense.amount;
      }
    });
    
    // 純年間収入
    const netAnnualIncome = annualRentalIncome - annualExpenses;
    
    // 粗利回り（年間家賃収入 ÷ 物件価格）
    const grossYield = property.price > 0 ? (annualRentalIncome / property.price) * 100 : 0;
    
    // 純利回り（純年間収入 ÷ 物件価格）
    const netYield = property.price > 0 ? (netAnnualIncome / property.price) * 100 : 0;
    
    return {
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      monthlyIncome: annualRentalIncome / 12,
      monthlyExpenses: annualExpenses / 12,
      monthlyCashflow: (netAnnualIncome / 12)
    };
  };

  const investmentData = calculateYield();
  const hasRentalPlan = property.rental_plans && property.rental_plans.length > 0;

  return (
    <Link to={`/properties/${property.id}`}>
      <Card className={userRole && property.user?.role === userRole ? "bg-accent hover:shadow-lg transition-shadow" : "hover:shadow-lg transition-shadow"}>
        {/* サムネイル画像エリア */}
        <div className="relative h-40 bg-muted overflow-hidden">
          {primaryImageUrl && !imageError ? (
            <img 
              src={primaryImageUrl}
              alt={property.name || "物件画像"} 
              className="object-cover w-full h-full"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // フォールバック: 直接バケットアクセスを試みる
                try {
                  const urlParts = (primaryImageUrl as string).split('/');
                  const fileName = urlParts[urlParts.length - 1];
                  const alternateUrl = `https://amrleuqngqtfbrjadcky.supabase.co/storage/v1/object/public/property-images/${fileName}`;
                  e.currentTarget.src = alternateUrl;
                  return;
                } catch (err) {
                  setImageError(true);
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Building2 className="h-12 w-12" />
            </div>
          )}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
              +{property.images.length - 1}
            </div>
          )}
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <Badge className={clsx(
                property.status === '検討中' && "bg-yellow-500 text-white",
                property.status === '契約済' && "bg-gray-500 text-white",
              )}
              variant={property.status === '運用中' ? 'default' : 'secondary'}
            >
              {property.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{property.address}</p>
            <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
            
            {/* 基本情報 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                <span className="text-sm">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span className="text-sm">{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <SquareStack className="h-4 w-4" />
                <span className="text-sm">{property.square_footage}㎡</span>
              </div>
            </div>
            
            <Separator />
            
            {/* 投資指標 */}
            {hasRentalPlan ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">利回り</span>
                  </div>
                  <span className="text-green-500 font-semibold">{investmentData.netYield}%</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>月間収入</span>
                    <span className="font-medium">{formatCurrency(investmentData.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>月間支出</span>
                    <span className="font-medium text-red-500">-{formatCurrency(investmentData.monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span>キャッシュフロー</span>
                    <span className={investmentData.monthlyCashflow >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatCurrency(investmentData.monthlyCashflow)}
                    </span>
                  </div>
                  
                  {/* キャッシュフロー視覚化 */}
                  <Progress 
                    value={investmentData.monthlyCashflow > 0 ? 
                      (investmentData.monthlyIncome > 0 ? 
                        (investmentData.monthlyCashflow / investmentData.monthlyIncome) * 100 : 0) : 0} 
                    className="h-1.5" 
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                収益情報がまだ登録されていません
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground pt-0 justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(property.created_at), "yyyy年MM月dd日")}</span>
          </div>
          {isOwner && <span className="text-xs">あなたの物件</span>}
        </CardFooter>
      </Card>
    </Link>
  );
};