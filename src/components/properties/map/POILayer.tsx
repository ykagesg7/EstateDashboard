import { useEffect, useState } from 'react';
import { useMap, LayerGroup, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Tables } from '@/integrations/supabase/types';
type Property = Tables<'properties'>;

interface POILayerProps {
  type: 'school' | 'kindergarten' | 'supermarket' | 'station';
  property: Property | null;
  onPOISelect: (poi: any) => void;
}

export const POILayer = ({ type, property, onPOISelect }: POILayerProps) => {
  const map = useMap();
  const [pois, setPois] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!property?.latitude || !property?.longitude) return;

    setLoading(true);
    setError(null);

    // Using Overpass API to fetch POIs from OpenStreetMap
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${type}"](around:1000,${property.latitude},${property.longitude});
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
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching POIs:', error);
        setError('周辺施設の取得中にエラーが発生しました');
        setLoading(false);
      });
  }, [property, type]);

  const poiIcon = L.divIcon({
    className: 'poi-marker',
    html: `<div class="w-3 h-3 rounded-full bg-blue-500"></div>`,
  });

  if (loading) return null;
  if (error) return null;

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
              {property && (
                <p className="text-sm mt-2">
                  距離: {(calculateDistance(property.latitude, property.longitude, poi.lat, poi.lon) / 1000).toFixed(2)}km
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
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