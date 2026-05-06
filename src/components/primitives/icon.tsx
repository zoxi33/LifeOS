interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 16, className = '', style }: IconProps) {
  const s = { width: size, height: size, ...style };
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style: s,
    'aria-hidden': true,
  };

  switch (name) {
    case 'check':       return <svg {...common}><path d="M4 12.5l4.5 4.5L20 6.5"/></svg>;
    case 'plus':        return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':       return <svg {...common}><path d="M5 12h14"/></svg>;
    case 'x':          return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'flame':       return <svg {...common}><path d="M12 3c2 4 5 5 5 9a5 5 0 11-10 0c0-2 1-3 2-4-1 3 1 4 2 4-1-3 0-6 1-9z"/></svg>;
    case 'home':        return <svg {...common}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"/></svg>;
    case 'list':        return <svg {...common}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>;
    case 'book':        return <svg {...common}><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/></svg>;
    case 'chart':       return <svg {...common}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7"/></svg>;
    case 'goal':        return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>;
    case 'wallet':      return <svg {...common}><path d="M3 7a2 2 0 012-2h12v4h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M16 13h2"/></svg>;
    case 'moon':        return <svg {...common}><path d="M20 14.5A8 8 0 0110 4.5a8 8 0 1010 10z"/></svg>;
    case 'weight':      return <svg {...common}><path d="M5 7h14l-2 13H7z"/><path d="M9 7a3 3 0 016 0"/></svg>;
    case 'mood':        return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"/></svg>;
    case 'cmd':         return <svg {...common}><path d="M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 10 3 3z"/></svg>;
    case 'search':      return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>;
    case 'arrow-right': return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up':    return <svg {...common}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case 'arrow-down':  return <svg {...common}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case 'chevron-right': return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down':  return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'sparkle':     return <svg {...common}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z"/></svg>;
    case 'shield':      return <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>;
    case 'edit':        return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4"/></svg>;
    case 'dot':         return <svg {...common}><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>;
    case 'reset':       return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>;
    case 'settings':    return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.4.9a7 7 0 00-2-1.1L14 3h-4l-.5 2.6a7 7 0 00-2 1.1l-2.4-.9-2 3.5 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.5 2.4-.9a7 7 0 002 1.1L10 21h4l.5-2.6a7 7 0 002-1.1l2.4.9 2-3.5-2-1.5c.06-.4.1-.8.1-1.2z"/></svg>;
    case 'logout':      return <svg {...common}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'grid':        return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'trash':       return <svg {...common}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>;
    case 'droplet':     return <svg {...common}><path d="M12 2C6 9 4 13 4 16a8 8 0 0016 0c0-3-2-7-8-14z"/></svg>;
    case 'trophy':      return <svg {...common}><path d="M6 2h12v10a6 6 0 01-12 0z"/><path d="M6 7H3a2 2 0 000 4h3M18 7h3a2 2 0 010 4h-3M9 22h6M12 18v4"/></svg>;
    default:            return null;
  }
}
