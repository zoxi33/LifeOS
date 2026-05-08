'use client';

import { useMemo, useState, useTransition } from 'react';
import { Icon } from '@/components/primitives/icon';
import { Bar } from '@/components/primitives/bar';
import { SectionHeader } from '@/components/primitives/section-header';
import { AddTransactionDialog } from './add-transaction-dialog';
import { deleteTransaction } from '@/app/(shell)/finance/actions';
import type { FinanceData, Transaction } from '@/types/lifeos';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('pl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtInt(n: number) {
  return Math.round(n).toLocaleString('pl');
}

type Filter = 'all' | 'expense' | 'income' | 'invest';

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, accent = false, warn = false }: {
  label: string; value: string; unit?: string; sub?: string;
  accent?: boolean; warn?: boolean;
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
          fontSize: 26, fontWeight: 500, letterSpacing: '-0.025em',
          color: accent ? 'var(--lo-accent)' : warn ? 'var(--lo-warn)' : 'var(--lo-text)',
        }}>{value}</div>
        {unit && <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{unit}</div>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>{sub}</div>}
    </div>
  );
}

function TxRow({ t, onDelete, onEdit }: { t: Transaction; onDelete: (id: string) => void; onEdit: (tx: Transaction) => void }) {
  const [hovered, setHovered] = useState(false);
  const [deleting, startDelete] = useTransition();

  const isIncome = t.type === 'income';
  const isInvest = t.type === 'invest';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '76px 1fr 130px 110px 60px',
        alignItems: 'center', gap: 12,
        padding: '11px 18px',
        background: hovered ? 'var(--lo-bg-2)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--lo-text-faint)' }}>{t.d}</div>
      <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        height: 20, padding: '0 8px', width: 'fit-content',
        background: isIncome ? 'color-mix(in oklch, var(--lo-accent) 12%, transparent)'
          : isInvest ? 'color-mix(in oklch, var(--lo-info) 12%, transparent)'
          : 'var(--lo-surface-2)',
        border: '1px solid ' + (isIncome ? 'var(--lo-accent-line)' : isInvest ? 'color-mix(in oklch, var(--lo-info) 30%, transparent)' : 'var(--lo-border)'),
        borderRadius: 999, fontSize: 11,
        color: isIncome ? 'var(--lo-accent)' : isInvest ? 'var(--lo-info)' : 'var(--lo-text-muted)',
        fontFamily: 'var(--font-geist-mono)',
      }}>
        {t.cat || (isIncome ? 'Przychód' : isInvest ? 'Inwestycja' : 'Inne')}
      </span>
      <div style={{
        textAlign: 'right', fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
        fontSize: 13, fontWeight: 500,
        color: isIncome ? 'var(--lo-accent)' : isInvest ? 'var(--lo-info)' : 'var(--lo-text)',
      }}>
        {isIncome ? '+' : isInvest ? '→' : '−'}{fmt(t.amount)} zł
      </div>
      <div style={{ display: 'flex', gap: 2, opacity: hovered ? 1 : 0, transition: 'opacity 0.1s' }}>
        <button
          onClick={() => onEdit(t)}
          style={{
            display: 'grid', placeItems: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: 'var(--lo-text-dim)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; }}
        >
          <Icon name="edit" size={13} />
        </button>
        <button
          onClick={() => startDelete(() => onDelete(t.id))}
          disabled={deleting}
          style={{
            display: 'grid', placeItems: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: 'transparent', border: 'none',
            color: 'var(--lo-text-dim)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--lo-surface-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-danger)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--lo-text-dim)'; }}
        >
          <Icon name="trash" size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export function FinanceScreen({ data }: { data: FinanceData }) {
  const { currentMonth: cm, monthlySummaries, transactions } = data;
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [txs, setTxs] = useState<Transaction[]>(transactions);

  const handleDelete = async (id: string) => {
    setTxs(prev => prev.filter(t => t.id !== id));
    await deleteTransaction(id);
  };

  const handleUpdated = (updated: Transaction) => {
    setTxs(prev => prev.map(t => t.id === updated.id ? {
      ...updated,
      d: new Date(updated.date).toLocaleDateString('pl', { day: '2-digit', month: 'short' }),
    } : t));
    setEditTx(null);
  };

  // Categories from this month's expenses
  const categories = useMemo(() => {
    const thisMonth = cm.yearMonth;
    const byCat: Record<string, number> = {};
    txs
      .filter(t => t.type === 'expense' && t.date.startsWith(thisMonth))
      .forEach(t => { byCat[t.cat || 'Inne'] = (byCat[t.cat || 'Inne'] ?? 0) + t.amount; });
    const total = Object.values(byCat).reduce((s, v) => s + v, 0);
    return Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount, pct: total ? (amount / total) * 100 : 0 }));
  }, [txs, cm.yearMonth]);

  // Monthly chart max
  const chartMax = useMemo(() =>
    Math.max(...monthlySummaries.flatMap(m => [m.expenses, m.income]), 1),
    [monthlySummaries]
  );

  // Filtered transactions
  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter);

  const net = cm.totalIncome - cm.totalExpenses;
  const filterBtns: { k: Filter; l: string }[] = [
    { k: 'all', l: 'Wszystkie' },
    { k: 'expense', l: 'Wydatki' },
    { k: 'income', l: 'Przychody' },
    { k: 'invest', l: 'Inwestycje' },
  ];

  return (
    <>
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={v => { setAddOpen(v); }}
        onAdded={tx => setTxs(prev => [tx, ...prev])}
      />
      <AddTransactionDialog
        open={!!editTx}
        onOpenChange={v => { if (!v) setEditTx(null); }}
        editTx={editTx}
        onUpdated={handleUpdated}
      />
      <div className="lo-screen" style={{
        padding: '20px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 16,
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow">Finanse · {cm.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              {fmtInt(cm.totalExpenses)} zł wydatki
              {cm.totalIncome > 0 && (
                <span style={{ color: 'var(--lo-text-muted)', fontWeight: 400 }}>
                  {' · '}
                  <span style={{ color: 'var(--lo-accent)' }}>{fmtInt(cm.totalIncome)} zł</span> przychód
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setAddOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 34, padding: '0 14px',
            background: 'var(--lo-accent-soft)', color: 'var(--lo-accent)',
            border: '1px solid var(--lo-accent-line)', borderRadius: 8,
            fontSize: 13, fontFamily: 'inherit',
          }}>
            <Icon name="plus" size={13} /> Nowa transakcja
          </button>
        </div>

        {/* ── Big 4 ── */}
        <div className="lo-grid-4col">
          <StatCard
            label="Wydatki"
            value={fmtInt(cm.totalExpenses)}
            unit="zł"
            sub={`${cm.daysPassed} dni · śr. ${fmtInt(cm.dailyAvg)} zł/dzień`}
          />
          <StatCard
            label="Przychód"
            value={cm.totalIncome > 0 ? fmtInt(cm.totalIncome) : '—'}
            unit={cm.totalIncome > 0 ? 'zł' : ''}
            sub={cm.totalIncome > 0 ? 'ten miesiąc' : 'brak przychodów'}
            accent={cm.totalIncome > 0}
          />
          <StatCard
            label="Netto"
            value={cm.totalIncome > 0 ? (net >= 0 ? '+' : '') + fmtInt(net) : '—'}
            unit={cm.totalIncome > 0 ? 'zł' : ''}
            sub={cm.totalIncome > 0 ? (net >= 0 ? 'nadwyżka' : 'deficyt') : 'dodaj przychód'}
            accent={net > 0}
            warn={net < 0 && cm.totalIncome > 0}
          />
          <StatCard
            label="Inwestycje"
            value={cm.totalInvest > 0 ? fmtInt(cm.totalInvest) : '—'}
            unit={cm.totalInvest > 0 ? 'zł' : ''}
            sub={cm.totalInvest > 0 ? 'ten miesiąc' : 'brak inwestycji'}
          />
        </div>

        {/* ── Kategorie + wykres miesięczny ── */}
        <div className="lo-grid-2col" style={{ gap: 16 }}>

          {/* Kategorie */}
          <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, padding: '18px 20px' }}>
            <SectionHeader eyebrow="Kategorie" title="Ten miesiąc" />
            {categories.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '12px 0' }}>
                Brak wydatków — dodaj pierwszą transakcję.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categories.map(c => (
                  <div key={c.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{c.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                        fontSize: 12, color: 'var(--lo-text-muted)',
                      }}>{fmtInt(c.amount)} zł</span>
                    </div>
                    <Bar value={c.pct} h={4} color="var(--lo-accent)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wykres 6-miesięczny */}
          <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, padding: '18px 20px' }}>
            <SectionHeader eyebrow="Trend · 6 miesięcy" title="Wydatki vs przychód" />
            {monthlySummaries.every(m => m.expenses === 0 && m.income === 0) ? (
              <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', padding: '20px 0' }}>
                Brak danych — dodaj transakcje.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, padding: '8px 0 0' }}>
                  {monthlySummaries.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 110, width: '100%', justifyContent: 'center' }}>
                        {m.expenses > 0 && (
                          <div
                            title={`Wydatki: ${fmtInt(m.expenses)} zł`}
                            style={{
                              width: 12, height: Math.max(2, (m.expenses / chartMax) * 110),
                              background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border-strong)',
                              borderRadius: '3px 3px 0 0',
                            }}
                          />
                        )}
                        {m.income > 0 && (
                          <div
                            title={`Przychód: ${fmtInt(m.income)} zł`}
                            style={{
                              width: 12, height: Math.max(2, (m.income / chartMax) * 110),
                              background: 'var(--lo-accent-soft)', border: '1px solid var(--lo-accent-line)',
                              borderRadius: '3px 3px 0 0',
                            }}
                          />
                        )}
                        {m.expenses === 0 && m.income === 0 && (
                          <div style={{ width: 12, height: 2, background: 'var(--lo-border)', borderRadius: 1 }} />
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--lo-text-faint)' }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: 'var(--font-geist-mono)' }}>
                  <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, background: 'var(--lo-surface-2)', border: '1px solid var(--lo-border-strong)', display: 'inline-block', borderRadius: 2 }} />
                    wydatki
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--lo-text-faint)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, background: 'var(--lo-accent-soft)', border: '1px solid var(--lo-accent-line)', display: 'inline-block', borderRadius: 2 }} />
                    przychód
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Transakcje ── */}
        <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{
            padding: '12px 18px', borderBottom: '1px solid var(--lo-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          }}>
            <div className="label-eyebrow" style={{ flexShrink: 0 }}>
              Transakcje
              {filtered.length > 0 && (
                <span style={{ marginLeft: 8, fontVariantNumeric: 'tabular-nums', color: 'var(--lo-text-dim)' }}>
                  {filtered.length}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {filterBtns.map(b => (
                <button key={b.k} onClick={() => setFilter(b.k)} style={{
                  height: 28, padding: '0 10px',
                  background: filter === b.k ? 'var(--lo-surface-2)' : 'transparent',
                  border: '1px solid ' + (filter === b.k ? 'var(--lo-border-strong)' : 'transparent'),
                  color: filter === b.k ? 'var(--lo-text)' : 'var(--lo-text-muted)',
                  borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
                }}>{b.l}</button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '76px 1fr 130px 110px 60px',
            gap: 12, padding: '8px 18px',
            background: 'var(--lo-bg-2)', borderBottom: '1px solid var(--lo-border)',
          }} className="label-eyebrow">
            <div>Data</div>
            <div>Opis</div>
            <div>Kategoria</div>
            <div style={{ textAlign: 'right' }}>Kwota</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '28px 18px', fontSize: 13, color: 'var(--lo-text-muted)' }}>
              {txs.length === 0
                ? 'Brak transakcji — kliknij „Nowa transakcja" żeby zacząć.'
                : 'Brak transakcji w tej kategorii.'}
            </div>
          ) : (
            <div style={{ borderBottom: '1px solid var(--lo-border)' }}>
              {filtered.map((t, i) => (
                <div key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--lo-border)' : 'none' }}>
                  <TxRow t={t} onDelete={handleDelete} onEdit={setEditTx} />
                </div>
              ))}
            </div>
          )}

          {/* Footer suma */}
          {filtered.length > 0 && (
            <div style={{
              padding: '12px 18px',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8,
              borderTop: '1px solid var(--lo-border)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--lo-text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                Suma:
              </span>
              <span style={{
                fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
                fontSize: 14, fontWeight: 500,
                color: filter === 'income' ? 'var(--lo-accent)'
                  : filter === 'invest' ? 'var(--lo-info)'
                  : 'var(--lo-text)',
              }}>
                {filter === 'income' ? '+' : filter === 'invest' ? '→' : '−'}
                {fmt(filtered.reduce((s, t) => s + t.amount, 0))} zł
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
