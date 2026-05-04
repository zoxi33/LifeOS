'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@/components/primitives/icon';
import { Sparkline } from '@/components/primitives/sparkline';
import { SectionHeader } from '@/components/primitives/section-header';
import { LogWeightDialog } from './log-weight-dialog';
import type { WeightEntry } from '@/types/lifeos';

const PERIODS = ['7d', '30d', '90d', 'rok'] as const;
type Period = typeof PERIODS[number];

function periodDays(p: Period): number {
  return p === '7d' ? 7 : p === '30d' ? 30 : p === '90d' ? 90 : 365;
}

export function WeightScreen({
  initialEntries = [],
  rawPoints = [],
}: {
  initialEntries?: WeightEntry[];
  rawPoints?: { date: string; weight: number }[];
}) {
  const [logOpen, setLogOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('90d');

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays(period));
    return rawPoints.filter(p => new Date(p.date) >= cutoff);
  }, [rawPoints, period]);

  const series = filtered.map(p => p.weight);

  const minW = series.length ? Math.min(...series) : 0;
  const maxW = series.length ? Math.max(...series) : 0;
  const currentWeight = series.length ? series[series.length - 1] : null;
  const firstWeight = series.length ? series[0] : null;
  const change = (currentWeight != null && firstWeight != null) ? currentWeight - firstWeight : null;

  const TARGET_WEIGHT = 79;
  const targetY = series.length
    ? 240 - ((TARGET_WEIGHT - minW) / ((maxW - minW) || 1)) * 236 - 2
    : 120;

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString('pl', { day: '2-digit', month: 'short' });

  return (
    <>
      <LogWeightDialog open={logOpen} onOpenChange={setLogOpen} />
      <div className="lo-screen" style={{
        padding: '20px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 16,
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow">Waga</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              {change != null
                ? `${change >= 0 ? '+' : ''}${change.toFixed(1)} kg / ${period}`
                : 'Brak danych'}
            </div>
          </div>
          <button onClick={() => setLogOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 32, padding: '0 12px',
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Icon name="plus" size={13} /> Zaloguj
          </button>
        </div>

        {/* Big stats */}
        <div className="lo-grid-4col">
          {[
            { l: 'Obecna',  v: currentWeight != null ? currentWeight.toFixed(1) : '—', u: 'kg', good: true },
            { l: 'Zmiana',  v: change != null ? (change >= 0 ? '+' : '') + change.toFixed(1) : '—', u: change != null ? 'kg' : '', good: change != null && change < 0 },
            { l: 'Min',     v: series.length ? minW.toFixed(1) : '—', u: series.length ? 'kg' : '' },
            { l: 'Max',     v: series.length ? maxW.toFixed(1) : '—', u: series.length ? 'kg' : '' },
          ].map(s => (
            <div key={s.l} style={{
              background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
              borderRadius: 12, padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div className="label-eyebrow">{s.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <div style={{
                  fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                  fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em',
                  color: s.good ? 'var(--lo-accent)' : 'var(--lo-text)',
                }}>{s.v}</div>
                {s.u && <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{s.u}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Sparkline card */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px',
        }}>
          <SectionHeader
            eyebrow={`Trend · ${period}`}
            title="Linia wagi"
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    display: 'inline-flex', alignItems: 'center',
                    height: 32, padding: '0 12px',
                    background: p === period ? 'var(--lo-surface-2)' : 'transparent',
                    border: '1px solid ' + (p === period ? 'var(--lo-border-strong)' : 'transparent'),
                    color: p === period ? 'var(--lo-text)' : 'var(--lo-text-muted)',
                    borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{p}</button>
                ))}
              </div>
            }
          />
          {series.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '20px 0' }}>
              Brak danych w tym okresie.
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', height: 240 }}>
                <Sparkline w={1100} h={240} fill data={series} />
                {TARGET_WEIGHT >= minW && TARGET_WEIGHT <= maxW + 1 && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0,
                    top: Math.max(0, Math.min(230, targetY)),
                    borderTop: '1px dashed var(--lo-border-strong)',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      position: 'absolute', right: 0, top: -16,
                      fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-faint)',
                      background: 'var(--lo-surface)', padding: '0 6px',
                    }}>cel {TARGET_WEIGHT.toFixed(1)} kg</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-geist-mono)' }}>
                <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>
                  {filtered.length > 0 ? dateLabel(filtered[0].date) : ''}
                </span>
                <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>
                  {filtered.length > 0 ? dateLabel(filtered[filtered.length - 1].date) : ''}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Log table */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--lo-border)' }} className="label-eyebrow">
            Ostatnie pomiary
          </div>
          {initialEntries.length === 0 ? (
            <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--lo-text-muted)' }}>
              Brak pomiarów — kliknij „Zaloguj".
            </div>
          ) : (
            initialEntries.map((e, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                alignItems: 'center', gap: 14,
                padding: '12px 18px',
                borderBottom: i < initialEntries.length - 1 ? '1px solid var(--lo-border)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: 'var(--lo-text-muted)' }}>{e.d}</div>
                <div style={{
                  textAlign: 'right', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                  fontSize: 14, fontWeight: 500,
                }}>
                  {e.w} <span style={{ color: 'var(--lo-text-faint)', fontSize: 11 }}>kg</span>
                </div>
                <div style={{
                  textAlign: 'right', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                  fontSize: 12,
                  color: e.delta < 0 ? 'var(--lo-accent)' : e.delta > 0 ? 'var(--lo-warn)' : 'var(--lo-text-faint)',
                }}>
                  {e.delta !== 0 ? (e.delta > 0 ? '+' : '') + e.delta.toFixed(1) : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
