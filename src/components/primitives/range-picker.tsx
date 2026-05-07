export type DateRange = 30 | 90 | 180 | null;

export const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: '30 dni',  value: 30 },
  { label: '90 dni',  value: 90 },
  { label: '6 mies.', value: 180 },
  { label: 'Wszystko', value: null },
];

export function RangePicker({ value, onChange, loading = false }: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  loading?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {RANGE_OPTIONS.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          disabled={loading}
          style={{
            height: 28, padding: '0 10px',
            background: value === opt.value ? 'var(--lo-surface-2)' : 'transparent',
            border: '1px solid ' + (value === opt.value ? 'var(--lo-border-strong)' : 'transparent'),
            color: value === opt.value ? 'var(--lo-text)' : 'var(--lo-text-muted)',
            borderRadius: 6, fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading ? 0.5 : 1,
            transition: 'color .1s, background .1s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
