import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashflowReport } from "@/components/finances/CashflowReport";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Finances = () => {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState("cashflow");

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">財務管理</h1>
        <div className="w-full md:w-auto">
          <Tabs
            value={selectedView}
            onValueChange={setSelectedView}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
              <TabsTrigger value="cashflow" className="flex-1 md:flex-none">
                キャッシュフロー
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 md:flex-none">
                レポート
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-6">
        <TabsContent value="cashflow" className="m-0">
          <CashflowReport />
        </TabsContent>
        <TabsContent value="reports" className="m-0">
          {/* レポート機能は次のフェーズで実装予定 */}
          <div>レポート機能は開発中です</div>
        </TabsContent>
      </div>
    </div>
  );
};

export default Finances;