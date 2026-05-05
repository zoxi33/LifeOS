export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ height: 280, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 280, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ height: 320, borderRadius: 12, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
