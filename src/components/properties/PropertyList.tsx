import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types/property";
import { PropertyCard } from "./PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Grid2X2, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface PropertyListProps {
  properties: Property[];
  isLoading: boolean;
}

export const PropertyList = ({ properties, isLoading }: PropertyListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  const filteredProperties = properties
    .filter((property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return Number(b.price) - Number(a.price);
        case "title":
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid2X2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }>
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => navigate(`/properties/${property.id}`)}
          />
        ))}
      </div>
    </div>
  );
};