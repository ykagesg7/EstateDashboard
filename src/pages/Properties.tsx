import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";
import { PropertyList } from "@/components/properties/PropertyList";
import { PropertyMap } from "@/components/properties/PropertyMap";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">物件一覧</h1>
      
      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">リスト表示</TabsTrigger>
          <TabsTrigger value="map">マップ表示</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <PropertyList
            properties={properties || []}
            isLoading={isLoading}
            onRefresh={() => refetch()}
          />
        </TabsContent>
        
        <TabsContent value="map">
          <PropertyMap
            properties={properties || []}
            onPropertyClick={setSelectedProperty}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Properties;