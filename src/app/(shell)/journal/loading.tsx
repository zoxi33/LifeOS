export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
        {/* Sidebar skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 36, borderRadius: 8, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 8 }} />
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 8, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        {/* Detail skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, padding: 24 }}>
          <div style={{ width: 180, height: 11, borderRadius: 4, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '60%', height: 28, borderRadius: 6, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1, borderRadius: 8, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
