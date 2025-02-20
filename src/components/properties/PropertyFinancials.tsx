import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FinancialRecord } from "@/types/property";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyFinancialsProps {
  propertyId: string;
}

export const PropertyFinancials = ({ propertyId }: PropertyFinancialsProps) => {
  const { data: financials, isLoading, error } = useQuery({
    queryKey: ["financials", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .eq("property_id", propertyId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as FinancialRecord[];
    },
    enabled: !!propertyId,
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>財務記録の読み込みに失敗しました</div>;
  if (!financials?.length) return <div>財務記録がありません</div>;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {financials?.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <p className="font-medium">{record.type}</p >
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.date)}
                </p >
                {record.description && (
                  <p className="text-sm text-muted-foreground">
                    {record.description}
                  </p >
                )}
              </div >
              <p className="text-lg font-bold">
                {formatCurrency(record.amount)}
              </p >
            </div >
          ))}
        </div >
      </CardContent >
    </Card >
  );
};