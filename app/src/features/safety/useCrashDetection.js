import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const IMPACT_G = 3.5;       // sudden force spike
const STILL_G_DELTA = 0.15; // phone lying still afterwards (~1g, little variation)
const STILL_WINDOW_MS = 2500;

/**
 * Impact spike followed by stillness => probable crash.
 * Production would also fuse GPS speed drop (e.g. 30 km/h -> 0 in <2s).
 */
export function useCrashDetection({ enabled, onCrash }) {
  const impactAt = useRef(0);
  const stillSamples = useRef([]);
  const cb = useRef(onCrash);
  cb.current = onCrash;

  useEffect(() => {
    if (!enabled) return undefined;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const g = Math.sqrt(x * x + y * y + z * z);
      const t = Date.now();
      if (g > IMPACT_G) {
        impactAt.current = t;
        stillSamples.current = [];
        return;
      }
      if (!impactAt.current) return;
      stillSamples.current.push(g);
      if (t - impactAt.current >= STILL_WINDOW_MS) {
        const s = stillSamples.current;
        const still = s.length > 5 && s.every((v) => Math.abs(v - 1) < STILL_G_DELTA);
        impactAt.current = 0;
        stillSamples.current = [];
        if (still) cb.current?.();
      }
    });
    return () => sub.remove();
  }, [enabled]);
}
