import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  price?: number;
  [key: string]: any;
}

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['propertySearch', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
      
      // 物件名、住所、説明での検索
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`name.ilike.%${debouncedSearchTerm}%,address.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
        .limit(10);
      
      if (error) {
        console.error('検索エラー:', error);
        return [];
      }
      
      return data as Property[];
    },
    enabled: debouncedSearchTerm.length >= 2,
  });
  
  return {
    searchTerm,
    setSearchTerm,
    searchResults: searchResults || [],
    isLoading,
    isSearching: debouncedSearchTerm.length >= 2,
  };
}; 