import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/property";
import { formatDate, formatFileSize } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyDocumentsProps {
  propertyId: string;
}

export const PropertyDocuments = ({ propertyId }: PropertyDocumentsProps) => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (!documents?.length) return <div>書類がありません</div>;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <p className="font-medium">{document.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(document.created_at)} - {formatFileSize(document.size || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};