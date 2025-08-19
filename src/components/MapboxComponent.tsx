import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Users } from 'lucide-react';

interface Patrol {
  id: string;
  name: string;
  area: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  status: string;
  patrol_members: Array<{
    officer_name: string;
    officer_phone: string;
    role: string;
  }>;
}

interface MapboxComponentProps {
  patrols: Patrol[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const MapboxComponent: React.FC<MapboxComponentProps> = ({ 
  patrols, 
  center = [35.2137, 31.7683], // Palestine coordinates
  zoom = 10,
  height = "400px"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        toast({
          title: "خطأ في تحميل الخريطة",
          description: "لم نتمكن من تحميل مفتاح Mapbox",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, [toast]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, center, zoom]);

  // Add patrol markers
  useEffect(() => {
    if (!map.current || !patrols.length) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.patrol-marker');
    existingMarkers.forEach(marker => marker.remove());

    patrols.forEach((patrol) => {
      if (!patrol.location_lat || !patrol.location_lng) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'patrol-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: #3b82f6;
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      
      // Add icon
      const icon = document.createElement('div');
      icon.innerHTML = '🚔';
      icon.style.fontSize = '16px';
      markerElement.appendChild(icon);

      // Hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // Create popup content
      const popupContent = `
        <div style="font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${patrol.name}</h3>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 12px;">📍</span>
              <span style="font-size: 12px; color: #6b7280;">المنطقة: ${patrol.area}</span>
            </div>
            ${patrol.location_address ? `
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span style="font-size: 12px;">📍</span>
                <span style="font-size: 12px; color: #6b7280;">${patrol.location_address}</span>
              </div>
            ` : ''}
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 12px;">🟢</span>
              <span style="font-size: 12px; color: #059669;">الحالة: ${patrol.status === 'active' ? 'نشطة' : 'غير نشطة'}</span>
            </div>
          </div>
          ${patrol.patrol_members.length > 0 ? `
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
              <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #374151;">الأعضاء (${patrol.patrol_members.length}):</div>
              ${patrol.patrol_members.slice(0, 3).map(member => `
                <div style="font-size: 11px; margin-bottom: 2px; color: #6b7280;">
                  • ${member.officer_name} (${member.role === 'leader' ? 'قائد' : 'عضو'})
                  ${member.officer_phone ? `- ${member.officer_phone}` : ''}
                </div>
              `).join('')}
              ${patrol.patrol_members.length > 3 ? `
                <div style="font-size: 11px; color: #9ca3af;">و ${patrol.patrol_members.length - 3} آخرين...</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([patrol.location_lng, patrol.location_lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Fit map to show all patrols
    if (patrols.length > 0) {
      const validPatrols = patrols.filter(p => p.location_lat && p.location_lng);
      if (validPatrols.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        validPatrols.forEach(patrol => {
          bounds.extend([patrol.location_lng, patrol.location_lat]);
        });
        map.current?.fitBounds(bounds, { padding: 50 });
      } else if (validPatrols.length === 1) {
        map.current?.flyTo({
          center: [validPatrols[0].location_lng, validPatrols[0].location_lat],
          zoom: 14
        });
      }
    }
  }, [patrols]);

  if (loading) {
    return (
      <div 
        style={{ height, width: '100%' }}
        className="flex items-center justify-center bg-muted rounded-lg"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>جاري تحميل الخريطة...</span>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div 
        style={{ height, width: '100%' }}
        className="flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-border"
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">خطأ في تحميل الخريطة</p>
          <p className="text-xs">تحقق من إعدادات Mapbox</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Patrol count overlay */}
      {patrols.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{patrols.length} دورية</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxComponent;