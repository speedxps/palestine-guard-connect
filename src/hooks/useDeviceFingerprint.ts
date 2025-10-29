import { useState, useEffect } from 'react';
import { generateDeviceFingerprint, DeviceFingerprint } from '@/utils/deviceFingerprint';

export const useDeviceFingerprint = () => {
  const [deviceData, setDeviceData] = useState<DeviceFingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFingerprint = async () => {
      try {
        setLoading(true);
        const data = await generateDeviceFingerprint();
        setDeviceData(data);
        setError(null);
      } catch (err) {
        console.error('Error generating device fingerprint:', err);
        setError('فشل في توليد بصمة الجهاز');
      } finally {
        setLoading(false);
      }
    };

    getFingerprint();
  }, []);

  return {
    deviceData,
    loading,
    error,
  };
};
