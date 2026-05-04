'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TweakValues, SetTweak } from '@/types/lifeos';

const STORAGE_KEY = 'lifeos-tweaks';

export const TWEAK_DEFAULTS: TweakValues = {
  accentHue:        145,
  accentChroma:     0.14,
  density:          'default',
  streakProminence: 'medium',
  showXP:           true,
};

export function useTweaks(): [TweakValues, SetTweak] {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setValues(prev => ({ ...prev, ...JSON.parse(stored) as Partial<TweakValues> }));
      }
    } catch { /* ignore */ }
  }, []);

  // Apply accent CSS vars whenever they change
  useEffect(() => {
    const h = values.accentHue;
    const c = values.accentChroma;
    const root = document.documentElement;
    root.style.setProperty('--lo-accent',      `oklch(0.78 ${c} ${h})`);
    root.style.setProperty('--lo-accent-soft',  `oklch(0.78 ${c} ${h} / 0.14)`);
    root.style.setProperty('--lo-accent-line',  `oklch(0.78 ${c} ${h} / 0.32)`);
    root.style.setProperty('--lo-success',      `oklch(0.78 ${c} ${h})`);
  }, [values.accentHue, values.accentChroma]);

  const setTweak: SetTweak = useCallback((key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return [values, setTweak];
}
