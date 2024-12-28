import { useEffect, useState } from 'react';
import { useMap, LayerGroup, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@/types/property';

interface POILayerProps {
  type: 'school' | 'kindergarten' | 'supermarket' | 'station';
  property: Property | null;
  onPOISelect: (poi: any) => void;
}

export const POILayer = ({ type, property, onPOISelect }: POILayerProps) => {
  const map = useMap();
  const [pois, setPois] = useState<any[]>([]);

  useEffect(() => {
    if (!property) return;

    // Using Overpass API to fetch POIs from OpenStreetMap
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"]
          (35.6714,139.7570,35.6914,139.7770);
      );
      out body;
      >;
      out skel qt;
    `;

    fetch(`https://overpass-api.de/api/interpreter`, {
      method: 'POST',
      body: query
    })
      .then(response => response.json())
      .then(data => {
        setPois(data.elements);
      })
      .catch(error => {
        console.error('Error fetching POIs:', error);
      });
  }, [property, type]);

  const poiIcon = L.divIcon({
    className: 'poi-marker',
    html: `<div class="w-3 h-3 rounded-full bg-blue-500"></div>`,
  });

  return (
    <LayerGroup>
      {pois.map(poi => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lon]}
          icon={poiIcon}
          eventHandlers={{
            click: () => onPOISelect(poi)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{poi.tags.name || type}</h3>
              <p className="text-sm">{poi.tags.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  );
};