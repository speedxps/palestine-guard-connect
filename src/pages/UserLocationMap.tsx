import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

const MapUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);
  return null;
};

const UserLocationMap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('gps_tracking')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching location:', error);
          toast({
            title: 'خطأ',
            description: 'فشل في جلب الموقع',
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          setLocation({
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: Number(data.accuracy || 0),
            timestamp: data.created_at,
          });
        } else {
          toast({
            title: 'تنبيه',
            description: 'لا يوجد موقع محفوظ. يرجى تفعيل التتبع أولاً.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-location-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setLocation({
            latitude: Number(newData.latitude),
            longitude: Number(newData.longitude),
            accuracy: Number(newData.accuracy || 0),
            timestamp: newData.created_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const defaultCenter: [number, number] = [31.9522, 35.2332]; // Jerusalem default

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/80 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-arabic text-primary-foreground">
                موقعي على الخريطة
              </h1>
              <p className="text-sm text-primary-foreground/80">My Location</p>
            </div>
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل الموقع...</p>
            </CardContent>
          </Card>
        ) : location ? (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Navigation className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">معلومات الموقع</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">خط العرض:</span>
                    <p className="font-mono">{location.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">خط الطول:</span>
                    <p className="font-mono">{location.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الدقة:</span>
                    <p>{location.accuracy.toFixed(0)} متر</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">آخر تحديث:</span>
                    <p>{new Date(location.timestamp).toLocaleTimeString('ar')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="h-[500px] w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater position={[location.latitude, location.longitude]} />
                    <Marker position={[location.latitude, location.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <strong>{user?.name}</strong>
                          <br />
                          موقعك الحالي
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                لا يوجد موقع محفوظ
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                العودة إلى لوحة التحكم
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserLocationMap;
