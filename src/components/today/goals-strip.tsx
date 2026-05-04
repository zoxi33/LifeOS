import { Bar } from '@/components/primitives/bar';
import { SectionHeader } from '@/components/primitives/section-header';
import type { Goal } from '@/types/lifeos';

export function GoalsStrip({ goals = [] }: { goals?: Goal[] }) {
  const active = goals.filter(g => g.pct < 100).slice(0, 3);

  if (!active.length) return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <SectionHeader eyebrow="Cele długoterminowe" title="W toku" />
      <div style={{ fontSize: 13, color: 'var(--lo-text-muted)', marginTop: 4 }}>
        Brak aktywnych celów — dodaj pierwszy w zakładce Cele.
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <SectionHeader eyebrow="Cele długoterminowe" title="W toku" />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${active.length}, 1fr)`, gap: 16 }}>
        {active.map(g => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 450 }}>{g.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-geist-mono)' }}>
              <span style={{ fontSize: 11, color: 'var(--lo-text-muted)' }}>
                {g.current.toLocaleString('pl')} / {g.target.toLocaleString('pl')} {g.unit}
              </span>
              <span style={{ fontSize: 11, color: 'var(--lo-text-faint)' }}>{g.due}</span>
            </div>
            <Bar value={g.pct} />
            <div style={{
              fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
              fontSize: 11, color: 'var(--lo-text-faint)',
            }}>{g.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
