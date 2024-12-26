import { useQuery } from "@tanstack/react-query";
//import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";
import { dummyProperties } from "@/data/dummyProperties"; // インポートを追加
import { PropertyList } from "@/components/properties/PropertyList";

const Properties = () => {
  //const { data: properties, isLoading } = useQuery({
    //queryKey: ["properties"],
    //queryFn: async () => {
      //const { data, error } = await supabase
        //.from("properties")
        //.select("*")
        //.order("created_at", { ascending: false });

      //if (error) throw error;
      //return data as Property[];
    //},
  //});

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">物件一覧</h1>
      <PropertyList properties={dummyProperties} /* properties={properties || []} */ isLoading={false} /> {/* dummyProperties を渡すように変更 */}
    </div>
  );
};

export default Properties;