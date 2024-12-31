export interface Property {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  description: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  status: '検討中' | '運用中' | '契約済';
  latitude: number | null;
  longitude: number | null;
}

export interface FinancialRecord {
  id: string;
  property_id: string;
  user_id: string;
  type: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface RentalPlan {
  id: string;
  property_id: string;
  user_id: string;
  monthly_rent: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface ExpensePlan {
  id: string;
  property_id: string;
  user_id: string;
  expense_type: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface MonthlyCashflow {
  property_id: string;
  property_name: string;
  user_id: string;
  month: string;
  rental_income: number;
  expenses: number;
  net_cashflow: number;
}
