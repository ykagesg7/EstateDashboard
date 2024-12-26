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
  status: 'active' | 'inactive' | 'pending';  
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

export interface MaintenanceRecord {
  id: string;
  property_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  scheduled_date: string | null;
  completed_date: string | null;
  cost: number | null;
  created_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  size: number | null;
  created_at: string;
}