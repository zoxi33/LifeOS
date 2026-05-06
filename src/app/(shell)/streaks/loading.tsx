export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ height: 11, width: 60, borderRadius: 4, background: 'var(--lo-surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 22, width: 200, borderRadius: 6, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div className="lo-grid-2col" style={{ marginTop: 4 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 180, borderRadius: 14, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
