export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 36, borderRadius: 8, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 8 }} />
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 90, borderRadius: 8, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, padding: 24 }}>
          <div style={{ width: 120, height: 11, borderRadius: 4, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 8 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ height: 20, borderRadius: 4, background: 'var(--lo-bg-2)', width: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 8, borderRadius: 4, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 8, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite', marginTop: 8 }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
