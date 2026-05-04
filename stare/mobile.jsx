/* global React, Icon, HabitRing, Sparkline, Bar, todayHabits */
const { useState } = React;

const MobileToday = () => {
  const [habits, setHabits] = useState(todayHabits);
  const toggle = id => setHabits(hs => hs.map(h => h.id === id ? { ...h, done: !h.done } : h));
  const done = habits.filter(h => h.done).length;
  return (
    <div style={{
      width: 390, height: 740,
      background: 'var(--bg)',
      borderRadius: 38,
      border: '1px solid var(--border-strong)',
      overflow: 'hidden',
      display:'flex', flexDirection:'column',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      boxShadow: '0 0 0 8px var(--bg-2), 0 30px 80px oklch(0 0 0 / 0.5)',
    }}>
      {/* Status bar */}
      <div style={{
        height: 44, padding: '0 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        fontSize: 13, fontWeight: 500,
      }} className="mono">
        <span>22:14</span>
        <span style={{ color:'var(--text-muted)', fontSize: 11 }}>· · ·</span>
      </div>

      <div style={{ overflow:'auto', flex: 1, padding: '4px 18px 100px' }}>
        <div style={{ padding: '4px 0 14px' }}>
          <div className="label-eyebrow">Niedz · 3 maja</div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 2 }}>Dzień dobry</div>
        </div>

        {/* Streak prominent on mobile */}
        <div className="card card-pad" style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6 }}>
            <div className="label-eyebrow">Streak</div>
            <span className="chip chip-accent" style={{ fontSize: 10 }}>aktywny</span>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
            <span className="mono tnum" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>47</span>
            <span style={{ color:'var(--text-muted)', fontSize: 13 }}>dni</span>
            <span className="mono" style={{ marginLeft:'auto', fontSize: 10, color:'var(--text-faint)' }}>rekord 78</span>
          </div>
        </div>

        {/* Day progress */}
        <div className="card card-pad" style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 10 }}>
            <div className="label-eyebrow">Postęp dnia</div>
            <span className="mono tnum" style={{ fontSize: 12 }}>{done}/{habits.length}</span>
          </div>
          <Bar value={done} max={habits.length} h={6}/>
        </div>

        {/* Habits */}
        <div className="label-eyebrow" style={{ padding: '14px 4px 8px' }}>Nawyki dziś</div>
        <div className="card" style={{ overflow:'hidden' }}>
          {habits.map((h, i) => (
            <div key={h.id} style={{
              display:'flex', alignItems:'center', gap: 12,
              padding: '14px 14px',
              borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <button onClick={() => toggle(h.id)}
                style={{
                  width: 26, height: 26, borderRadius: 7,
                  border: '1px solid ' + (h.done ? 'var(--accent-line)' : 'var(--border-strong)'),
                  background: h.done ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--accent)',
                  display:'grid', placeItems:'center',
                  cursor:'pointer', flexShrink: 0,
                }}>
                {h.done && <Icon name="check" size={15}/>}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: h.done ? 'var(--text-muted)' : 'var(--text)',
                  textDecoration: h.done ? 'line-through' : 'none', textDecorationColor: 'var(--text-dim)' }}>{h.name}</div>
                <div className="mono" style={{ fontSize: 10, color:'var(--text-dim)', marginTop: 2 }}>{h.freq}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
                <Icon name="flame" size={11} style={{ color:'var(--accent)' }}/>
                <span className="mono tnum" style={{ fontSize: 12 }}>{h.streak}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick log row */}
        <div className="label-eyebrow" style={{ padding: '18px 4px 8px' }}>Szybki wpis</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 8 }}>
          {[
            { icon: 'mood', label: 'Nastrój', val: '4/5' },
            { icon: 'moon', label: 'Sen', val: '7.5h' },
            { icon: 'weight', label: 'Waga', val: '80.1' },
          ].map(s => (
            <button key={s.label} className="card" style={{
              padding: '12px 10px', textAlign:'left', cursor:'pointer',
              background:'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'inherit',
              display:'flex', flexDirection:'column', gap: 4,
            }}>
              <Icon name={s.icon} size={13} style={{ color:'var(--text-muted)' }}/>
              <div style={{ fontSize: 10, color:'var(--text-faint)' }}>{s.label}</div>
              <div className="mono tnum" style={{ fontSize: 14, fontWeight: 500 }}>{s.val}</div>
            </button>
          ))}
        </div>

        {/* Journal teaser */}
        <button className="card card-pad" style={{
          width:'100%', textAlign:'left', marginTop: 12, padding: 16,
          color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer',
          display:'flex', flexDirection:'column', gap: 6,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div className="label-eyebrow">Dziennik</div>
            <Icon name="arrow-right" size={13} style={{ color:'var(--text-faint)' }}/>
          </div>
          <div style={{ fontSize: 13, fontStyle:'italic', color:'var(--text-faint)', lineHeight: 1.5 }}>
            Co dziś poszło dobrze? Co cię zaskoczyło?
          </div>
        </button>
      </div>

      {/* Tab bar */}
      <div style={{
        position:'absolute', bottom: 0, left: 0, right: 0,
        height: 78, paddingBottom: 22,
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        display:'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {[
          { icon: 'home', label: 'Dziś', active: true },
          { icon: 'list', label: 'Nawyki' },
          { icon: 'book', label: 'Dziennik' },
          { icon: 'chart', label: 'Stat' },
        ].map(t => (
          <div key={t.label} style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 3,
            color: t.active ? 'var(--accent)' : 'var(--text-faint)',
          }}>
            <Icon name={t.icon} size={18}/>
            <span style={{ fontSize: 10 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ——— Command palette ————————————————————————————————————
const CommandPalette = ({ onClose }) => {
  const [q, setQ] = useState('');
  const items = [
    { icon: 'check', label: 'Odhacz nawyk', kbd: ['⌘','D'] },
    { icon: 'book', label: 'Nowy wpis dziennika', kbd: ['⌘','⇧','J'] },
    { icon: 'weight', label: 'Zaloguj wagę', kbd: ['⌘','W'] },
    { icon: 'mood', label: 'Zaloguj nastrój', kbd: ['⌘','M'] },
    { icon: 'wallet', label: 'Dodaj wydatek', kbd: ['⌘','E'] },
    { icon: 'reset', label: 'Zresetuj streak…', kbd: [] },
    { icon: 'goal', label: 'Nowy cel', kbd: [] },
    { icon: 'settings', label: 'Ustawienia', kbd: ['⌘',','] },
  ].filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, background: 'oklch(0 0 0 / 0.5)',
      display:'grid', placeItems:'center', zIndex: 100,
      backdropFilter: 'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, maxWidth: '90vw',
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 30px 80px oklch(0 0 0 / 0.6)',
        overflow: 'hidden',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Icon name="search" size={15} style={{ color:'var(--text-faint)' }}/>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Szukaj akcji…"
            style={{
              flex: 1, background:'transparent', border:'none', outline:'none',
              color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
            }}/>
          <span className="kbd">esc</span>
        </div>
        <div style={{ maxHeight: 360, overflow:'auto', padding: 6 }}>
          {items.map((it, i) => (
            <div key={it.label} style={{
              display:'flex', alignItems:'center', gap: 12,
              padding: '8px 10px',
              borderRadius: 'var(--r-md)',
              background: i === 0 ? 'var(--surface-2)' : 'transparent',
              color: 'var(--text)', fontSize: 13, cursor: 'pointer',
            }}>
              <Icon name={it.icon} size={14} style={{ color:'var(--text-muted)' }}/>
              <span>{it.label}</span>
              <span style={{ marginLeft:'auto', display:'flex', gap: 3 }}>
                {it.kbd.map((k, j) => <span key={j} className="kbd">{k}</span>)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.MobileToday = MobileToday;
window.CommandPalette = CommandPalette;
