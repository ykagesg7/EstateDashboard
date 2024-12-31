import { useState } from "react";
import { useForm } from "react-hook-form";
import { RentalPlan } from "@/types/property";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface RentalPlanFormProps {
  propertyId: string;
  onSuccess: () => void;
}

export const RentalPlanForm = ({ propertyId, onSuccess }: RentalPlanFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      monthly_rent: 0,
      start_date: new Date(),
      end_date: null,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("rental_plans").insert([
        {
          property_id: propertyId,
          user_id: user.id,
          monthly_rent: data.monthly_rent,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      ]);

      if (error) throw error;

      toast({
        title: "家賃プランを登録しました",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving rental plan:", error);
      toast({
        title: "エラーが発生しました",
        description: "家賃プランの保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="monthly_rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>月額家賃</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>開始日</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>終了日（任意）</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          登録
        </Button>
      </form>
    </Form>
  );
};