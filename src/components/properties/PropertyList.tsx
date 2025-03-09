import { useState, useMemo, useEffect } from "react";
import { Property } from "@/types/property";
import { PropertyCard } from "./PropertyCard";
import { PropertyFormDialog } from "./PropertyFormDialog";
import { PropertyInviteDialog } from "./PropertyInviteDialog";
import { PropertyMap } from "./PropertyMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Grid2X2, List, Map, Plus, Share2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onRefresh: () => void;
}

export const PropertyList = ({ properties, isLoading, onRefresh }: PropertyListProps) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [propertyToShare, setPropertyToShare] = useState<Property | undefined>();
  const [propertyToDelete, setPropertyToDelete] = useState<Property | undefined>();
  const { session } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user role:', profileError);
        } else {
          setUserRole(profile?.role || null);
        }
      }
    };

    fetchUserRole();
  }, [session]);

  const filteredProperties = useMemo(() => {
    return properties
      .filter((property) =>
        property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "price":
            return Number(b.price) - Number(a.price);
          case "title":
            return (a.name || '').localeCompare(b.name || '');
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [properties, searchTerm, sortBy]);

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete.id);

      if (error) throw error;

      toast({
        title: "物件を削除しました",
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "エラーが発生しました",
        description: "物件の削除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setPropertyToDelete(undefined);
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input
          placeholder="物件を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSelectedProperty(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">登録日</SelectItem>
              <SelectItem value="price">価格</SelectItem>
              <SelectItem value="title">タイトル</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent" : ""}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("map")}
              className={viewMode === "map" ? "bg-accent" : ""}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <PropertyMap properties={filteredProperties as any} />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {filteredProperties.map((property) => (
            <div key={property.id} className="group relative">
              <PropertyCard property={property} userRole={userRole} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProperty(property);
                    setIsFormOpen(true);
                  }}
                >
                  <span className="sr-only">編集</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPropertyToShare(property);
                    setIsInviteOpen(true);
                  }}
                >
                  <span className="sr-only">共有</span>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPropertyToDelete(property);
                  }}
                >
                  <span className="sr-only">削除</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PropertyFormDialog
        property={selectedProperty as any}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProperty(undefined);
        }}
        onSuccess={onRefresh}
      />

      {propertyToShare && (
        <PropertyInviteDialog
          propertyId={propertyToShare.id}
          propertyName={propertyToShare.name || "未名称の物件"}
          isOpen={isInviteOpen}
          onClose={() => {
            setIsInviteOpen(false);
            setPropertyToShare(undefined);
          }}
        />
      )}

      <AlertDialog
        open={!!propertyToDelete}
        onOpenChange={() => setPropertyToDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>物件を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。物件に関連するすべての情報が削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};