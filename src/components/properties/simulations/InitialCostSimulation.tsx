import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatters";

interface InitialCostSimulationProps {
  propertyPrice: number;
}

export const InitialCostSimulation = ({ propertyPrice }: InitialCostSimulationProps) => {
  const [brokerageFee, setBrokerageFee] = useState(propertyPrice * 0.03);
  const [registrationFee, setRegistrationFee] = useState(propertyPrice * 0.02);
  const [acquisitionTax, setAcquisitionTax] = useState(propertyPrice * 0.04);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const total = propertyPrice + brokerageFee + registrationFee + acquisitionTax;
    setTotalCost(total);
  }, [propertyPrice, brokerageFee, registrationFee, acquisitionTax]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label>物件価格</Label>
          <Input type="text" value={formatCurrency(propertyPrice)} disabled />
        </div>
        <div>
          <Label>仲介手数料</Label>
          <Input
            type="number"
            value={brokerageFee}
            onChange={(e) => setBrokerageFee(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>登記費用</Label>
          <Input
            type="number"
            value={registrationFee}
            onChange={(e) => setRegistrationFee(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>不動産取得税</Label>
          <Input
            type="number"
            value={acquisitionTax}
            onChange={(e) => setAcquisitionTax(Number(e.target.value))}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>初期費用合計</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
        </CardContent>
      </Card>
    </div>
  );
};