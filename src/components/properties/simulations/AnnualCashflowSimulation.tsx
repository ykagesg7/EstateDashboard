import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatters";

interface AnnualCashflowSimulationProps {
  propertyPrice: number;
}

export const AnnualCashflowSimulation = ({ propertyPrice }: AnnualCashflowSimulationProps) => {
  const [rentalIncome, setRentalIncome] = useState(0);
  const [managementFee, setManagementFee] = useState(0);
  const [maintenanceFee, setMaintenanceFee] = useState(0);
  const [propertyTax, setPropertyTax] = useState(propertyPrice * 0.017);
  const [cityPlanningTax, setCityPlanningTax] = useState(propertyPrice * 0.003);
  const [loanPayment, setLoanPayment] = useState(0);
  
  const [grossReturn, setGrossReturn] = useState(0);
  const [netReturn, setNetReturn] = useState(0);
  const [cashOnCashReturn, setCashOnCashReturn] = useState(0);

  useEffect(() => {
    // 表面利回り計算
    const grossReturnRate = (rentalIncome * 12 / propertyPrice) * 100;
    setGrossReturn(grossReturnRate);

    // 実質利回り（NOI利回り）計算
    const annualExpenses = managementFee + maintenanceFee + propertyTax + cityPlanningTax;
    const noi = (rentalIncome * 12) - annualExpenses;
    const netReturnRate = (noi / propertyPrice) * 100;
    setNetReturn(netReturnRate);

    // 自己資金利回り（CCR）計算
    const annualCashFlow = noi - (loanPayment * 12);
    const downPayment = propertyPrice * 0.2; // 頭金20%と仮定
    const cashOnCashReturnRate = (annualCashFlow / downPayment) * 100;
    setCashOnCashReturn(cashOnCashReturnRate);
  }, [propertyPrice, rentalIncome, managementFee, maintenanceFee, propertyTax, cityPlanningTax, loanPayment]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label>月額家賃収入</Label>
          <Input
            type="number"
            value={rentalIncome}
            onChange={(e) => setRentalIncome(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>月額管理費</Label>
          <Input
            type="number"
            value={managementFee}
            onChange={(e) => setManagementFee(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>年間修繕費</Label>
          <Input
            type="number"
            value={maintenanceFee}
            onChange={(e) => setMaintenanceFee(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>固定資産税（年額）</Label>
          <Input
            type="number"
            value={propertyTax}
            onChange={(e) => setPropertyTax(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>都市計画税（年額）</Label>
          <Input
            type="number"
            value={cityPlanningTax}
            onChange={(e) => setCityPlanningTax(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>月額ローン返済額</Label>
          <Input
            type="number"
            value={loanPayment}
            onChange={(e) => setLoanPayment(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>表面利回り</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{grossReturn.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>実質利回り（NOI）</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{netReturn.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>自己資金利回り（CCR）</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cashOnCashReturn.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};