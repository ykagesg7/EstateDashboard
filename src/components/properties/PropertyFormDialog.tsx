import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyForm } from "./PropertyForm";
import { Tables } from "@/integrations/supabase/types";
type Property = Tables<'properties'>;

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
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>{property ? "物件を編集" : "物件を登録"}</DialogTitle>
          <DialogDescription>
            物件の情報を入力してください。すべての必須項目を入力する必要があります。
          </DialogDescription>
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