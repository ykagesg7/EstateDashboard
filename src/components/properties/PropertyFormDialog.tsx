import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Property } from "@/types/property";
import { PropertyForm } from "./PropertyForm";

interface PropertyFormDialogProps {
  property?: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PropertyFormDialog = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}: PropertyFormDialogProps) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{property ? "物件を編集" : "物件を登録"}</DialogTitle>
        </DialogHeader>
        <PropertyForm
          property={property}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};