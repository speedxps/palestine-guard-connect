import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TRACKING_KEY = 'gps_tracking_active';
const TRACKING_USER_KEY = 'gps_tracking_user_id';

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
  const [isTracking, setIsTracking] = useState(() => {
    // استرجاع حالة التتبع من localStorage عند التحميل
    return localStorage.getItem(TRACKING_KEY) === 'true';
  });
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingUserIdRef = useRef<string | null>(
    localStorage.getItem(TRACKING_USER_KEY)
  );

  // تحديث الموقع في قاعدة البيانات
  const updateLocationInDatabase = useCallback(async (position: GeolocationPosition) => {
    // استخدام المستخدم الحالي أو المستخدم المحفوظ في التتبع
    const currentUserId = user?.id || trackingUserIdRef.current;
    
    if (!currentUserId) {
      console.log('No user ID available for tracking');
      return;
    }

    try {
      // الحصول على profile_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      const locationData = {
        user_id: currentUserId,
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
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

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

    // حفظ معرف المستخدم للتتبع المستمر
    trackingUserIdRef.current = user.id;
    localStorage.setItem(TRACKING_USER_KEY, user.id);
    localStorage.setItem(TRACKING_KEY, 'true');

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0 // تحديث فوري بدون cache
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
      description: "سيستمر التتبع حتى بعد تسجيل الخروج",
    });

  }, [user, updateLocationInDatabase, toast]);

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
    const userId = user?.id || trackingUserIdRef.current;
    if (userId) {
      try {
        await supabase
          .from('gps_tracking')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('is_active', true);
      } catch (error) {
        console.error('Error stopping tracking:', error);
      }
    }

    // مسح البيانات المحفوظة
    localStorage.removeItem(TRACKING_KEY);
    localStorage.removeItem(TRACKING_USER_KEY);
    trackingUserIdRef.current = null;

    setIsTracking(false);
    setCurrentPosition(null);
    setError(null);

    toast({
      title: "تم إيقاف التتبع",
      description: "تم إيقاف تتبع الموقع بنجاح",
    });
  }, [user, toast]);

  // استئناف التتبع عند تحميل المكون إذا كان نشطاً
  useEffect(() => {
    const isTrackingActive = localStorage.getItem(TRACKING_KEY) === 'true';
    const savedUserId = localStorage.getItem(TRACKING_USER_KEY);
    
    if (isTrackingActive && savedUserId && navigator.geolocation) {
      trackingUserIdRef.current = savedUserId;
      
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateLocationInDatabase(position);
          setError(null);
        },
        (err) => {
          console.error('GPS Error on resume:', err);
        },
        options
      );

      watchIdRef.current = watchId;
      setIsTracking(true);
      
      console.log('GPS tracking resumed for user:', savedUserId);
    }

    return () => {
      // لا نوقف التتبع عند إلغاء تحميل المكون
      // التتبع يستمر حتى يتم إيقافه يدوياً
    };
  }, [updateLocationInDatabase]);

  return {
    isTracking,
    currentPosition,
    error,
    startTracking,
    stopTracking
  };
};
