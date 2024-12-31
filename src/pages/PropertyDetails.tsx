import { PropertyDetail } from "@/components/properties/PropertyDetail";
import { useParams } from "react-router-dom";

const PropertyDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-6">
      <PropertyDetail propertyId={id} />
    </div>
  );
};

export default PropertyDetails;