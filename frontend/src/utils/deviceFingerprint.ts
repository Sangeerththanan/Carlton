const DEVICE_ID_KEY = 'carlton_device_id_v1';
let deviceIdPromise: Promise<string> | null = null;

const safeNavigatorValue = (value: unknown) => (value === undefined || value === null ? '' : String(value));

const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Carlton-Search', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Carlton-Search', 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
};

const getWebglFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !('getParameter' in gl)) return 'no-webgl';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo
      ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR);
    const renderer = debugInfo
      ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER);

    return `${vendor}::${renderer}`;
  } catch {
    return 'webgl-error';
  }
};

const getAudioFingerprint = async () => {
  try {
    const OfflineAudioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!OfflineAudioContext) return 'no-audio';

    const context = new OfflineAudioContext(1, 44100, 44100);
    const oscillator = context.createOscillator();
    const compressor = context.createDynamicsCompressor();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await context.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < 2000; i += 1) {
      sum += Math.abs(data[i] || 0);
    }

    return `audio-${sum.toFixed(6)}`;
  } catch {
    return 'audio-error';
  }
};

const hashString = async (input: string) => {
  if (crypto?.subtle?.digest) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const buildFingerprint = async () => {
  const parts = [
    safeNavigatorValue(navigator.userAgent),
    safeNavigatorValue(navigator.language),
    safeNavigatorValue(navigator.platform),
    safeNavigatorValue(navigator.hardwareConcurrency),
    safeNavigatorValue(screen.width),
    safeNavigatorValue(screen.height),
    safeNavigatorValue(screen.colorDepth),
    safeNavigatorValue(window.devicePixelRatio),
    safeNavigatorValue(Intl.DateTimeFormat().resolvedOptions().timeZone),
    getCanvasFingerprint(),
    getWebglFingerprint(),
    await getAudioFingerprint(),
  ];

  return hashString(parts.join('||'));
};

export const getDeviceId = async () => {
  if (deviceIdPromise) return deviceIdPromise;

  deviceIdPromise = (async () => {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;

    const fingerprint = await buildFingerprint();
    localStorage.setItem(DEVICE_ID_KEY, fingerprint);
    return fingerprint;
  })();

  return deviceIdPromise;
};
