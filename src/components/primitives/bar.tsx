interface BarProps {
  value: number;
  max?: number;
  color?: string;
  h?: number;
}

export function Bar({ value, max = 100, color = 'var(--lo-accent)', h = 4 }: BarProps) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div style={{ height: h, background: 'var(--lo-border)', borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: 'width .35s ease',
        }}
      />
    </div>
  );
}
