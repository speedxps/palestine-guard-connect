import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export const useGPSTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تحديث الموقع في قاعدة البيانات
  const updateLocationInDatabase = useCallback(async (position: GeolocationPosition) => {
    if (!user) return;

    try {
      // الحصول على profile_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const locationData = {
        user_id: user.id,
        profile_id: profile?.id || null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        is_active: true,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('gps_tracking')
        .insert([locationData]);

      if (error) {
        console.error('Error updating location:', error);
      }

      // تحديث الحالة المحلية
      setCurrentPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      });

    } catch (error) {
      console.error('Error updating location in database:', error);
    }
  }, [user]);

  // بدء التتبع
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = 'متصفحك لا يدعم خدمة تحديد الموقع';
      setError(errorMsg);
      toast({
        title: "غير مدعوم",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };

    // بدء المراقبة المستمرة
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocationInDatabase(position);
        setError(null);
      },
      (err) => {
        let errorMessage = 'خطأ في تحديد الموقع';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متوفرة';
            break;
          case err.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
        }
        setError(errorMessage);
        console.error('GPS Error:', err);
      },
      options
    );

    watchIdRef.current = watchId;
    setIsTracking(true);

    toast({
      title: "تم تفعيل التتبع",
      description: "جاري تتبع موقعك بشكل مستمر",
    });

  }, [updateLocationInDatabase, toast]);

  // إيقاف التتبع
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    // تحديث حالة التتبع في قاعدة البيانات
    if (user) {
      try {
        await supabase
          .from('gps_tracking')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('is_active', true);
      } catch (error) {
        console.error('Error stopping tracking:', error);
      }
    }

    setIsTracking(false);
    setCurrentPosition(null);
    setError(null);

    toast({
      title: "تم إيقاف التتبع",
      description: "تم إيقاف تتبع الموقع بنجاح",
    });
  }, [user, toast]);

  // تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    currentPosition,
    error,
    startTracking,
    stopTracking
  };
};
