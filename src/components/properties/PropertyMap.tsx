import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types/property';
import { Card } from '../ui/card';
import { PropertyMarker } from './map/PropertyMarker';
import { POILayer } from './map/POILayer';
import { RouteLayer } from './map/RouteLayer';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const poiTypes = ['school', 'kindergarten', 'supermarket', 'station'] as const;

export const PropertyMap = ({ properties, onPropertyClick }: PropertyMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    onPropertyClick?.(property);
  };

  return (
    <div className="relative w-full h-[600px]">
      <MapContainer
        center={[35.6814, 139.7670]}
        zoom={12}
        className="absolute inset-0 rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map(property => (
          <PropertyMarker
            key={property.id}
            property={property}
            onPropertyClick={handlePropertyClick}
          />
        ))}

        {poiTypes.map(type => (
          <POILayer
            key={type}
            type={type}
            property={selectedProperty}
            onPOISelect={setSelectedPOI}
          />
        ))}

        {selectedProperty && selectedPOI && (
          <RouteLayer
            start={[35.6814, 139.7670]} // TODO: Get actual coordinates from geocoding
            end={[selectedPOI.lat, selectedPOI.lon]}
          />
        )}
      </MapContainer>
      
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 p-4 w-80 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedProperty.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
          <p className="text-lg font-bold mt-2">¥{selectedProperty.price.toLocaleString()}</p>
        </Card>
      )}

      {selectedPOI && (
        <Card className="absolute bottom-4 right-4 p-4 w-80 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedPOI.tags?.name || '施設'}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedPOI.tags?.address || '住所不明'}
          </p>
        </Card>
      )}
    </div>
  );
};