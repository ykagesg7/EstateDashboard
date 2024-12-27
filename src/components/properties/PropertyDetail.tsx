import { useParams } from "react-router-dom";
import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyDocuments } from "./PropertyDocuments";
import { PropertyFinancials } from "./PropertyFinancials";
import { PropertyMaintenance } from "./PropertyMaintenance";
import { PropertySimulation } from "./simulations/PropertySimulation";
import { dummyProperties } from "@/data/dummyProperties";
import { dummyFinancialRecords } from "@/data/dummyFinancialRecords";
import { dummyMaintenanceRecords } from "@/data/dummyMaintenanceRecords";
import { dummyDocuments } from "@/data/dummyDocuments";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const CHECKLIST_ITEMS = [
  { id: "investigation", label: "物件の調査" },
  { id: "financial", label: "資金計画の確認" },
  { id: "contract", label: "契約書の確認" },
];

const STATUS_OPTIONS: Property["status"][] = ["検討中", "運用中", "契約済"];

export const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [memo, setMemo] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      const propertyData = dummyProperties.find((p) => p.id === id);
      if (propertyData) {
        setProperty(propertyData);
        
        const savedChecklist = localStorage.getItem(`checklist-${id}`);
        const savedMemo = localStorage.getItem(`memo-${id}`);
        
        if (savedChecklist) {
          setChecklist(JSON.parse(savedChecklist));
        }
        if (savedMemo) {
          setMemo(savedMemo);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`checklist-${id}`, JSON.stringify(checklist));
    }
  }, [checklist, id]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`memo-${id}`, memo);
    }
  }, [memo, id]);

  const handleStatusChange = async (newStatus: Property["status"]) => {
    if (!property || !id) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setProperty({ ...property, status: newStatus });
      toast({
        title: "ステータスを更新しました",
        description: `新しいステータス: ${newStatus}`,
      });
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!property) return <div>物件が見つかりません</div>;

  const financialRecords = dummyFinancialRecords.filter(
    (record) => record.property_id === property.id
  );
  const maintenanceRecords = dummyMaintenanceRecords.filter(
    (record) => record.property_id === property.id
  );
  const documents = dummyDocuments.filter((doc) => doc.property_id === property.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{property.name}</h1>
        <Button>編集</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報カード */}
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
                <Select
                  value={property.status}
                  onValueChange={(value: Property["status"]) => handleStatusChange(value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{property.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* チェックリストとメモカード - 検討中の物件のみ表示 */}
        {property.status === "検討中" && (
          <Card>
            <CardHeader>
              <CardTitle>購入判断チェックリスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={checklist[item.id] || false}
                      onCheckedChange={(checked) =>
                        setChecklist((prev) => ({ ...prev, [item.id]: checked === true }))
                      }
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="物件に関するメモを入力してください"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* シミュレーション - 検討中の物件のみ表示 */}
      {property.status === "検討中" && (
        <PropertySimulation propertyPrice={property.price} />
      )}

      <Tabs defaultValue="financials">
        <TabsList>
          <TabsTrigger value="financials">財務情報</TabsTrigger>
          <TabsTrigger value="maintenance">メンテナンス</TabsTrigger>
          <TabsTrigger value="documents">書類</TabsTrigger>
        </TabsList>
        <TabsContent value="financials">
          <PropertyFinancials financials={financialRecords} />
        </TabsContent>
        <TabsContent value="maintenance">
          <PropertyMaintenance maintenanceRecords={maintenanceRecords} />
        </TabsContent>
        <TabsContent value="documents">
          <PropertyDocuments documents={documents} />
        </TabsContent>
      </Tabs>
    </div>
  );
};