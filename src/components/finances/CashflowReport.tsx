import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { getMonthRange } from "@/utils/date";

interface CashflowReportProps {
  propertyId?: string;
}

export const CashflowReport = ({ propertyId }: CashflowReportProps) => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    endDate: new Date(),
  });
  
  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(propertyId);

  const { data: cashflow, isLoading } = useQuery({
    queryKey: ["cashflow", selectedPropertyId, dateRange],
    queryFn: async () => {
      // 収入データの取得
      let incomeQuery = supabase
        .from("financial_records")
        .select(`
          property_id,
          properties:property_id (
            name
          ),
          user_id,
          date,
          amount,
          type
        `)
        .eq('type', 'income')
        .gte('date', dateRange.startDate.toISOString().split('T')[0])
        .lte('date', dateRange.endDate.toISOString().split('T')[0])
        .order("date", { ascending: false });

      if (selectedPropertyId) {
        incomeQuery = incomeQuery.eq("property_id", selectedPropertyId);
      }

      const incomeResult = await incomeQuery;
      if (incomeResult.error) throw incomeResult.error;
      
      // 支出データの取得
      let expenseQuery = supabase
        .from("financial_records")
        .select(`
          property_id,
          properties:property_id (
            name
          ),
          user_id,
          date,
          amount,
          type
        `)
        .eq('type', 'expense')
        .gte('date', dateRange.startDate.toISOString().split('T')[0])
        .lte('date', dateRange.endDate.toISOString().split('T')[0])
        .order("date", { ascending: false });

      if (selectedPropertyId) {
        expenseQuery = expenseQuery.eq("property_id", selectedPropertyId);
      }

      const expenseResult = await expenseQuery;
      if (expenseResult.error) throw expenseResult.error;
      
      // データを物件ごと・月ごとに集計
      const cashflowMap = new Map<string, MonthlyCashflow>();
      
      // 収入データの集計
      incomeResult.data.forEach(record => {
        const key = `${record.property_id}-${record.date.substring(0, 7)}`;
        const existing = cashflowMap.get(key) || {
          property_id: record.property_id,
          property_name: record.properties?.name || 'Unknown',
          user_id: record.user_id,
          month: record.date.substring(0, 7),
          rental_income: 0,
          expenses: 0,
          net_cashflow: 0
        };
        
        existing.rental_income += record.amount;
        existing.net_cashflow = existing.rental_income - existing.expenses;
        cashflowMap.set(key, existing);
      });
      
      // 支出データの集計
      expenseResult.data.forEach(record => {
        const key = `${record.property_id}-${record.date.substring(0, 7)}`;
        const existing = cashflowMap.get(key) || {
          property_id: record.property_id,
          property_name: record.properties?.name || 'Unknown',
          user_id: record.user_id,
          month: record.date.substring(0, 7),
          rental_income: 0,
          expenses: 0,
          net_cashflow: 0
        };
        
        existing.expenses += record.amount;
        existing.net_cashflow = existing.rental_income - existing.expenses;
        cashflowMap.set(key, existing);
      });
      
      return Array.from(cashflowMap.values()).sort((a, b) => 
        b.month.localeCompare(a.month)
      );
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["cashflow"] });
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <CardTitle>キャッシュフローレポート</CardTitle>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <Select 
              value={selectedPropertyId || ""} 
              onValueChange={(value) => setSelectedPropertyId(value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべての物件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての物件</SelectItem>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full md:w-2/3">
            <div className="flex-1">
              <DatePicker
                date={dateRange.startDate}
                onDateChange={(date) => setDateRange({...dateRange, startDate: date || new Date()})}
              />
            </div>
            <div className="flex-1">
              <DatePicker
                date={dateRange.endDate}
                onDateChange={(date) => setDateRange({...dateRange, endDate: date || new Date()})}
              />
            </div>
            <Button onClick={refreshData}>更新</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!cashflow?.length ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">データがありません</p>
            <p className="text-sm">この期間のキャッシュフロー記録がありません。期間を変更するか、新しい財務記録を追加してください。</p>
          </div>
        ) : (
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
                    <TableCell className={record.net_cashflow < 0 ? "text-red-500" : "text-green-500"}>
                      {formatCurrency(record.net_cashflow)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};