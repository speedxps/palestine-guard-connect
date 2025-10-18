import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface CitizenLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
}

const CitizenLocationMap: React.FC<CitizenLocationMapProps> = ({ 
  latitude, 
  longitude, 
  address 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('لم يتم العثور على مفتاح Mapbox');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('فشل في تحميل الخريطة');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 14,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add marker
    marker.current = new mapboxgl.Marker({ color: '#0066cc' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add popup with address if available
    if (address) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div class="p-2 font-arabic"><strong>العنوان:</strong><br/>${address}</div>`);
      marker.current.setPopup(popup);
    }

    // Cleanup
    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [mapboxToken, latitude, longitude, address]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">لم يتم تحديد الموقع بعد</p>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-96 rounded-lg overflow-hidden border shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default CitizenLocationMap;
