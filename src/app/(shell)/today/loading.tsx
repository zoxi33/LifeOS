export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Top stats row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      {/* Main content skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {[120, 200, 160].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
