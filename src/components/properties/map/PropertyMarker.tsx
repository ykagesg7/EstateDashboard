import { Property } from '@/types/property';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';

interface PropertyMarkerProps {
  property: Property;
  onPropertyClick: (property: Property) => void;
}

export const PropertyMarker = ({ property, onPropertyClick }: PropertyMarkerProps) => {
  const map = useMap();

  const markerIcon = L.divIcon({
    className: 'property-marker',
    html: `<div class="w-4 h-4 rounded-full ${
      property.status === '検討中' ? 'bg-yellow-500' :
      property.status === '運用中' ? 'bg-green-500' :
      property.status === '契約済' ? 'bg-gray-500' :
      'bg-black'
    }"></div>`,
  });

  return (
    <Marker
      position={[35.6814, 139.7670]} // TODO: Get actual coordinates from geocoding
      icon={markerIcon}
      eventHandlers={{
        click: () => {
          onPropertyClick(property);
          map.setView([35.6814, 139.7670], 15);
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