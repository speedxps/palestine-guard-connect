import { sha256 } from 'js-sha256';

export interface DeviceInfo {
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    availWidth: number;
    availHeight: number;
  };
  browser: {
    name: string;
    version: string;
    language: string;
    languages: string[];
    userAgent: string;
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
  };
  os: {
    name: string;
    version: string;
    platform: string;
  };
  hardware: {
    cores: number;
    memory: number | null;
    touchSupport: boolean;
    maxTouchPoints: number;
  };
  canvas: string;
  webgl: string;
  timezone: {
    offset: number;
    timezone: string;
  };
  fonts: string[];
  plugins: string[];
  audio: string;
}

export interface DeviceFingerprint {
  fingerprint: string;
  deviceInfo: DeviceInfo;
}

// Generate Canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Device Fingerprint 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint 🔒', 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
}

// Generate WebGL fingerprint
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }

    return 'no-debug-info';
  } catch {
    return 'webgl-error';
  }
}

// Generate Audio fingerprint
function getAudioFingerprint(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    oscillator.stop();
    audioContext.close();

    return Array.from(data.slice(0, 30)).join(',');
  } catch {
    return 'audio-error';
  }
}

// Detect installed fonts
function getInstalledFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Helvetica'
  ];

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const baselines: { [key: string]: number } = {};
  baseFonts.forEach(font => {
    ctx.font = `${testSize} ${font}`;
    baselines[font] = ctx.measureText(testString).width;
  });

  return testFonts.filter(font => {
    return baseFonts.some(baseFont => {
      ctx.font = `${testSize} ${font}, ${baseFont}`;
      const width = ctx.measureText(testString).width;
      return width !== baselines[baseFont];
    });
  });
}

// Detect browser plugins
function getPlugins(): string[] {
  if (!navigator.plugins) return [];
  return Array.from(navigator.plugins).map(plugin => plugin.name);
}

// Parse User Agent
function parseUserAgent(): { name: string; version: string; os: string; osVersion: string } {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  // Detect Browser
  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || 'Unknown';
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || 'Unknown';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || 'Unknown';
  }

  // Detect OS
  if (ua.includes('Windows NT 10.0')) {
    osName = 'Windows';
    osVersion = '10/11';
  } else if (ua.includes('Windows NT 6.3')) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (ua.includes('Windows NT 6.2')) {
    osName = 'Windows';
    osVersion = '8';
  } else if (ua.includes('Windows NT 6.1')) {
    osName = 'Windows';
    osVersion = '7';
  } else if (ua.includes('Mac OS X')) {
    osName = 'macOS';
    osVersion = ua.split('Mac OS X ')[1]?.split(')')[0]?.replace(/_/g, '.') || 'Unknown';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
  } else if (ua.includes('Android')) {
    osName = 'Android';
    osVersion = ua.split('Android ')[1]?.split(';')[0] || 'Unknown';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    osName = 'iOS';
    osVersion = ua.split('OS ')[1]?.split(' ')[0]?.replace(/_/g, '.') || 'Unknown';
  }

  return { name: browserName, version: browserVersion, os: osName, osVersion };
}

// Main function to generate device fingerprint
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const { name: browserName, version: browserVersion, os: osName, osVersion } = parseUserAgent();

  const deviceInfo: DeviceInfo = {
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
    },
    browser: {
      name: browserName,
      version: browserVersion,
      language: navigator.language,
      languages: Array.from(navigator.languages || [navigator.language]),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
    },
    os: {
      name: osName,
      version: osVersion,
      platform: navigator.platform,
    },
    hardware: {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || null,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    },
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    timezone: {
      offset: new Date().getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    fonts: getInstalledFonts(),
    plugins: getPlugins(),
    audio: getAudioFingerprint(),
  };

  // Generate unique fingerprint hash
  const fingerprintString = JSON.stringify({
    screen: deviceInfo.screen,
    canvas: deviceInfo.canvas,
    webgl: deviceInfo.webgl,
    audio: deviceInfo.audio,
    fonts: deviceInfo.fonts.sort().join(','),
    plugins: deviceInfo.plugins.sort().join(','),
    timezone: deviceInfo.timezone,
    hardware: deviceInfo.hardware,
    browser: {
      name: deviceInfo.browser.name,
      platform: deviceInfo.browser.platform,
    },
  });

  const fingerprint = sha256(fingerprintString);

  return {
    fingerprint,
    deviceInfo,
  };
}

// Helper function to get a human-readable device name
export function getDeviceName(deviceInfo: DeviceInfo): string {
  const { browser, os, hardware } = deviceInfo;
  const deviceType = hardware.touchSupport && hardware.maxTouchPoints > 0 ? 'Mobile' : 'Desktop';
  return `${browser.name} ${browser.version} on ${os.name} ${os.version} (${deviceType})`;
}
