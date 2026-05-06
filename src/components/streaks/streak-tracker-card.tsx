'use client';

import { useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { resetStreak, deleteStreakTracker } from '@/app/(shell)/streaks/actions';
import type { StreakTracker } from '@/app/(shell)/streaks/actions';

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

function nextMilestone(days: number) {
  return MILESTONES.find(m => m > days) ?? null;
}

function milestoneLabel(days: number): string | null {
  const labels: Record<number, string> = {
    3: '3 dni', 7: '1 tydzień', 14: '2 tygodnie',
    30: '1 miesiąc', 60: '2 miesiące', 90: '3 miesiące',
    180: '6 miesięcy', 365: '1 rok',
  };
  return labels[days] ?? null;
}

export function StreakTrackerCard({ tracker }: { tracker: StreakTracker }) {
  const [days, setDays] = useState(tracker.days);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [resetting, startReset] = useTransition();
  const [deleting, startDelete] = useTransition();

  const next = nextMilestone(days);
  const daysToNext = next ? next - days : null;

  // milestone achieved on this exact day?
  const achieved = MILESTONES.includes(days) ? milestoneLabel(days) : null;

  const handleReset = () => {
    startReset(async () => {
      await resetStreak(tracker.id);
      setDays(0);
      setConfirmReset(false);
    });
  };

  return (
    <div style={{
      background: 'var(--lo-surface)',
      border: '1px solid var(--lo-border)',
      borderRadius: 14,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
    }}>
      {/* Delete button — top right */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 26, height: 26, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: 'var(--lo-text-dim)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; }}
        >
          <Icon name="trash" size={12} />
        </button>
      ) : (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--lo-surface-2)',
          border: '1px solid var(--lo-border)',
          borderRadius: 8, padding: '4px 8px',
        }}>
          <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Usuń?</span>
          <button
            disabled={deleting}
            onClick={() => startDelete(async () => { await deleteStreakTracker(tracker.id); })}
            style={{
              height: 22, padding: '0 8px',
              background: 'color-mix(in oklch, var(--lo-danger) 15%, transparent)',
              color: 'var(--lo-danger)',
              border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
              borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{deleting ? '…' : 'Tak'}</button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{
              height: 22, padding: '0 8px',
              background: 'var(--lo-surface)', color: 'var(--lo-text-muted)',
              border: '1px solid var(--lo-border)', borderRadius: 5,
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Nie</button>
        </div>
      )}

      {/* Name */}
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--lo-text-muted)', letterSpacing: '0.02em' }}>
        {tracker.name}
      </div>

      {/* Big counter */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: days >= 100 ? 52 : days >= 10 ? 60 : 72,
          fontWeight: 600,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: days >= 30 ? 'var(--lo-accent)' : days >= 7 ? 'var(--lo-warn)' : 'var(--lo-text)',
          fontVariantNumeric: 'tabular-nums',
        }}>{days}</span>
        <span style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: 14,
          color: 'var(--lo-text-faint)',
        }}>dni</span>
      </div>

      {/* Milestone banner */}
      {achieved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'var(--lo-accent-soft)',
          border: '1px solid var(--lo-accent-line)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--lo-accent)',
          fontFamily: 'var(--font-geist-mono)',
        }}>
          🏆 Milestone: {achieved}!
        </div>
      )}

      {/* Progress to next milestone */}
      {daysToNext !== null && next !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', fontFamily: 'var(--font-geist-mono)' }}>
              następny cel: {milestoneLabel(next) ?? `${next} dni`}
            </span>
            <span style={{ fontSize: 11, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
              jeszcze {daysToNext} d
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--lo-border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.round((days / next) * 100)}%`,
              background: 'var(--lo-accent)',
              borderRadius: 999,
              transition: 'width .3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Reset button */}
      <div style={{ marginTop: 4 }}>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 12px',
              background: 'transparent',
              color: 'var(--lo-text-dim)',
              border: '1px solid transparent',
              borderRadius: 7, fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .12s',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color = 'var(--lo-danger)';
              b.style.borderColor = 'var(--lo-border)';
              b.style.background = 'var(--lo-surface-2)';
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.color = 'var(--lo-text-dim)';
              b.style.borderColor = 'transparent';
              b.style.background = 'transparent';
            }}
          >
            <Icon name="reset" size={12} /> Reset streaka
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
              Na pewno zresetować?
            </span>
            <button
              disabled={resetting}
              onClick={handleReset}
              style={{
                height: 28, padding: '0 12px',
                background: 'color-mix(in oklch, var(--lo-danger) 12%, transparent)',
                color: 'var(--lo-danger)',
                border: '1px solid color-mix(in oklch, var(--lo-danger) 30%, transparent)',
                borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{resetting ? '…' : 'Tak, reset'}</button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                height: 28, padding: '0 12px',
                background: 'var(--lo-surface-2)', color: 'var(--lo-text-muted)',
                border: '1px solid var(--lo-border)', borderRadius: 6,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Nie</button>
          </div>
        )}
      </div>
    </div>
  );
}
