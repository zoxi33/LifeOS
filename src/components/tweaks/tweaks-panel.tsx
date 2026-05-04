'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { useTweaks, TWEAK_DEFAULTS } from '@/hooks/use-tweaks';
import type { TweakDensity, TweakStreakProminence } from '@/types/lifeos';

/* ─── Presets ──────────────────────────────────────────────────────────────── */
const PRESETS = [
  { label: 'Zielony',  hue: 145, chroma: 0.14 },
  { label: 'Bursztyn', hue: 75,  chroma: 0.13 },
  { label: 'Stalowy',  hue: 235, chroma: 0.10 },
  { label: 'Mono',     hue: 145, chroma: 0.00 },
] as const;

/* ─── Sub-components ───────────────────────────────────────────────────────── */
function Section({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: 'var(--lo-text-dim)', paddingTop: 6,
    }}>{label}</div>
  );
}

function TweakRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--lo-text-muted)', fontWeight: 500 }}>{label}</span>
        {value && (
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 11, color: 'var(--lo-text-faint)',
          }}>{value}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const n = options.length;
  const idx = Math.max(0, options.findIndex(o => o.value === value));

  return (
    <div style={{ position: 'relative', display: 'flex', padding: 2, borderRadius: 8, background: 'var(--lo-bg-2)', userSelect: 'none' }}>
      {/* Sliding thumb */}
      <div style={{
        position: 'absolute', top: 2, bottom: 2, borderRadius: 6,
        background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border-strong)',
        transition: 'left .15s cubic-bezier(.3,.7,.4,1), width .15s',
        left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
        width: `calc((100% - 4px) / ${n})`,
        pointerEvents: 'none',
      }} />
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            position: 'relative', zIndex: 1, flex: 1,
            border: 'none', background: 'transparent',
            color: o.value === value ? 'var(--lo-text)' : 'var(--lo-text-faint)',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 500,
            padding: '4px 6px', minHeight: 24,
            borderRadius: 6, cursor: 'pointer', lineHeight: 1.2,
            transition: 'color .15s',
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--lo-text-muted)', fontWeight: 500 }}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          position: 'relative', width: 32, height: 18, border: 'none',
          borderRadius: 999, cursor: 'pointer', padding: 0,
          background: value ? 'var(--lo-accent)' : 'var(--lo-border-strong)',
          transition: 'background .15s',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: 2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px oklch(0 0 0 / 0.25)',
          transition: 'transform .15s',
          transform: value ? 'translateX(14px)' : 'translateX(0)',
          display: 'block',
        }} />
      </button>
    </div>
  );
}

/* ─── TweaksPanel ──────────────────────────────────────────────────────────── */
interface TweaksPanelProps {
  onClose: () => void;
}

