'use client';

import { useState, useTransition } from 'react';
import { SectionHeader } from '@/components/primitives/section-header';
import { Icon } from '@/components/primitives/icon';
import { logSleep } from '@/app/(shell)/sleep/actions';
import { logWeight } from '@/app/(shell)/weight/actions';
import { createJournalEntry } from '@/app/(shell)/journal/actions';

function MoodLogger({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`Nastrój ${m}`}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid ' + (value === m ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
            background: value === m ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
            color: value === m ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-geist-mono)', fontSize: 13,
          }}
        >{m}</button>
      ))}
    </div>
  );
}

export function QuickLog() {
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(7.5);
  const [weight, setWeight] = useState(80.0);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const save = () => {
    start(async () => {
      const today = new Date().toISOString().slice(0, 10);
      await Promise.all([
        logSleep({ hours: sleep, bed_time: 23, wake_time: 6.5, quality: mood }),
        logWeight(weight),
        createJournalEntry({
          date: today,
          title: '',
          body: '',
          mood,
          sleep_hours: sleep,
          weight_kg: weight,
          tags: [],
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <SectionHeader eyebrow="Szybki wpis" title="Zaloguj dziś" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Nastrój */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Nastrój</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>{mood}/5</div>
          </div>
          <MoodLogger value={mood} onChange={setMood} />
        </div>

        {/* Sen */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Sen wczoraj</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{sleep.toFixed(1)} h</div>
          </div>
          <input
            type="range" min="3" max="12" step="0.25" value={sleep}
            onChange={e => setSleep(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--lo-accent)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-geist-mono)' }}>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>3h</span>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>12h</span>
          </div>
        </div>

        {/* Waga */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Waga</div>
            <div style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{weight.toFixed(1)} kg</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setWeight(w => +(w - 0.1).toFixed(1))}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                background: 'var(--lo-surface-2)', color: 'var(--lo-text)',
                border: '1px solid var(--lo-border)', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <Icon name="minus" size={13} />
            </button>
            <div style={{
              flex: 1, textAlign: 'center',
              background: 'var(--lo-bg-2)', border: '1px solid var(--lo-border)',
              borderRadius: 8, padding: '6px 0',
            }}>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 16, fontWeight: 500 }}>{weight.toFixed(1)}</span>
              <span style={{ color: 'var(--lo-text-faint)', fontSize: 12, marginLeft: 4 }}>kg</span>
            </div>
            <button
              onClick={() => setWeight(w => +(w + 0.1).toFixed(1))}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32,
                background: 'var(--lo-surface-2)', color: 'var(--lo-text)',
                border: '1px solid var(--lo-border)', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <Icon name="plus" size={13} />
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={save}
          disabled={pending}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            height: 36, gap: 6,
            background: saved ? 'var(--lo-accent-soft)' : 'var(--lo-accent-soft)',
            color: saved ? 'var(--lo-accent)' : 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: pending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? 'Zapisywanie…' : saved ? '✓ Zapisano' : 'Zapisz wpis'}
        </button>
      </div>
    </div>
  );
}
