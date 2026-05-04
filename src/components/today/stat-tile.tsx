import { Icon } from '@/components/primitives/icon';
import { Sparkline } from '@/components/primitives/sparkline';

interface StatTileProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  delta?: string;
  deltaTone?: 'good' | 'bad' | 'neutral';
  series?: number[];
}

export function StatTile({ icon, label, value, unit, delta, deltaTone, series }: StatTileProps) {
  const deltaColor =
    deltaTone === 'good' ? 'var(--lo-accent)' :
    deltaTone === 'bad'  ? 'var(--lo-danger)' :
    'var(--lo-text-muted)';

  return (
    <div style={{
      background: 'var(--lo-surface)', border: '1px solid var(--lo-border)',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={14} style={{ color: 'var(--lo-text-muted)' }} />
        <div style={{ fontSize: 12, color: 'var(--lo-text-muted)' }}>{label}</div>
        {delta && (
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: deltaColor }}>
            {delta}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono)', fontVariantNumeric: 'tabular-nums',
          fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
        }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--lo-text-faint)' }}>{unit}</div>
      </div>
      {series && <Sparkline data={series} w={200} h={28} fill />}
    </div>
  );
}
