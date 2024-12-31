import { Property } from '@/types/property';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/lib/supabase';

interface PropertyMarkerProps {
  property: Property;
  onPropertyClick: (property: Property) => void;
}

interface GeocodingResult {
  features: Array<{
    center: [number, number];
  }>;
}

export const PropertyMarker = ({ property, onPropertyClick }: PropertyMarkerProps) => {
  const map = useMap();
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  useEffect(() => {
    const getCoordinates = async () => {
      try {
        const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
          body: { address: property.address }
        });

        if (error) throw error;

        const result = geocodeData as GeocodingResult;
        if (result.features && result.features.length > 0) {
          const [lng, lat] = result.features[0].center;
          setCoordinates([lat, lng]);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    getCoordinates();
  }, [property.address]);

  const markerIcon = L.divIcon({
    className: 'property-marker',
    html: `<div class="w-4 h-4 rounded-full ${
      property.status === '検討中' ? 'bg-yellow-500' :
      property.status === '運用中' ? 'bg-green-500' :
      property.status === '契約済' ? 'bg-gray-500' :
      'bg-black'
    }"></div>`,
  });

  if (!coordinates) return null;

  return (
    <Marker
      position={coordinates}
      icon={markerIcon}
      eventHandlers={{
        click: () => {
          onPropertyClick(property);
          map.setView(coordinates, 15);
        },
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold">{property.name}</h3>
          <p className="text-sm">{property.address}</p>
          <p className="font-bold mt-1">¥{property.price.toLocaleString()}</p>
        </div>
      </Popup>
    </Marker>
  );
};