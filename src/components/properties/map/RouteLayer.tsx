import { useEffect, useState } from 'react';
import { useMap, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

interface RouteLayerProps {
  start: [number, number];
  end: [number, number];
}

export const RouteLayer = ({ start, end }: RouteLayerProps) => {
  const [route, setRoute] = useState<any>(null);
  const [duration, setDuration] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    // Using OSRM (Open Source Routing Machine) for routing
    fetch(`https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`)
      .then(response => response.json())
      .then(data => {
        if (data.routes?.[0]) {
          setRoute(data.routes[0].geometry.coordinates);
          setDuration(data.routes[0].duration);
          setDistance(data.routes[0].distance);
        }
      })
      .catch(error => {
        console.error('Error calculating route:', error);
      });
  }, [start, end]);

  if (!route) return null;

  return (
    <Polyline
      positions={route.map((coord: number[]) => [coord[1], coord[0]])}
      pathOptions={{ color: 'blue', weight: 3 }}
    >
      <Popup>
        <div className="p-2">
          <p>徒歩: {Math.round(duration / 60)}分</p>
          <p>距離: {(distance / 1000).toFixed(1)}km</p>
        </div>
      </Popup>
    </Polyline>
  );
};