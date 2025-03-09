import React, { useState, useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Selectコンポーネントを追加

// Leaflet のデフォルトマーカーアイコンの問題を修正
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationInputProps {
  form: UseFormReturn<PropertyFormData>;
}

export type PropertyFormData = Omit<Property, "id" | "created_at">;

// 代わりに必要な型を直接定義
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

export const LocationInput = ({ form }: LocationInputProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [tileLayer, setTileLayer] = useState("osm"); // デフォルトをOpenStreetMapに設定

  const mapClicked = useCallback((e: any) => {
    setPosition([e.latlng.lat, e.latlng.lng]);
    form.setValue("latitude", e.latlng.lat);
    form.setValue("longitude", e.latlng.lng);
  }, [form.setValue]);

  const MapClickHandler = () => {
    useMapEvents({
      click: mapClicked,
    });
    return null;
  };

  const defaultLat = form.getValues("latitude") || 35.6814; // 東京駅
  const defaultLng = form.getValues("longitude") || 139.7670;

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <Select onValueChange={setTileLayer} defaultValue={tileLayer}>
          < SelectTrigger className="w-[180px]">
            <SelectValue placeholder="地図の種類を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="osm">OpenStreetMap</SelectItem >
            <SelectItem value="satellite">衛星写真</SelectItem >
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] w-full">
        <MapContainer center={[defaultLat, defaultLng]} zoom={13} className="h-full w-full">
          {tileLayer === "osm" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {tileLayer === "satellite" && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          <MapClickHandler />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>緯度</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" {...field} readOnly />
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
                <Input type="number" step="0.000001" {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};