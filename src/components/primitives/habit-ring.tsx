interface HabitRingProps {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
}

export function HabitRing({ value = 0, total = 1, size = 28, stroke = 3, color }: HabitRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, total));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="var(--lo-border-strong)" strokeWidth={stroke} fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color || 'var(--lo-accent)'} strokeWidth={stroke} fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .35s ease' }}
      />
    </svg>
  );
}
