import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Property } from '@/types/property';
import { Card } from '../ui/card';
import { POILayer } from './map/POILayer';
import { PropertyCluster } from './map/PropertyCluster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const poiTypes = ['school', 'kindergarten', 'supermarket', 'station'] as const;

export const PropertyMap = ({ properties, onPropertyClick }: PropertyMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [selectedPOIType, setSelectedPOIType] = useState<typeof poiTypes[number] | null>(null);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertyClick?.(property);
  };

  const center = properties[0]?.latitude && properties[0]?.longitude
    ? [properties[0].latitude, properties[0].longitude]
    : [35.6814, 139.7670];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">すべての施設</TabsTrigger>
          {poiTypes.map(type => (
            <TabsTrigger key={type} value={type}>
              {type === 'school' ? '学校' :
               type === 'kindergarten' ? '幼稚園' :
               type === 'supermarket' ? 'スーパー' : '駅'}
            </TabsTrigger>
          ))}
        </TabsList>

        {poiTypes.map(type => (
          <TabsContent key={type} value={type}>
            <div className="relative w-full h-[600px]">
              <MapContainer
                center={center as [number, number]}
                zoom={12}
                className="absolute inset-0 rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <PropertyCluster
                  properties={properties}
                  onPropertyClick={handlePropertyClick}
                />

                {selectedProperty && (
                  <POILayer
                    type={type}
                    property={selectedProperty}
                    onPOISelect={setSelectedPOI}
                  />
                )}
              </MapContainer>
            </div>
          </TabsContent>
        ))}

        <TabsContent value="all">
          <div className="relative w-full h-[600px]">
            <MapContainer
              center={center as [number, number]}
              zoom={12}
              className="absolute inset-0 rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <PropertyCluster
                properties={properties}
                onPropertyClick={handlePropertyClick}
              />

              {selectedProperty && poiTypes.map(type => (
                <POILayer
                  key={type}
                  type={type}
                  property={selectedProperty}
                  onPOISelect={setSelectedPOI}
                />
              ))}
            </MapContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedProperty && (
        <Card className="p-4 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedProperty.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
          <p className="text-lg font-bold mt-2">¥{selectedProperty.price.toLocaleString()}</p>
        </Card>
      )}

      {selectedPOI && (
        <Card className="p-4 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedPOI.tags?.name || '施設'}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedPOI.tags?.address || '住所不明'}
          </p>
          {selectedProperty && (
            <p className="text-sm mt-2">
              距離: {(calculateDistance(
                selectedProperty.latitude,
                selectedProperty.longitude,
                selectedPOI.lat,
                selectedPOI.lon
              ) / 1000).toFixed(2)}km
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}