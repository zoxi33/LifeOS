'use client';

import { useState, useTransition } from 'react';
import { SectionHeader } from '@/components/primitives/section-header';
import { Icon } from '@/components/primitives/icon';
import { logSleep } from '@/app/(shell)/sleep/actions';
import { logWeight } from '@/app/(shell)/weight/actions';
import { createJournalEntry } from '@/app/(shell)/journal/actions';

const MOOD_LABELS = ['', 'Kiepski', 'Słaby', 'Średni', 'Dobry', 'Świetny'];

type SavedField = 'mood' | 'sleep' | 'weight';

function SaveButton({ onClick, pending, saved }: { onClick: () => void; pending: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      style={{
        height: 28, padding: '0 12px',
        background: saved ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
        color: saved ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
        border: '1px solid ' + (saved ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
        borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.6 : 1, transition: 'all 0.15s',
      }}
    >
      {pending ? '…' : saved ? '✓ Zapisano' : 'Zapisz'}
    </button>
  );
}

export function QuickLog() {
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(7.5);
  const [weight, setWeight] = useState(80.0);
  const [saved, setSaved] = useState<SavedField | null>(null);
  const [pendingMood, startMood] = useTransition();
  const [pendingSleep, startSleep] = useTransition();
  const [pendingWeight, startWeight] = useTransition();

  const flashSaved = (field: SavedField) => {
    setSaved(field);
    setTimeout(() => setSaved(null), 2500);
  };

  const saveMood = () => {
    const today = new Date().toISOString().slice(0, 10);
    startMood(async () => {
      await createJournalEntry({ date: today, title: '', body: '', mood, sleep_hours: null, weight_kg: null, tags: [] });
      flashSaved('mood');
    });
  };

  const saveSleep = () => {
    startSleep(async () => {
      await logSleep({ hours: sleep, bed_time: 23, wake_time: 6.5, quality: mood });
      flashSaved('sleep');
    });
  };

  const saveWeight = () => {
    startWeight(async () => {
      await logWeight(weight);
      flashSaved('weight');
    });
  };

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <SectionHeader eyebrow="Szybki wpis" title="Zaloguj dziś" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Nastrój */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>
              Nastrój
              {mood > 0 && <span style={{ marginLeft: 6, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)', fontSize: 11 }}>{MOOD_LABELS[mood]}</span>}
            </div>
            <SaveButton onClick={saveMood} pending={pendingMood} saved={saved === 'mood'} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                aria-label={`Nastrój ${m}`}
                style={{
                  flex: 1, height: 36, borderRadius: 8,
                  border: '1px solid ' + (mood === m ? 'var(--lo-accent-line)' : 'var(--lo-border)'),
                  background: mood === m ? 'var(--lo-accent-soft)' : 'var(--lo-surface-2)',
                  color: mood === m ? 'var(--lo-accent)' : 'var(--lo-text-muted)',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-geist-mono)', fontSize: 13,
                }}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Sen */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>
              Sen wczoraj
              <span style={{ marginLeft: 6, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)', fontSize: 11 }}>{sleep.toFixed(1)} h</span>
            </div>
            <SaveButton onClick={saveSleep} pending={pendingSleep} saved={saved === 'sleep'} />
          </div>
          <input
            type="range" min="3" max="12" step="0.25" value={sleep}
            onChange={e => setSleep(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--lo-accent)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-geist-mono)' }}>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>3 h</span>
            <span style={{ fontSize: 10, color: sleep >= 7 ? 'var(--lo-accent)' : 'var(--lo-text-dim)' }}>cel 7 h</span>
            <span style={{ fontSize: 10, color: 'var(--lo-text-dim)' }}>12 h</span>
          </div>
        </div>

        {/* Waga */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Waga (pomiar poranny)</div>
            <SaveButton onClick={saveWeight} pending={pendingWeight} saved={saved === 'weight'} />
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

      </div>
    </div>
  );
}
