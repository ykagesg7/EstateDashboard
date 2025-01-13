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
  workspace_id: string;
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

import React from 'react';
import { PropertyList } from '@/components/properties/PropertyList';
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { Tables } from '@/integrations/supabase/types';

const Properties = () => {
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      if (error) {
        throw error;
      }
      return data as Property[];
    },
  });

  return (
    <div>
      <PropertyList properties={properties || []} isLoading={isLoading} onRefresh={refetch} />
    </div>
  );
};

export default Properties;