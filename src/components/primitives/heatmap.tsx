interface HeatmapProps {
  days?: number;
  getValue?: (date: Date, idx: number) => number;
  cell?: number;
  gap?: number;
  color?: string;
}

export function Heatmap({ days = 84, getValue, cell = 11, gap = 3, color = 'var(--lo-accent)' }: HeatmapProps) {
  const cols = Math.ceil(days / 7);
  const today = new Date();
  const cells: { d: Date; v: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const v = getValue ? getValue(d, days - 1 - i) : 0;
    cells.push({ d, v });
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridAutoRows: `${cell}px`,
        gridAutoFlow: 'column',
        gap: `${gap}px`,
      }}
    >
      {cells.map((c, i) => {
        const isEmpty = c.v === 0;
        const op = 0.18 + Math.min(0.82, c.v * 0.28);
        return (
          <div
            key={i}
            title={c.d.toISOString().slice(0, 10) + ' · ' + c.v}
            style={{
              background: isEmpty ? 'var(--lo-border)' : color,
              opacity: isEmpty ? 1 : op,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}
