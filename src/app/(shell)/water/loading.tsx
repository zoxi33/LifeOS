export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: 80, height: 11, borderRadius: 4, background: 'var(--lo-surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 180, height: 22, borderRadius: 6, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div className="lo-grid-3col">
        {[1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
      </div>
      <div style={{ height: 120, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 160, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
