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
  workspace_id: string | null;
  user?: { role: string | null; }
  rental_plans?: {
    monthly_rent: number;
    start_date?: string;
    end_date?: string | null;
  }[];
  expense_plans?: {
    amount: number;
    frequency: 'monthly' | 'yearly';
    expense_type?: string;
  }[];
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  user_id: string;
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  user_id: string;
  name: string;
  url: string;
  file_type: string;
  size: number;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  property_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  cost: number | null;
  created_at: string;
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
