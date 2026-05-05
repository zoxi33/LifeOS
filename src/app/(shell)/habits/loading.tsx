export default function Loading() {
  return (
    <div className="lo-screen" style={{ padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: 60, height: 11, borderRadius: 4, background: 'var(--lo-surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 120, height: 22, borderRadius: 6, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[80, 90, 110, 80, 110].map((w, i) => (
            <div key={i} style={{ width: w, height: 32, borderRadius: 8, background: 'var(--lo-surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
      {/* Table skeleton */}
      <div style={{ background: 'var(--lo-surface)', border: '1px solid var(--lo-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ height: 40, background: 'var(--lo-bg-2)', borderBottom: '1px solid var(--lo-border)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ height: 52, borderBottom: '1px solid var(--lo-border)', padding: '0 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--lo-bg-2)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1, height: 13, borderRadius: 4, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: 40, height: 13, borderRadius: 4, background: 'var(--lo-bg-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }`}</style>
    </div>
  );
}
