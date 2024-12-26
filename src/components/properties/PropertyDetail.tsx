import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyDocuments } from "./PropertyDocuments";
import { PropertyFinancials } from "./PropertyFinancials";
import { PropertyMaintenance } from "./PropertyMaintenance";

export const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Property;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (!property) return <div>物件が見つかりません</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{property.name}</h1>
        <Button>編集</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">住所</p>
              <p>{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">価格</p>
              <p className="text-xl font-bold">{formatCurrency(property.price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">寝室</p>
              <p>{property.bedrooms}部屋</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">バスルーム</p>
              <p>{property.bathrooms}部屋</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">面積</p>
              <p>{property.square_footage}㎡</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ステータス</p>
              <p>{property.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="financials">
        <TabsList>
          <TabsTrigger value="financials">財務情報</TabsTrigger>
          <TabsTrigger value="maintenance">メンテナンス</TabsTrigger>
          <TabsTrigger value="documents">書類</TabsTrigger>
        </TabsList>
        <TabsContent value="financials">
          <PropertyFinancials propertyId={property.id} />
        </TabsContent>
        <TabsContent value="maintenance">
          <PropertyMaintenance propertyId={property.id} />
        </TabsContent>
        <TabsContent value="documents">
          <PropertyDocuments propertyId={property.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};