'use client';

import { useState, useTransition, useRef } from 'react';
import { addWaterMl, setWaterMl, setWaterTarget } from '@/app/(shell)/water/actions';
import { fmtWater, fmtWaterShort } from '@/lib/water-utils';
import type { WaterLog } from '@/app/(shell)/water/actions';

const QUICK_ADD = [200, 250, 330, 500];

export function WaterWidget({ initial, onMlChange }: { initial: WaterLog; onMlChange?: (ml: number) => void }) {
  const [ml, setMl] = useState(initial.ml);
  const [targetMl, setTargetMl] = useState(initial.targetMl);
  const [editTarget, setEditTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(initial.targetMl / 1000));
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [, startAdd] = useTransition();
  const [savingTarget, startTarget] = useTransition();
  const targetRef = useRef<HTMLInputElement>(null);

  const pct = Math.min(100, Math.round((ml / targetMl) * 100));
  const done = ml >= targetMl;
  const remaining = Math.max(0, targetMl - ml);

  const doAdd = (amount: number) => {
    const next = Math.max(0, ml + amount);
    setMl(next);
    onMlChange?.(next);
    startAdd(() => addWaterMl(amount, ml, targetMl));
  };

  const doUndo = () => {
    const next = Math.max(0, ml - QUICK_ADD[0]);
    setMl(next);
    onMlChange?.(next);
    startAdd(() => setWaterMl(next, targetMl));
  };

  const doCustomAdd = () => {
    const v = parseInt(customInput);
    if (!isNaN(v) && v > 0) { doAdd(v); setCustomInput(''); setShowCustom(false); }
  };

  const saveTarget = () => {
    const l = parseFloat(targetInput.replace(',', '.'));
    if (isNaN(l) || l <= 0) { setEditTarget(false); return; }
    const newTarget = Math.round(l * 1000);
    setTargetMl(newTarget);
    setTargetInput(String(newTarget / 1000));
    setEditTarget(false);
    startTarget(() => setWaterTarget(newTarget));
  };

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
        {editTarget ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              ref={targetRef}
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') setEditTarget(false); }}
              onBlur={saveTarget}
              autoFocus
              style={{
                width: 56, height: 24, padding: '0 6px', textAlign: 'right',
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-info)',
                borderRadius: 5, color: 'var(--lo-text)',
                fontFamily: 'var(--font-geist-mono)', fontSize: 12,
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>L / dzień</span>
          </div>
        ) : (
          <button
            onClick={() => setEditTarget(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-geist-mono)', fontSize: 11,
              color: savingTarget ? 'var(--lo-text-dim)' : 'var(--lo-text-faint)',
              textDecoration: 'underline dotted',
            }}
          >
            cel: {targetMl / 1000} L / dzień
          </button>
        )}
      </div>

      {/* Big counter */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 42, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1,
          color: done ? 'var(--lo-info)' : ml > 0 ? 'var(--lo-text)' : 'var(--lo-text-dim)',
        }}>
          {(ml / 1000).toFixed(2).replace(/\.?0+$/, '') || '0'}
        </span>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 16, color: 'var(--lo-text-faint)' }}>
          L
        </span>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: 'var(--lo-text-dim)', marginLeft: 4 }}>
          / {targetMl / 1000} L
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 6, background: 'var(--lo-border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: done ? 'var(--lo-info)' : 'oklch(0.74 0.10 235 / 0.65)',
            borderRadius: 999, transition: 'width .3s ease',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
          {done ? '✓ cel osiągnięty' : `zostało ${fmtWater(remaining)}`}
        </div>
      </div>

      {/* Quick-add buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK_ADD.map(amt => (
          <button
            key={amt}
            onClick={() => doAdd(amt)}
            style={{
              height: 32, padding: '0 12px',
              background: 'oklch(0.74 0.10 235 / 0.1)',
              border: '1px solid oklch(0.74 0.10 235 / 0.3)',
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-geist-mono)', fontSize: 12,
              color: 'var(--lo-info)',
              transition: 'background .1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.74 0.10 235 / 0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.74 0.10 235 / 0.1)'; }}
          >
            +{fmtWaterShort(amt)}
          </button>
        ))}

        {/* Custom amount */}
        {showCustom ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              autoFocus
              value={customInput}
              onChange={e => setCustomInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') doCustomAdd(); if (e.key === 'Escape') setShowCustom(false); }}
              onBlur={() => { if (!customInput) setShowCustom(false); }}
              placeholder="ml"
              style={{
                width: 60, height: 32, padding: '0 8px',
                background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
                borderRadius: 8, color: 'var(--lo-text)',
                fontFamily: 'var(--font-geist-mono)', fontSize: 12,
              }}
            />
            <button
              onClick={doCustomAdd}
              style={{
                height: 32, padding: '0 10px',
                background: 'var(--lo-info)', border: 'none',
                borderRadius: 8, color: 'var(--lo-bg)',
                fontFamily: 'var(--font-geist-mono)', fontSize: 12, cursor: 'pointer',
              }}
            >+</button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            style={{
              height: 32, padding: '0 10px',
              background: 'transparent', border: '1px dashed var(--lo-border)',
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-geist-mono)', fontSize: 12,
              color: 'var(--lo-text-dim)',
            }}
          >+ inne</button>
        )}

        {/* Undo last */}
        {ml > 0 && (
          <button
            onClick={doUndo}
            title="Cofnij ostatnie"
            style={{
              height: 32, padding: '0 10px',
              background: 'transparent', border: '1px solid transparent',
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-geist-mono)', fontSize: 11,
              color: 'var(--lo-text-dim)', marginLeft: 'auto',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--lo-border)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
          >cofnij</button>
        )}
      </div>
    </div>
  );
}
