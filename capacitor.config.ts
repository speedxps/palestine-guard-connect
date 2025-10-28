import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4f37842135b64b5da40cfabb5da7dd57',
  appName: 'palestine-guard-connect',
  webDir: 'dist',
  server: {
    url: "https://4f378421-35b6-4b5d-a40c-fabb5da7dd57.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    BiometricAuth: {
      // Native biometric authentication from @aparajita/capacitor-biometric-auth
    }
  },
};

export default config;