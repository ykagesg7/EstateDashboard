import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialCostSimulation } from "./InitialCostSimulation";
import { AnnualCashflowSimulation } from "./AnnualCashflowSimulation";
import { LoanSimulation } from "./LoanSimulation";
import { Card } from "@/components/ui/card";

interface PropertySimulationProps {
  propertyPrice: number;
}

export const PropertySimulation = ({ propertyPrice }: PropertySimulationProps) => {
  return (
    <Card className="p-6">
      <Tabs defaultValue="initial-cost">
        <TabsList className="w-full">
          <TabsTrigger value="initial-cost">初期費用</TabsTrigger>
          <TabsTrigger value="cashflow">年間収支</TabsTrigger>
          <TabsTrigger value="loan">ローン</TabsTrigger>
        </TabsList>
        <TabsContent value="initial-cost">
          <InitialCostSimulation propertyPrice={propertyPrice} />
        </TabsContent>
        <TabsContent value="cashflow">
          <AnnualCashflowSimulation propertyPrice={propertyPrice} />
        </TabsContent>
        <TabsContent value="loan">
          <LoanSimulation propertyPrice={propertyPrice} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};