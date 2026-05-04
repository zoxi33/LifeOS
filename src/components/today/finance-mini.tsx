'use client';

import { useState } from 'react';
import { Bar } from '@/components/primitives/bar';
import { SectionHeader } from '@/components/primitives/section-header';
import { AddTransactionDialog } from '@/components/finance/add-transaction-dialog';
import type { TodayFinance } from '@/app/(shell)/today/actions';

export function FinanceMini({ finance }: { finance: TodayFinance }) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const pctMonth = Math.round((now.getDate() / daysInMonth) * 100);

  return (
    <>
      <AddTransactionDialog open={open} onOpenChange={setOpen} />
      <div style={{
        background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
        borderRadius: 12, padding: '18px 20px',
      }}>
        <SectionHeader
          eyebrow={finance.monthLabel}
          title="Finanse"
          action={
            <button
              onClick={() => setOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 32, padding: '0 12px',
                background: 'transparent', color: 'var(--lo-text-muted)',
                border: '1px solid transparent', borderRadius: 8,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              + Wydatek
            </button>
          }
        />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          <div style={{
            fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
            fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em',
          }}>{finance.totalSpent.toLocaleString('pl')}</div>
          <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>zł wydane</div>
          <span style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center',
            height: 22, padding: '0 8px',
            background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border)',
            borderRadius: 999, fontSize: 11, color: 'var(--lo-text-muted)',
            fontFamily: 'var(--font-geist-mono)',
          }}>{pctMonth}% miesiąca</span>
        </div>

        {finance.categories.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>Brak wydatków w tym miesiącu.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {finance.categories.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12 }}>{c.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                    fontSize: 12, color: 'var(--lo-text-muted)',
                  }}>{c.amount.toLocaleString('pl')} zł</span>
                </div>
                <Bar value={c.pct} h={3} color={c.pct > 80 ? 'var(--lo-warn)' : 'var(--lo-accent)'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
