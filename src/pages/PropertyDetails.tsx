import { PropertyDetail } from "@/components/properties/PropertyDetail";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/properties");
  };

  return (
    <div className="container mx-auto py-6">
      <Button onClick={handleBack} variant="outline" className="mb-4">
        物件一覧に戻る
      </Button>
      <PropertyDetail propertyId={id} />
    </div>
  );
};

export default PropertyDetails;