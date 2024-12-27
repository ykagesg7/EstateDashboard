import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FinancialRecord } from "@/types/property";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyFinancialsProps {
  financials: FinancialRecord[]; // propertyId を financials に変更
}

export const PropertyFinancials = ({ financials }: PropertyFinancialsProps) => {
  const { data: fetchfinancials, isLoading } = useQuery({
    queryKey: ["financials", financials],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .eq("property_id", financials)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as FinancialRecord[];
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (!financials?.length) return <div>財務記録がありません</div>;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {financials.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <p className="font-medium">{record.type}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.date)}
                </p>
                {record.description && (
                  <p className="text-sm text-muted-foreground">
                    {record.description}
                  </p>
                )}
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(record.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};