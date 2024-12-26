import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MaintenanceRecord } from "@/types/property";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyMaintenanceProps {
  propertyId: string;
}

export const PropertyMaintenance = ({ propertyId }: PropertyMaintenanceProps) => {
  const { data: maintenance, isLoading } = useQuery({
    queryKey: ["maintenance", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("property_id", propertyId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data as MaintenanceRecord[];
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (!maintenance?.length) return <div>メンテナンス記録がありません</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {maintenance.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{record.title}</p>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  予定日: {record.scheduled_date ? formatDate(record.scheduled_date) : "未定"}
                </p>
                {record.completed_date && (
                  <p className="text-sm text-muted-foreground">
                    完了日: {formatDate(record.completed_date)}
                  </p>
                )}
                {record.description && (
                  <p className="text-sm text-muted-foreground">
                    {record.description}
                  </p>
                )}
              </div>
              {record.cost && (
                <p className="text-lg font-bold">
                  {formatCurrency(record.cost)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};