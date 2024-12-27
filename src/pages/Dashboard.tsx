import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/property";
import { Building, DollarSign, Wrench } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
const Dashboard = () => {
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*");
      if (error) throw error;
      return data as Property[];
    },
  });
  const { data: financials, isLoading: financialsLoading } = useQuery({
    queryKey: ["financials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
  const { data: maintenance, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
  if (propertiesLoading || financialsLoading || maintenanceLoading) {
    return <div>読み込み中...</div>;
  }
  const totalProperties = properties?.length || 0;
  const totalIncome = financials?.reduce((acc, record) => 
    record.type === "income" ? acc + Number(record.amount) : acc, 0) || 0;
  const pendingMaintenance = maintenance?.filter(record => 
    record.status === "pending").length || 0;
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総物件数</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">保留中のメンテナンス</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;