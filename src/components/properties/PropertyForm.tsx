import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LocationInput } from "./form/LocationInput";
import { Separator } from "@/components/ui/separator";
import { PropertyImage } from "@/types/property";
import { PropertyImageUpload } from "./PropertyImageUpload";

// エラー回避のためにPropertyを直接定義
interface Property {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  description: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  status: '検討中' | '運用中' | '契約済';
  latitude: number | null;
  longitude: number | null;
  workspace_id: string | null;
}

type PropertyFormData = Omit<Property, "id" | "created_at">;

interface PropertyFormProps {
  property?: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PropertyForm = ({ property, onSuccess, onCancel }: PropertyFormProps) => {
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);

  const form = useForm<PropertyFormData>({
    defaultValues: property
      ? {
          name: property.name,
          description: property.description,
          price: property.price,
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          square_footage: property.square_footage,
          status: property.status,
          user_id: property.user_id,
          latitude: property.latitude,
          longitude: property.longitude,
        }
      : {
          name: "",
          description: "",
          price: 0,
          address: "",
          bedrooms: 1,
          bathrooms: 1,
          square_footage: 0,
          status: "検討中",
          user_id: "",
          latitude: null,
          longitude: null,
        },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsUserLoading(false);
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, []);

  // 画像の読み込み
  useEffect(() => {
    if (property?.id) {
      const fetchImages = async () => {
        try {
          const { data, error } = await supabase
            .from("property_images")
            .select("*")
            .eq("property_id", property.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          setPropertyImages(data || []);
        } catch (error) {
          console.error("画像の取得に失敗しました:", error);
        }
      };
      
      fetchImages();
    }
  }, [property?.id]);

  if (isUserLoading) {
    return <div>Loading...</div>; // ローディングインジケーター
  }

  if (!isAuthenticated) {
    return <div>認証が必要です。</div>; // 認証されていない場合のメッセージ
  }

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const propertyData = {
        ...data,
        user_id: user.id,
      };

      let propertyId = property?.id;

      if (property) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id);

        if (error) throw error;

        toast({
          title: "物件情報を更新しました",
        });
      } else {
        const { data: newProperty, error } = await supabase
          .from("properties")
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;
        propertyId = newProperty.id;

        toast({
          title: "物件を登録しました",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "エラーが発生しました",
        description: "物件の保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (images: PropertyImage[]) => {
    setPropertyImages(images);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>物件名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>住所</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>価格</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>寝室数</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>バスルーム数</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="square_footage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>床面積 (㎡)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="検討中">検討中</SelectItem>
                  <SelectItem value="運用中">運用中</SelectItem>
                  <SelectItem value="契約済">契約済</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>詳細情報</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <LocationInput
          form={form}
        />

        {property?.id && (
          <>
            <Separator className="my-6" />
            <PropertyImageUpload 
              propertyId={property.id} 
              existingImages={propertyImages}
              onImagesChange={handleImagesChange}
            />
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : property ? "更新" : "登録"}
          </Button>
        </div>
      </form>
    </Form>
  );
};