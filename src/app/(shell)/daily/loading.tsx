export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Week selector skeleton */}
      <div style={{ height: 44, borderRadius: 10, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      {/* Day cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 10, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      {/* Detail panel skeleton */}
      <div style={{ height: 300, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
