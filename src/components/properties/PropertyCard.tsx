import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/formatters";
import { Building2, BedDouble, Bath, SquareStack } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import clsx from "clsx"; // clsx をインポート

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{property.name}</CardTitle>
        <Badge className={clsx(
            property.status === '検討中' && "bg-yellow-500 text-white",
            property.status === '契約済' && "bg-gray-500 text-white",
          )}
          variant={property.status === '運用中' ? 'default' : 'secondary'}
        >
          {property.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">{format(new Date(property.created_at), "yyyy年MM月dd日")}</p>
          <p className="text-muted-foreground text-sm">{property.address}</p>
          <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
          <p className="text-sm">{property.description}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <SquareStack className="h-4 w-4" />
              <span className="text-sm">{property.square_footage}㎡</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};