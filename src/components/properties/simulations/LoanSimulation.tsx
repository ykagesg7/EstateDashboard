import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";

interface LoanSimulationProps {
  propertyPrice: number;
}

interface LoanOption {
  bankName: string;
  interestRate: number;
}

export const LoanSimulation = ({ propertyPrice }: LoanSimulationProps) => {
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8); // デフォルトで物件価格の80%
  const [selectedBank, setSelectedBank] = useState("bank1");
  const [repaymentMethod, setRepaymentMethod] = useState<"equal-payment" | "equal-principal">("equal-payment");
  const [repaymentPeriod, setRepaymentPeriod] = useState(35); // デフォルトで35年

  // サンプルの金融機関データ
  const loanOptions: Record<string, LoanOption> = {
    bank1: { bankName: "A銀行", interestRate: 0.8 },
    bank2: { bankName: "B銀行", interestRate: 1.0 },
    bank3: { bankName: "C銀行", interestRate: 1.2 },
  };

  const calculateMonthlyPayment = () => {
    const r = loanOptions[selectedBank].interestRate / 100 / 12; // 月利
    const n = repaymentPeriod * 12; // 返済回数

    if (repaymentMethod === "equal-payment") {
      // 元利均等返済の場合
      return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      // 元金均等返済の場合（初回の返済額）
      return loanAmount / n + loanAmount * r;
    }
  };

  const calculateTotalPayment = () => {
    const monthlyPayment = calculateMonthlyPayment();
    return monthlyPayment * repaymentPeriod * 12;
  };

  const calculateTotalInterest = () => {
    return calculateTotalPayment() - loanAmount;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label>借入額</Label>
          <Input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>金融機関</Label>
          <Select value={selectedBank} onValueChange={setSelectedBank}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(loanOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>
                  {option.bankName} ({option.interestRate}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>返済方法</Label>
          <Select
            value={repaymentMethod}
            onValueChange={(value: "equal-payment" | "equal-principal") => setRepaymentMethod(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal-payment">元利均等返済</SelectItem>
              <SelectItem value="equal-principal">元金均等返済</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>返済期間（年）</Label>
          <Input
            type="number"
            value={repaymentPeriod}
            onChange={(e) => setRepaymentPeriod(Number(e.target.value))}
            min={1}
            max={35}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>毎月の返済額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateMonthlyPayment())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>総返済額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateTotalPayment())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>総利息額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateTotalInterest())}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};