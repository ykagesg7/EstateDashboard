import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Property } from '@/types/property';

interface PropertyClusterProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export const PropertyCluster = ({ properties, onPropertyClick }: PropertyClusterProps) => {
  const map = useMap();

  useEffect(() => {
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = L.marker([property.latitude, property.longitude], {
          icon: L.divIcon({
            className: 'property-marker',
            html: `<div class="w-4 h-4 rounded-full ${
              property.status === '検討中' ? 'bg-yellow-500' :
              property.status === '運用中' ? 'bg-green-500' :
              property.status === '契約済' ? 'bg-gray-500' :
              'bg-black'
            }"></div>`,
          })
        });

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${property.name}</h3>
            <p class="text-sm">${property.address}</p>
            <p class="font-bold mt-1">¥${property.price.toLocaleString()}</p>
          </div>
        `);

        marker.on('click', () => {
          onPropertyClick(property);
        });

        markers.addLayer(marker);
      }
    });

    map.addLayer(markers);

    return () => {
      map.removeLayer(markers);
    };
  }, [properties, map, onPropertyClick]);

  return null;
};