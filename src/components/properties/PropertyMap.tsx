import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/types/property';
import { Card } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

export const PropertyMap = ({ properties, onPropertyClick }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [route, setRoute] = useState<any | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        const { data: { secret }, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;

        mapboxgl.accessToken = secret;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [139.7670, 35.6814], // Tokyo coordinates
          zoom: 12
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add properties to map
        map.current.on('load', () => {
          // Add properties source
          map.current?.addSource('properties', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: properties.map(property => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [139.7670, 35.6814] // TODO: Get actual coordinates from geocoding
                },
                properties: {
                  id: property.id,
                  name: property.name,
                  price: property.price,
                  status: property.status
                }
              }))
            }
          });

          // Add properties layer
          map.current?.addLayer({
            id: 'properties',
            type: 'circle',
            source: 'properties',
            paint: {
              'circle-radius': 8,
              'circle-color': [
                'match',
                ['get', 'status'],
                '検討中', '#ffd700',
                '運用中', '#4caf50',
                '契約済', '#9e9e9e',
                '#000000'
              ]
            }
          });

          // Add POI layers
          const poiTypes = ['school', 'kindergarten', 'supermarket', 'station'];
          poiTypes.forEach(type => {
            map.current?.addLayer({
              id: `${type}-layer`,
              type: 'symbol',
              source: {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: [] // Will be populated by Mapbox POI query
                }
              },
              layout: {
                'icon-image': `${type}-15`,
                'icon-allow-overlap': true,
                'text-field': ['get', 'name'],
                'text-offset': [0, 0.9],
                'text-anchor': 'top'
              }
            });
          });
        });

        // Handle property click
        map.current.on('click', 'properties', (e) => {
          if (!e.features?.[0]) return;
          
          const feature = e.features[0];
          const propertyId = feature.properties?.id;
          const property = properties.find(p => p.id === propertyId);
          
          if (property) {
            setSelectedProperty(property);
            onPropertyClick?.(property);

            // Query nearby POIs
            queryNearbyPOIs(feature.geometry.coordinates);
          }
        });

        // Handle POI click
        poiTypes.forEach(type => {
          map.current?.on('click', `${type}-layer`, (e) => {
            if (!e.features?.[0]) return;
            
            const feature = e.features[0];
            setSelectedPOI(feature);

            if (selectedProperty) {
              calculateRoute(
                selectedProperty.coordinates,
                feature.geometry.coordinates
              );
            }
          });
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "マップの初期化に失敗しました",
          description: "しばらくしてから再度お試しください",
          variant: "destructive"
        });
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [properties]);

  const queryNearbyPOIs = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/school.json?proximity=${coordinates.join(',')}&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      // Update POI layers with results
      if (map.current?.getSource('school-layer')) {
        (map.current.getSource('school-layer') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: data.features
        });
      }
    } catch (error) {
      console.error('Error querying nearby POIs:', error);
    }
  };

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start.join(',')};${end.join(',')}`
        + `?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        setRoute(data.routes[0]);

        // Display route on map
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: data.routes[0].geometry
          });
        } else {
          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
        }
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {selectedProperty && (
        <Card className="absolute bottom-4 left-4 p-4 w-80 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedProperty.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedProperty.address}</p>
          <p className="text-lg font-bold mt-2">¥{selectedProperty.price.toLocaleString()}</p>
        </Card>
      )}

      {selectedPOI && route && (
        <Card className="absolute bottom-4 right-4 p-4 w-80 bg-white/90 backdrop-blur">
          <h3 className="text-lg font-bold">{selectedPOI.properties.name}</h3>
          <p className="text-sm text-muted-foreground">
            徒歩: {Math.round(route.duration / 60)}分
            ({(route.distance / 1000).toFixed(1)}km)
          </p>
        </Card>
      )}
    </div>
  );
};