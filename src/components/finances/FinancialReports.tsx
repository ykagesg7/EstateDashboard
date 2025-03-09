import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

export const FinancialReports = () => {
  const [selectedReport, setSelectedReport] = useState("monthly");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["financialReports", selectedReport, dateRange],
    queryFn: async () => {
      // データ取得と加工ロジック
      // 実際の実装はデータ構造に合わせて調整が必要
      const incomeResponse = await supabase
        .from("financial_records")
        .select("*")
        .eq("type", "income")
        .gte("date", dateRange.startDate.toISOString().split("T")[0])
        .lte("date", dateRange.endDate.toISOString().split("T")[0]);

      const expenseResponse = await supabase
        .from("financial_records")
        .select("*")
        .eq("type", "expense")
        .gte("date", dateRange.startDate.toISOString().split("T")[0])
        .lte("date", dateRange.endDate.toISOString().split("T")[0]);

      if (incomeResponse.error) throw incomeResponse.error;
      if (expenseResponse.error) throw expenseResponse.error;

      const incomeData = incomeResponse.data;
      const expenseData = expenseResponse.data;

      // 月次データの場合
      if (selectedReport === "monthly") {
        // 月ごとに集計
        const monthlyData = new Map();
        
        // 収入データの集計
        incomeData.forEach((record) => {
          const month = record.date.substring(0, 7);
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { month, income: 0, expense: 0 });
          }
          monthlyData.get(month).income += record.amount;
        });
        
        // 支出データの集計
        expenseData.forEach((record) => {
          const month = record.date.substring(0, 7);
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { month, income: 0, expense: 0 });
          }
          monthlyData.get(month).expense += record.amount;
        });
        
        // 月ごとにソート
        return Array.from(monthlyData.values())
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(item => ({
            ...item,
            profit: item.income - item.expense,
          }));
      }
      
      // カテゴリ別支出の場合
      if (selectedReport === "category") {
        // カテゴリごとに集計
        const categoryData = new Map();
        
        expenseData.forEach((record) => {
          const category = record.description || "その他";
          if (!categoryData.has(category)) {
            categoryData.set(category, { category, amount: 0 });
          }
          categoryData.get(category).amount += record.amount;
        });
        
        return Array.from(categoryData.values())
          .sort((a, b) => b.amount - a.amount);
      }
      
      return [];
    },
  });

  const refreshData = () => {
    // データ更新
  };

  if (isLoading) return <div>読み込み中...</div>;

  // チャートデータの構築
  const getChartData = () => {
    if (!reportData?.length) return null;
    
    if (selectedReport === "monthly") {
      // 月次推移チャート
      return {
        labels: reportData.map((item) => item.month),
        datasets: [
          {
            label: "収入",
            data: reportData.map((item) => item.income),
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderColor: "rgb(34, 197, 94)",
          },
          {
            label: "支出",
            data: reportData.map((item) => item.expense),
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgb(239, 68, 68)",
          },
          {
            label: "利益",
            data: reportData.map((item) => item.profit),
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgb(59, 130, 246)",
          },
        ],
      };
    }
    
    if (selectedReport === "category") {
      // カテゴリ別円グラフ
      return {
        labels: reportData.map((item) => item.category),
        datasets: [
          {
            data: reportData.map((item) => item.amount),
            backgroundColor: [
              "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
              "#FF9F40", "#8CD867", "#EA80FC", "#FFD54F", "#90CAF9",
            ],
          },
        ],
      };
    }
    
    return null;
  };
  
  const chartData = getChartData();

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4">
        <CardTitle>財務レポート</CardTitle>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Tabs
            value={selectedReport}
            onValueChange={setSelectedReport}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="monthly">月次推移</TabsTrigger>
              <TabsTrigger value="category">カテゴリ別支出</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <DatePicker
              date={dateRange.startDate}
              onDateChange={(date) => setDateRange({...dateRange, startDate: date || new Date()})}
            />
            <DatePicker
              date={dateRange.endDate}
              onDateChange={(date) => setDateRange({...dateRange, endDate: date || new Date()})}
            />
            <Button onClick={refreshData}>更新</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!reportData?.length ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">データがありません</p>
            <p className="text-sm">この期間の財務記録がありません。期間を変更するか、新しい財務記録を追加してください。</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="h-[400px]">
              {selectedReport === "monthly" && chartData && (
                <LineChart data={chartData} />
              )}
              {selectedReport === "category" && chartData && (
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2">
                    <PieChart data={chartData} />
                  </div>
                  <div className="w-full md:w-1/2">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left">カテゴリ</th>
                          <th className="text-right">金額</th>
                          <th className="text-right">割合</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, index) => {
                          const total = reportData.reduce((sum, i) => sum + i.amount, 0);
                          const percentage = (item.amount / total * 100).toFixed(1);
                          
                          return (
                            <tr key={index}>
                              <td className="text-left">{item.category}</td>
                              <td className="text-right">{formatCurrency(item.amount)}</td>
                              <td className="text-right">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {selectedReport === "monthly" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">月</th>
                      <th className="text-right">収入</th>
                      <th className="text-right">支出</th>
                      <th className="text-right">利益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr key={index}>
                        <td className="text-left">{item.month}</td>
                        <td className="text-right">{formatCurrency(item.income)}</td>
                        <td className="text-right">{formatCurrency(item.expense)}</td>
                        <td className={`text-right ${item.profit < 0 ? "text-red-500" : "text-green-500"}`}>
                          {formatCurrency(item.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 