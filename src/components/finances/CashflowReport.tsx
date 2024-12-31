import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MonthlyCashflow } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CashflowReportProps {
  propertyId?: string;
}

export const CashflowReport = ({ propertyId }: CashflowReportProps) => {
  const { data: cashflow, isLoading } = useQuery({
    queryKey: ["cashflow", propertyId],
    queryFn: async () => {
      let query = supabase
        .from("monthly_cashflow")
        .select("*")
        .order("month", { ascending: false });

      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MonthlyCashflow[];
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (!cashflow?.length) return <div>データがありません</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>キャッシュフローレポート</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>物件名</TableHead>
                <TableHead>月</TableHead>
                <TableHead>家賃収入</TableHead>
                <TableHead>経費</TableHead>
                <TableHead>純収入</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashflow.map((record) => (
                <TableRow key={`${record.property_id}-${record.month}`}>
                  <TableCell>{record.property_name}</TableCell>
                  <TableCell>{formatDate(record.month)}</TableCell>
                  <TableCell>{formatCurrency(record.rental_income)}</TableCell>
                  <TableCell>{formatCurrency(record.expenses)}</TableCell>
                  <TableCell>{formatCurrency(record.net_cashflow)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};