/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ——— Icons (line, 1.5 stroke, no flourish) —————————————————————
const Icon = ({ name, size = 16, className = '', style }) => {
  const s = { width: size, height: size, ...style };
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className, style: s, 'aria-hidden': true,
  };
  switch (name) {
    case 'check': return <svg {...common}><path d="M4 12.5l4.5 4.5L20 6.5"/></svg>;
    case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg {...common}><path d="M5 12h14"/></svg>;
    case 'x': return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'flame': return <svg {...common}><path d="M12 3c2 4 5 5 5 9a5 5 0 11-10 0c0-2 1-3 2-4-1 3 1 4 2 4-1-3 0-6 1-9z"/></svg>;
    case 'home': return <svg {...common}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"/></svg>;
    case 'list': return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>;
    case 'book': return <svg {...common}><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/></svg>;
    case 'chart': return <svg {...common}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7"/></svg>;
    case 'goal': return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>;
    case 'wallet': return <svg {...common}><path d="M3 7a2 2 0 012-2h12v4h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M16 13h2"/></svg>;
    case 'moon': return <svg {...common}><path d="M20 14.5A8 8 0 0110 4.5a8 8 0 1010 10z"/></svg>;
    case 'weight': return <svg {...common}><path d="M5 7h14l-2 13H7z"/><path d="M9 7a3 3 0 016 0"/></svg>;
    case 'mood': return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"/></svg>;
    case 'cmd': return <svg {...common}><path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10 3 3z"/></svg>;
    case 'search': return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>;
    case 'arrow-right': return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up': return <svg {...common}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case 'arrow-down': return <svg {...common}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case 'chevron-right': return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down': return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'sparkle': return <svg {...common}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z"/></svg>;
    case 'shield': return <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>;
    case 'edit': return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4"/></svg>;
    case 'dot': return <svg {...common}><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
    case 'reset': return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>;
    case 'settings': return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4.9a7 7 0 00-2-1.1L14 3h-4l-.5 2.6a7 7 0 00-2 1.1l-2.4-.9-2 3.5 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.5 2.4-.9a7 7 0 002 1.1L10 21h4l.5-2.6a7 7 0 002-1.1l2.4.9 2-3.5-2-1.5c.06-.4.1-.8.1-1.2z"/></svg>;
    default: return null;
  }
};

// ——— Habit ring ————————————————————————————————————————————
const HabitRing = ({ value = 0, total = 1, size = 28, stroke = 3, color }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, total));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r}
        stroke="var(--border-strong)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r}
        stroke={color || 'var(--accent)'} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset .35s ease' }}
      />
    </svg>
  );
};

// ——— Sparkline —————————————————————————————————————————————
const Sparkline = ({ data, w = 120, h = 28, color = 'var(--accent)', fill = false }) => {
  if (!data?.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${path} L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ——— Heatmap (GitHub-style) ——————————————————————————————————
const Heatmap = ({ days = 84, getValue, cell = 11, gap = 3, color = 'var(--accent)' }) => {
  const cols = Math.ceil(days / 7);
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const v = getValue ? getValue(d, days - 1 - i) : 0;
    cells.push({ d, v });
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
      gridAutoRows: `${cell}px`,
      gridAutoFlow: 'column',
      gap: `${gap}px`,
    }}>
      {cells.map((c, i) => {
        const op = c.v === 0 ? 0.06 : 0.18 + Math.min(0.82, c.v * 0.28);
        const bg = c.v === 0 ? 'var(--border)' : color;
        return (
          <div key={i} title={c.d.toISOString().slice(0,10) + ' · ' + c.v}
            style={{
              background: bg,
              opacity: c.v === 0 ? 1 : 1,
              borderRadius: 2,
              ...(c.v === 0 ? { background: 'var(--border)' } : { background: color, opacity: op }),
            }}/>
        );
      })}
    </div>
  );
};

// ——— Progress bar ——————————————————————————————————————————
const Bar = ({ value, max = 100, color = 'var(--accent)', h = 4 }) => (
  <div style={{ height: h, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, (value/max)*100)}%`, background: color, borderRadius: 999, transition: 'width .35s ease' }}/>
  </div>
);

// ——— Section header ——————————————————————————————————————
const SectionHeader = ({ eyebrow, title, action }) => (
  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 14 }}>
    <div>
      {eyebrow && <div className="label-eyebrow" style={{marginBottom: 6}}>{eyebrow}</div>}
      <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em' }}>{title}</div>
    </div>
    {action}
  </div>
);

// Expose globally
Object.assign(window, {
  Icon, HabitRing, Sparkline, Heatmap, Bar, SectionHeader,
});
