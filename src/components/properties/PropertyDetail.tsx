import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyFinancials } from "./PropertyFinancials";
import { PropertyMaintenance } from "./PropertyMaintenance";
import { PropertyDocuments } from "./PropertyDocuments";
// import { dummyMaintenanceRecords } from "@/data/dummyMaintenanceRecords"; // ダミーデータのインポートを削除
// import { dummyDocuments } from "@/data/dummyDocuments"; // ダミーデータのインポートを削除
import { PropertySimulation } from "./simulations/PropertySimulation";

const STATUS_OPTIONS = ["検討中", "契約済", "運用中"];
const CHECKLIST_ITEMS = [
  { id: "condition", label: "物件の状態は良好か" },
  { id: "location", label: "ロケーションは適切か" },
  { id: "price_reasonable", label: "価格は妥当か" },
  { id: "investment_potential", label: "投資 потенциалはあるか" },
];

interface PropertyDetailProps {
  propertyId: string | undefined;
}

export const PropertyDetail = ({ propertyId }: PropertyDetailProps) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [memo, setMemo] = useState("");
  // useParams はこのコンポーネントでは不要です。PropertyDetails で取得した id を props で受け取ります。
  // const { id } = useParams();

  useEffect(() => {
    if (propertyId) {
      setIsLoading(true);
      supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching property:", error);
            toast({
              title: "エラー",
              description: "物件情報の取得に失敗しました",
              variant: "destructive",
            });
          } else {
            setProperty(data);
          }
          setIsLoading(false);
        });

      // propertyId が変更された場合に localStorage からデータを取得するように修正
      const fetchLocalStorageData = () => {
        const savedChecklist = localStorage.getItem(`checklist-${propertyId}`);
        const savedMemo = localStorage.getItem(`memo-${propertyId}`);

        if (savedChecklist) {
          setChecklist(JSON.parse(savedChecklist));
        }
        if (savedMemo) {
          setMemo(savedMemo);
        }
      }
      fetchLocalStorageData();
    }
  }, [propertyId]); // 依存配列から id を削除し、propertyId の変更のみを監視

  useEffect(() => {
    if (propertyId) { // propertyId が存在する場合のみ localStorage に保存
      localStorage.setItem(`checklist-${propertyId}`, JSON.stringify(checklist));
    }
  }, [checklist, propertyId]); // 依存配列に propertyId を追加

  useEffect(() => {
    if (propertyId) { // propertyId が存在する場合のみ localStorage に保存
      localStorage.setItem(`memo-${propertyId}`, memo);
    }
  }, [memo, propertyId]); // 依存配列に propertyId を追加

  const handleStatusChange = async (newStatus: Property["status"]) => {
    if (!property || !propertyId) return; // propertyId が存在するか確認

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId); // propertyId を使用

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

  if (isLoading) return <div>物件情報を読み込み中...</div>;
  if (!property) return <div>物件が見つかりません</div>;

  // ダミーデータのフィルタリングを削除
  // const maintenanceRecords = dummyMaintenanceRecords.filter(
  //   (record) => record.property_id === property.id
  // );
  // const documents = dummyDocuments.filter((doc) => doc.property_id === property.id);

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
          </CardHeader >
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">住所</p >
                <p>{property.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">価格</p >
                <p className="text-xl font-bold">{formatCurrency(property.price)}</p >
              </div>
              <div>
                <p className="text-sm text-muted-foreground">寝室</p >
                <p>{property.bedrooms}部屋</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">バスルーム</p >
                <p>{property.bathrooms}部屋</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">面積</p >
                <p>{property.square_footage}㎡</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ステータス</p >
                <Select
                  value={property.status}
                  onValueChange={(value: Property["status"]) => handleStatusChange(value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{property.status}</SelectValue>
                  </SelectTrigger >
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem >
                    ))}
                  </SelectContent >
                </Select >
              </div>
            </div>
          </CardContent >
        </Card >

        {/* チェックリストとメモカード - 検討中の物件のみ表示 */}
        {property.status === "検討中" && (
          <Card>
            <CardHeader>
              <CardTitle>購入判断チェックリスト</CardTitle>
            </CardHeader >
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
                    <Label htmlFor={item.id}>{item.label}</Label >
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">メモ</Label >
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="物件に関するメモを入力してください"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent >
          </Card >
        )}
      </div>

      {/* シミュレーション - 検討中の物件のみ表示 */}
      {property.status === "検討中" && (
        <PropertySimulation propertyPrice={property.price} />
      )}

<Tabs defaultValue="financials">
        <TabsList>
          <TabsTrigger value="financials">財務情報</TabsTrigger >
          <TabsTrigger value="maintenance">メンテナンス</TabsTrigger >
          <TabsTrigger value="documents">書類</TabsTrigger >
        </TabsList >
        <TabsContent value="financials">
          {property && <PropertyFinancials propertyId={property.id} />}
        </TabsContent >
        <TabsContent value="maintenance">
          {property && <PropertyMaintenance propertyId={property.id} />}
        </TabsContent >
        <TabsContent value="documents">
          {property && <PropertyDocuments propertyId={property.id} />}
        </TabsContent >
      </Tabs >
    </div>
  );
};