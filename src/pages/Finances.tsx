import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashflowReport } from "@/components/finances/CashflowReport";
import { FinancialReports } from "@/components/finances/FinancialReports";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinancialRecordForm } from "@/components/finances/FinancialRecordForm";

const Finances = () => {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState("cashflow");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">財務管理</h1>
        <div className="flex gap-4 items-center mb-4 md:mb-0">
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                財務記録を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しい財務記録</DialogTitle>
              </DialogHeader>
              <FinancialRecordForm onSuccess={() => setIsFormDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs
        value={selectedView}
        onValueChange={setSelectedView}
        className="w-full"
      >
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex mb-6">
          <TabsTrigger value="cashflow" className="flex-1 md:flex-none">
            キャッシュフロー
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 md:flex-none">
            レポート
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cashflow" className="m-0">
          <CashflowReport />
        </TabsContent>
        <TabsContent value="reports" className="m-0">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;