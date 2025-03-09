import React, { useState } from 'react';
import { PropertyList } from '@/components/properties/PropertyList';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import { 
  Property, 
  PropertyImage, 
  FinancialRecord, 
  RentalPlan, 
  ExpensePlan, 
  MonthlyCashflow 
} from '@/types/property';
import { useToast } from "@/components/ui/use-toast";

const Properties = () => {
  const queryClient = useQueryClient();
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          rental_plans(monthly_rent),
          expense_plans(amount, frequency),
          property_images(*)
        `);
      if (error) {
        throw error;
      }
      
      console.log("Raw data from Supabase:", JSON.stringify(data[0]?.property_images, null, 2));
      
      const isPropertyImage = (obj: any): obj is PropertyImage => {
        return obj && typeof obj === 'object' && 'url' in obj && 'property_id' in obj;
      };
      
      const mappedProperties = data.map(property => ({
        ...property,
        images: Array.isArray(property.property_images) 
          ? property.property_images.filter(isPropertyImage)
          : []
      }));
      
      console.log("Mapped properties data:", mappedProperties);
      return mappedProperties as Property[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">物件一覧</h1>
      <PropertyList 
        properties={properties || []} 
        isLoading={isLoading} 
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
        onRefresh={refetch}
      />
    </div>
  );
};

export default Properties;