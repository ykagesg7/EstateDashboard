import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/formatters";
import { Building2, BedDouble, Bath, SquareStack } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{property.title}</CardTitle>
        <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
          {property.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">{property.address}</p>
          <p className="text-2xl font-bold">{formatCurrency(property.price)}</p>
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
              <span className="text-sm">{property.square_feet}㎡</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};