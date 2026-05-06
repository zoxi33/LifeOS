'use client';

import { useState, useTransition, useRef } from 'react';
import { setWaterGlasses, setWaterTarget } from '@/app/(shell)/water/actions';
import { litresToGlasses, glassesToLitres } from '@/lib/water-utils';
import type { WaterLog } from '@/app/(shell)/water/actions';

function DropIcon({ filled, size = 28 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path
        d="M12 2C6 9 4 13 4 16a8 8 0 0016 0c0-3-2-7-8-14z"
        fill={filled ? 'var(--lo-info)' : 'transparent'}
        stroke={filled ? 'var(--lo-info)' : 'var(--lo-border-strong)'}
      />
    </svg>
  );
}

export function WaterWidget({ initial }: { initial: WaterLog }) {
  const [glasses, setGlasses] = useState(initial.glasses);
  const [target, setTarget] = useState(initial.target);
  const [editingTarget, setEditingTarget] = useState(false);
  const [litreInput, setLitreInput] = useState(String(glassesToLitres(initial.target)));
  const [, startGlasses] = useTransition();
  const [savingTarget, startTarget] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: number) => {
    const clamped = Math.max(0, Math.min(next, target + 4));
    setGlasses(clamped);
    startGlasses(() => setWaterGlasses(clamped, target));
  };

  const saveTarget = () => {
    const l = parseFloat(litreInput.replace(',', '.'));
    if (isNaN(l) || l <= 0) { setEditingTarget(false); return; }
    const newTarget = litresToGlasses(l);
    setTarget(newTarget);
    setLitreInput(String(glassesToLitres(newTarget)));
    setEditingTarget(false);
    startTarget(() => setWaterTarget(newTarget));
  };

  const pct = Math.min(100, Math.round((glasses / target) * 100));
  const done = glasses >= target;

  return (
    <div style={{
      background: 'var(--lo-surface)',
      border: '1px solid ' + (done ? 'oklch(0.74 0.10 235 / 0.4)' : 'var(--lo-border)'),
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="label-eyebrow">Nawodnienie</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Target editor */}
          {editingTarget ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                ref={inputRef}
                value={litreInput}
                onChange={e => setLitreInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') setEditingTarget(false); }}
                onBlur={saveTarget}
                autoFocus
                style={{
                  width: 52, height: 24, padding: '0 6px',
                  background: 'var(--lo-bg-2)', border: '1px solid var(--lo-info)',
                  borderRadius: 5, color: 'var(--lo-text)',
                  fontFamily: 'var(--font-geist-mono)', fontSize: 12,
                  textAlign: 'right',
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>l</span>
            </div>
          ) : (
            <button
              onClick={() => { setEditingTarget(true); setTimeout(() => inputRef.current?.select(), 30); }}
              title="Zmień cel dzienny"
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'var(--font-geist-mono)', fontSize: 11,
                color: 'var(--lo-text-faint)', fontVariantNumeric: 'tabular-nums',
                textDecoration: 'underline dotted',
                opacity: savingTarget ? 0.5 : 1,
              }}
            >
              cel: {glassesToLitres(target)} l
            </button>
          )}
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 11,
            color: done ? 'var(--lo-info)' : 'var(--lo-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {glasses}/{target} szklanek
          </span>
        </div>
      </div>

      {/* Drop grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: target }, (_, i) => (
          <button
            key={i}
            onClick={() => update(i < glasses ? i : i + 1)}
            title={i < glasses ? 'Odznacz' : 'Dodaj szklankę'}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', lineHeight: 0,
              transition: 'transform .1s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <DropIcon filled={i < glasses} size={28} />
          </button>
        ))}
        {glasses > target && Array.from({ length: glasses - target }, (_, i) => (
          <button key={`extra-${i}`} onClick={() => update(glasses - 1)} title="Usuń"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
            <DropIcon filled size={28} />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 4, background: 'var(--lo-border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: done ? 'var(--lo-info)' : 'oklch(0.74 0.10 235 / 0.6)',
            borderRadius: 999, transition: 'width .25s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
            {done ? '✓ cel osiągnięty' : `zostało ${target - glasses} szklanek (${glassesToLitres(target - glasses)} l)`}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => update(glasses - 1)}
              disabled={glasses === 0}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                color: 'var(--lo-text-muted)', display: 'grid', placeItems: 'center',
                cursor: glasses === 0 ? 'not-allowed' : 'pointer',
                opacity: glasses === 0 ? 0.4 : 1, fontSize: 16, lineHeight: 1,
              }}
            >−</button>
            <button
              onClick={() => update(glasses + 1)}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'var(--lo-info)', border: 'none',
                color: 'var(--lo-bg)', display: 'grid', placeItems: 'center',
                cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}
            >+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