export function TweaksPanel({ onClose }: TweaksPanelProps) {
  const [tweaks, setTweak] = useTweaks();
  const panelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ right: 16, bottom: 72 });

  const clamp = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const PAD = 16;
    const maxRight  = Math.max(PAD, window.innerWidth  - el.offsetWidth  - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - el.offsetHeight - PAD);
    offsetRef.current = {
      right:  Math.min(maxRight,  Math.max(PAD, offsetRef.current.right)),
      bottom: Math.min(maxBottom, Math.max(PAD, offsetRef.current.bottom)),
    };
    el.style.right  = offsetRef.current.right  + 'px';
    el.style.bottom = offsetRef.current.bottom + 'px';
  }, []);

  useEffect(() => {
    clamp();
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [clamp]);

  const onDragStart = (e: React.MouseEvent) => {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight  = window.innerWidth  - r.right;
    const startBottom = window.innerHeight - r.bottom;

    const move = (ev: MouseEvent) => {
      offsetRef.current = {
        right:  startRight  - (ev.clientX - sx),
        bottom: startBottom - (ev.clientY - sy),
      };
      clamp();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const reset = () => {
    (Object.keys(TWEAK_DEFAULTS) as (keyof typeof TWEAK_DEFAULTS)[]).forEach(k => {
      setTweak(k, TWEAK_DEFAULTS[k]);
    });
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed', right: 16, bottom: 72, zIndex: 200,
        width: 280, maxHeight: 'calc(100vh - 32px)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--lo-surface)',
        border: '1px solid var(--lo-border-strong)',
        borderRadius: 14,
        boxShadow: '0 20px 60px oklch(0 0 0 / 0.55)',
        overflow: 'hidden',
      }}
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={onDragStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 8px 10px 14px',
          cursor: 'move', userSelect: 'none',
          borderBottom: '1px solid var(--lo-border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>Tweaks</span>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          style={{
            display: 'grid', placeItems: 'center',
            width: 22, height: 22, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: 'var(--lo-text-muted)', cursor: 'pointer', fontSize: 13,
          }}
        >✕</button>
      </div>

      {/* Body */}
      <div style={{
        padding: '10px 14px 14px',
        display: 'flex', flexDirection: 'column', gap: 12,
        overflowY: 'auto', minHeight: 0,
      }}>
        <Section label="Akcent" />

        <TweakRow label="Odcień" value={`${tweaks.accentHue}°`}>
          <Slider
            value={[tweaks.accentHue]}
            onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : v; setTweak('accentHue', n); }}
            min={0} max={360} step={1}
          />
        </TweakRow>

        <TweakRow label="Nasycenie" value={tweaks.accentChroma.toFixed(2)}>
          <Slider
            value={[tweaks.accentChroma]}
            onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : v; setTweak('accentChroma', n); }}
            min={0} max={0.3} step={0.01}
          />
        </TweakRow>

        {/* Preset swatch buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESETS.map(p => {
            const isActive = tweaks.accentHue === p.hue && Math.abs(tweaks.accentChroma - p.chroma) < 0.005;
            return (
              <button
                key={p.label}
                onClick={() => { setTweak('accentHue', p.hue); setTweak('accentChroma', p.chroma); }}
                style={{
                  flex: 1, height: 26, padding: '0 4px',
                  background: isActive ? 'var(--lo-surface-2)' : 'var(--lo-bg-2)',
                  border: '1px solid ' + (isActive ? 'var(--lo-border-strong)' : 'var(--lo-border)'),
                  borderRadius: 7, fontSize: 11, cursor: 'pointer',
                  color: isActive ? 'var(--lo-text)' : 'var(--lo-text-muted)',
                  fontFamily: 'inherit', transition: 'background .12s, color .12s',
                }}
              >{p.label}</button>
            );
          })}
        </div>

        <Section label="Układ" />

        <TweakRow label="Gęstość">
          <SegmentedControl<TweakDensity>
            options={[
              { value: 'compact',  label: 'Ciasno' },
              { value: 'default',  label: 'Normal' },
              { value: 'loose',    label: 'Luźno'  },
            ]}
            value={tweaks.density}
            onChange={v => setTweak('density', v)}
          />
        </TweakRow>

        <TweakRow label="Streak card">
          <SegmentedControl<TweakStreakProminence>
            options={[
              { value: 'subtle', label: 'Mały'   },
              { value: 'medium', label: 'Średni' },
              { value: 'high',   label: 'Duży'   },
            ]}
            value={tweaks.streakProminence}
            onChange={v => setTweak('streakProminence', v)}
          />
        </TweakRow>

        <ToggleRow
          label="Pokaż XP"
          value={tweaks.showXP}
          onChange={v => setTweak('showXP', v)}
        />

        {/* Reset */}
        <button
          onClick={reset}
          style={{
            marginTop: 2, height: 28, padding: '0 12px',
            background: 'var(--lo-surface-2)',
            border: '1px solid var(--lo-border)',
            borderRadius: 7, fontSize: 11, cursor: 'pointer',
            color: 'var(--lo-text-muted)', fontFamily: 'inherit',
            alignSelf: 'flex-start',
          }}
        >Reset do domyślnych</button>
      </div>
    </div>
  );
}
