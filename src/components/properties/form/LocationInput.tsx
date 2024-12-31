import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PropertyFormData } from "../PropertyForm";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LocationInputProps {
  form: UseFormReturn<PropertyFormData>;
}

export const LocationInput = ({ form }: LocationInputProps) => {
  const [isManualInput, setIsManualInput] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const handleGeocodeAddress = async () => {
    const address = form.getValues("address");
    if (!address) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data && data[0]) {
        form.setValue("latitude", parseFloat(data[0].lat));
        form.setValue("longitude", parseFloat(data[0].lon));
        setGeocodeError(null);
      } else {
        setGeocodeError("住所から位置情報を取得できませんでした。手動で入力してください。");
        setIsManualInput(true);
      }
    } catch (error) {
      setGeocodeError("位置情報の取得中にエラーが発生しました。手動で入力してください。");
      setIsManualInput(true);
    }
  };

  useEffect(() => {
    if (form.getValues("address") && !form.getValues("latitude")) {
      handleGeocodeAddress();
    }
  }, [form.getValues("address")]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsManualInput(!isManualInput)}
        >
          {isManualInput ? "自動取得に切り替え" : "手動入力に切り替え"}
        </Button>
        {!isManualInput && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGeocodeAddress}
          >
            <MapPin className="mr-2 h-4 w-4" />
            住所から位置情報を取得
          </Button>
        )}
      </div>

      {geocodeError && (
        <Alert variant="destructive">
          <AlertDescription>{geocodeError}</AlertDescription>
        </Alert>
      )}

      {isManualInput && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>緯度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>経度</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.000001"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};