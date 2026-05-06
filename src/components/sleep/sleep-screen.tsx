'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bar } from '@/components/primitives/bar';
import { SectionHeader } from '@/components/primitives/section-header';
import { Icon } from '@/components/primitives/icon';
import { logSleep, updateSleepLog, deleteSleepLog } from '@/app/(shell)/sleep/actions';
import type { SleepDay } from '@/types/lifeos';

const TARGET_HOURS = 7;

function StatCard({ label, value, unit, sub, accent = false }: {
  label: string; value: string; unit?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div className="label-eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em',
          color: accent ? 'var(--lo-accent)' : 'var(--lo-text)',
        }}>{value}</div>
        {unit && <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{unit}</div>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>{sub}</div>}
    </div>
  );
}

function fmtTime(decimal: number) {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function LogSleepDialog({ open, onOpenChange, editEntry, onDeleted }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editEntry?: SleepDay | null;
  onDeleted?: (id: string) => void;
}) {
  const [hours, setHours] = useState('7.5');
  const [bed, setBed] = useState('23.0');
  const [wake, setWake] = useState('6.5');
  const [quality, setQuality] = useState(4);
  const [pending, start] = useTransition();
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (editEntry) {
      setHours(String(editEntry.hours));
      setBed(String(editEntry.bed));
      setWake(String(editEntry.wake));
      setQuality(editEntry.quality);
    } else {
      setHours('7.5'); setBed('23.0'); setWake('6.5'); setQuality(4);
    }
  }, [editEntry, open]);

  const save = () => {
    const h = parseFloat(hours);
    const b = parseFloat(bed);
    const w = parseFloat(wake);
    if (isNaN(h) || isNaN(b) || isNaN(w)) return;
    start(async () => {
      if (editEntry) {
        await updateSleepLog(editEntry.id, { hours: h, bed_time: b, wake_time: w, quality });
      } else {
        await logSleep({ hours: h, bed_time: b, wake_time: w, quality });
      }
      onOpenChange(false);
    });
  };

  const handleDelete = () => {
    if (!editEntry) return;
    startDelete(async () => {
      await deleteSleepLog(editEntry.id);
      onDeleted?.(editEntry.id);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 14, maxWidth: 400 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 18, fontWeight: 500 }}>{editEntry ? 'Edytuj wpis' : 'Zaloguj sen'}</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Godziny (h)</div>
              <Input value={hours} onChange={e => setHours(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Zasnięcie</div>
              <Input placeholder="23.0" value={bed} onChange={e => setBed(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 5 }}>Wstanie</div>
              <Input placeholder="6.5" value={wake} onChange={e => setWake(e.target.value)}
                style={{ background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)', color: 'var(--lo-text)', fontFamily: 'var(--font-geist-mono)' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)', marginBottom: 8 }}>Jakość</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} onClick={() => setQuality(q)} style={{
                  flex: 1, height: 34,
                  background: quality === q ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                  color: quality === q ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                  border: '1px solid ' + (quality === q ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-geist-mono)',
                }}>{q}</button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
            Czas jako liczba: 23.5 = 23:30, 6.75 = 6:45
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editEntry && (
                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={handleDelete}
                  style={{ color: 'var(--lo-danger)', paddingLeft: 0 }}
                >
                  {deleting ? '…' : 'Usuń'}
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: 'var(--lo-text-muted)' }}>
                Anuluj
              </Button>
              <Button disabled={pending} onClick={save}
                style={{ background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)', border: '1px solid var(--lo-accent-line)' }}>
                {pending ? 'Zapisywanie…' : 'Zapisz'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SleepScreen({ initialDays = [] }: { initialDays?: SleepDay[] }) {
  const [logOpen, setLogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SleepDay | null>(null);
  const [days, setDays] = useState<SleepDay[]>(initialDays);

  const handleDeleted = (id: string) => {
    setDays(prev => prev.filter(d => d.id !== id));
  };

  const stats = useMemo(() => {
    if (days.length === 0) return null;
    const avg = days.reduce((s, d) => s + d.hours, 0) / days.length;
    const consistencyDays = days.filter(d => d.hours >= TARGET_HOURS).length;
    const consistencyPct = Math.round((consistencyDays / days.length) * 100);
    const best = Math.max(...days.map(d => d.hours));
    const avgBed = days.reduce((s, d) => s + d.bed, 0) / days.length;

    const qualityCounts = [0, 0, 0, 0, 0];
    days.forEach(d => { if (d.quality >= 1 && d.quality <= 5) qualityCounts[d.quality - 1]++; });

    return { avg, consistencyPct, best, avgBed, qualityCounts };
  }, [days]);

  const qualityColors = [
    'var(--lo-danger)',
    'var(--lo-warn)',
    'var(--lo-text-faint)',
    'var(--lo-accent)',
    'var(--lo-accent)',
  ];
  const qualityLabels = ['Bardzo słaby · 1', 'Słaby · 2', 'Średni · 3', 'Dobry · 4', 'Bardzo dobry · 5'];

  return (
    <>
      <LogSleepDialog open={logOpen} onOpenChange={setLogOpen} />
      <LogSleepDialog
        open={!!editEntry}
        onOpenChange={v => { if (!v) setEditEntry(null); }}
        editEntry={editEntry}
        onDeleted={handleDeleted}
      />
      <div className="lo-screen" style={{
        padding: '20px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 16,
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow">Sen</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              Ostatnie 30 dni
            </div>
          </div>
          <button onClick={() => setLogOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 34, padding: '0 14px',
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit',
          }}>
            <Icon name="plus" size={13} /> Zaloguj sen
          </button>
        </div>

        {/* Stats */}
        <div className="lo-grid-4col">
          {stats ? (
            <>
              <StatCard
                label="Średnia"
                value={stats.avg.toFixed(1)}
                unit="h"
                sub={`cel ${TARGET_HOURS} h`}
                accent={stats.avg >= TARGET_HOURS}
              />
              <StatCard
                label="Konsekwencja"
                value={String(stats.consistencyPct)}
                unit="%"
                sub={`${TARGET_HOURS}+ h nocy`}
                accent={stats.consistencyPct >= 70}
              />
              <StatCard
                label="Najlepsza noc"
                value={stats.best.toFixed(1)}
                unit="h"
                sub="ostatnie 30 dni"
              />
              <StatCard
                label="Średni go-to-bed"
                value={fmtTime(stats.avgBed)}
                sub="cel 22:30"
              />
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
                borderRadius: 12, padding: '18px 20px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div className="label-eyebrow">—</div>
                <div style={{ fontSize: 22, color: 'var(--lo-text-dim)' }}>—</div>
              </div>
            ))
          )}
        </div>

        {/* Bars chart */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px',
        }}>
          <SectionHeader eyebrow={`Długość snu · ${days.length} dni`} title="Codzienne logi" />
          {days.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '20px 0' }}>
              Brak wpisów snu — kliknij „Zaloguj sen" żeby zacząć.
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 5, height: 200,
                padding: '12px 0', borderBottom: '1px solid var(--lo-border)',
              }}>
                {days.map((d, i) => {
                  const target = d.hours >= TARGET_HOURS;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        title={`${d.hours.toFixed(1)} h · jakość ${d.quality}/5`}
                        style={{
                          width: '100%', maxWidth: 18,
                          height: Math.max(2, (d.hours / 10) * 180),
                          background: target ? 'var(--lo-accent)' : 'var(--lo-surface-2)',
                          opacity: target ? 0.85 : 1,
                          border: target ? 'none' : '1px solid var(--lo-border-strong)',
                          borderRadius: '3px 3px 0 0',
                          cursor: 'pointer',
                        }}
                        onClick={() => setEditEntry(d)}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-geist-mono)' }}>
                <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>30 dni temu</span>
                <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>cel: {TARGET_HOURS} h ▬</span>
                <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>dziś</span>
              </div>
            </>
          )}
        </div>

        {/* Quality */}
        <div style={{
          background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
          borderRadius: 12, padding: '18px 20px', maxWidth: 500,
        }}>
          <SectionHeader eyebrow="Rozkład jakości" title="Subiektywna ocena" />
          {!stats || stats.qualityCounts.every(c => c === 0) ? (
            <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '8px 0' }}>
              Brak danych o jakości snu.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[4, 3, 2, 1, 0].map(qi => (
                <div key={qi}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{qualityLabels[qi]}</span>
                    <span style={{
                      fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                      fontSize: 11, color: 'var(--lo-text-muted)',
                    }}>{stats.qualityCounts[qi]} dni</span>
                  </div>
                  <Bar value={stats.qualityCounts[qi]} max={Math.max(...(stats?.qualityCounts ?? [1]), 1)} h={4} color={qualityColors[qi]} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log table */}
        {days.length > 0 && (
          <div style={{
            background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--lo-border)' }} className="label-eyebrow">
              Logi — kliknij aby edytować
            </div>
            {[...days].reverse().slice(0, 14).map((d, i, arr) => (
              <div
                key={d.id}
                onClick={() => setEditEntry(d)}
                style={{
                  display: 'grid', gridTemplateColumns: '120px 80px 80px 80px 1fr',
                  alignItems: 'center', gap: 12,
                  padding: '11px 18px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--lo-border)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--lo-bg-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>
                  {new Date(d.dateStr).toLocaleDateString('pl', { weekday: 'short', day: '2-digit', month: 'short' })}
                </div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 500,
                  color: d.hours >= TARGET_HOURS ? 'var(--lo-accent)' : 'var(--lo-text)' }}>
                  {d.hours.toFixed(1)} h
                </div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-muted)' }}>
                  {fmtTime(d.bed)} ↓
                </div>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-muted)' }}>
                  {fmtTime(d.wake)} ↑
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(q => (
                    <div key={q} style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: q <= d.quality ? qualityColors[d.quality - 1] : 'var(--lo-border)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
