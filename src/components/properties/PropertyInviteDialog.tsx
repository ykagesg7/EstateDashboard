import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const inviteFormSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface PropertyInviteDialogProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyInviteDialog = ({
  propertyId,
  isOpen,
  onClose,
}: PropertyInviteDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("property_invitations")
        .insert({
          property_id: propertyId,
          invitee_email: values.email,
        });

      if (error) throw error;

      toast({
        title: "招待を送信しました",
        description: `${values.email}に招待を送信しました`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "エラーが発生しました",
        description: "招待の送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>物件を共有</DialogTitle>
          <DialogDescription>
            共有したい相手のメールアドレスを入力してください
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                招待を送信
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};