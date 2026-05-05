'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createHabit } from '@/app/(shell)/habits/actions';
import type { HabitFull } from '@/types/lifeos';

const DAYS = [
  { key: 0, short: 'Pn' },
  { key: 1, short: 'Wt' },
  { key: 2, short: 'Śr' },
  { key: 3, short: 'Cz' },
  { key: 4, short: 'Pt' },
  { key: 5, short: 'Sb' },
  { key: 6, short: 'Nd' },
];

const DAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

type FreqMode = 'count' | 'days';

function buildFreqString(mode: FreqMode, count: number, days: number[]): string {
  if (mode === 'count') {
    if (count === 7) return 'codziennie';
    return `${count}× w tygodniu`;
  }
  if (days.length === 7) return 'codziennie';
  if (days.length === 0) return 'brak dni';
  const sorted = [...days].sort((a, b) => a - b);
  // check Pon–Pt
  if (sorted.length === 5 && sorted.every((d, i) => d === i)) return 'Pn–Pt';
  // check Sb–Nd
  if (sorted.length === 2 && sorted[0] === 5 && sorted[1] === 6) return 'Sb–Nd';
  return sorted.map(d => DAY_LABELS[d]).join(' · ');
}

export function AddHabitDialog({ open, onOpenChange, onAdded }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdded?: (habit: HabitFull) => void;
}) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<FreqMode>('count');
  const [count, setCount] = useState(7);
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [pending, start] = useTransition();

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const freq = buildFreqString(mode, count, days);
  const target = mode === 'count' ? count : days.length;
  const type = target === 7 ? 'daily' : mode === 'days' ? 'custom' : 'weekly';

  const save = () => {
    if (!name.trim() || target === 0) return;
    start(async () => {
      const habit = await createHabit({ name: name.trim(), freq, type, target });
      onAdded?.(habit);
      setName(''); setMode('count'); setCount(7); setDays([0, 1, 2, 3, 4]);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 14, maxWidth: 460,
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>Nowy nawyk</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>

          {/* Nazwa */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 6 }}>Nazwa</div>
            <Input
              autoFocus
              placeholder="np. Czytanie 30 min"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)' }}
            />
          </div>

          {/* Tryb częstotliwości */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 8 }}>Harmonogram</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['count', 'days'] as FreqMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, height: 34,
                  background: mode === m ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                  color: mode === m ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                  border: '1px solid ' + (mode === m ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                }}>
                  {m === 'count' ? 'X razy w tygodniu' : 'Konkretne dni'}
                </button>
              ))}
            </div>

            {mode === 'count' ? (
              /* ── Licznik 1–7 ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setCount(c => Math.max(1, c - 1))}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                    color: 'var(--lo-text)', fontSize: 18, display: 'grid', placeItems: 'center',
                  }}
                >−</button>

                <div style={{ flex: 1 }}>
                  {/* Wizualny slider 1–7 */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5,6,7].map(n => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        style={{
                          flex: 1, height: 32, borderRadius: 6,
                          background: n <= count ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                          border: '1px solid ' + (n === count ? 'var(--lo-accent-line)' : n < count ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                          color: n <= count ? 'var(--lo-accent)' : 'var(--lo-text-dim)',
                          fontSize: 12, fontFamily: 'var(--font-geist-mono)',
                        }}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCount(c => Math.min(7, c + 1))}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
                    color: 'var(--lo-text)', fontSize: 18, display: 'grid', placeItems: 'center',
                  }}
                >+</button>
              </div>
            ) : (
              /* ── Dni tygodnia ── */
              <div style={{ display: 'flex', gap: 6 }}>
                {DAYS.map(d => {
                  const active = days.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      onClick={() => toggleDay(d.key)}
                      style={{
                        flex: 1, height: 40, borderRadius: 8,
                        background: active ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                        border: '1px solid ' + (active ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                        color: active ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                        fontSize: 12, fontFamily: 'var(--font-geist-mono)', fontWeight: active ? 600 : 400,
                      }}
                    >{d.short}</button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Podgląd */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Harmonogram</span>
            <span style={{
              fontFamily: 'var(--font-geist-mono)', fontSize: 13, color: 'var(--lo-text)',
            }}>
              {freq}
              <span style={{ color: 'var(--lo-text-faint)', marginLeft: 6 }}>· {target}×/tydz</span>
            </span>
          </div>

          {/* Przyciski */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>
              Anuluj
            </Button>
            <Button
              disabled={!name.trim() || target === 0 || pending}
              onClick={save}
              style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}
            >
              {pending ? 'Dodawanie…' : 'Dodaj nawyk'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
