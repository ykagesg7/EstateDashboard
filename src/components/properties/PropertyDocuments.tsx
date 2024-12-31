import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Document } from "@/types/property";
import { formatDate, formatFileSize } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Upload, Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILE_SIZE = 20 1024 1024; // 20MB
interface PropertyDocumentsProps {
propertyId: string;
}

export const PropertyDocuments = ({ propertyId }: PropertyDocumentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ドキュメント一覧の取得
  const { data: documents, isLoading, error } = useQuery({
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
    enabled: !!propertyId,
  });

  // ファイルアップロード処理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルバリデーション
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "エラー",
        description: "このファイル形式はサポートされていません。",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "エラー",
        description: "ファイルサイズは20MB以下にしてください。",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("認証が必要です");

      // Supabase Storageにファイルをアップロード
      const fileExt = file.name.split(".").pop();
      const filePath = `${propertyId}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("property-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // アップロード成功のトースト
      toast({
        title: "アップロード成功",
        description: "書類が正常にアップロードされました。",
      });

      // キャッシュの更新
      queryClient.invalidateQueries(["documents", propertyId]);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "書類のアップロードに失敗しました: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ファイルダウンロード処理
  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("property-documents")
        .download(document.path);
      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "エラー",
        description: "書類のダウンロードに失敗しました: " + error.message,
        variant: "destructive",
      });
    }
  };

  // ファイル削除処理
  const deleteMutation = useMutation(
    async (document: Document) => {
      const { error } = await supabase.storage
        .from("property-documents")
        .remove([document.path]);
      if (error) throw error;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);
      if (dbError) throw dbError;
    },
    {
      onSuccess: () => {
        toast({
          title: "削除成功",
          description: "書類が正常に削除されました。",
        });
        queryClient.invalidateQueries(["documents", propertyId]);
      },
      onError: (error: any) => {
        toast({
          title: "エラー",
          description: "書類の削除に失敗しました: " + error.message,
          variant: "destructive",
        });
      },
    }
  );

  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div>書類の読み込みに失敗しました</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>書類一覧</CardTitle>
        <div className="relative">
          <Input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            アップロード
          </Button>
        </div>
      </CardHeader >
      <CardContent>
        <div className="space-y-4">
          {documents?.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <p className="font-medium">{document.name}</p >
                <p className="text-sm text-muted-foreground">
                  {formatDate(document.created_at)} -{" "}
                  {formatFileSize(document.size || 0)}
                </p >
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        本当にこの書類を削除しますか？
                      </AlertDialogTitle >
                      <AlertDialogDescription>
                        この操作は取り消すことができません。
                      </AlertDialogDescription >
                    </AlertDialogHeader >
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (selectedDocument) {
                            deleteMutation.mutate(selectedDocument);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        削除
                      </AlertDialogAction >
                    </AlertDialogFooter >
                  </AlertDialogContent >
                </AlertDialog >
              </div>
            </div>
          ))}
          {!documents?.length && (
            <div className="text-center text-muted-foreground py-8">
              書類がありません
            </div>
          )}
        </div>
      </CardContent >
    </Card >
  );
};