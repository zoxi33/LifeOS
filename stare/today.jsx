/* global React, Icon, HabitRing, Sparkline, Heatmap, Bar, SectionHeader */
const { useState, useMemo } = React;

// ——— Sample data —————————————————————————————————————————————
const todayHabits = [
  { id: 'workout',  name: 'Trening siłowy',     freq: 'Pn · Śr · Pt',     done: true,  streak: 14, week: [1,0,1,0,1,0,0] },
  { id: 'read',     name: 'Czytanie 30 min',    freq: 'codziennie',       done: true,  streak: 47, week: [1,1,1,1,1,1,0] },
  { id: 'meditate', name: 'Medytacja',          freq: 'codziennie',       done: false, streak: 12, week: [1,1,1,1,1,0,0] },
  { id: 'cold',     name: 'Zimny prysznic',     freq: 'codziennie',       done: false, streak: 6,  week: [1,1,1,1,1,1,0] },
  { id: 'lang',     name: 'Hiszpański (Anki)',  freq: 'codziennie',       done: true,  streak: 89, week: [1,1,1,1,1,1,0] },
  { id: 'walk',     name: 'Spacer 8000 kroków', freq: '5×/tydz',          done: false, streak: 3,  week: [1,1,0,1,1,0,0] },
];

const weightSeries = [82.4, 82.1, 82.0, 81.7, 81.8, 81.4, 81.2, 81.0, 80.9, 80.7, 80.5, 80.6, 80.3, 80.1];
const sleepSeries  = [6.2, 7.1, 6.8, 7.4, 7.0, 6.5, 7.8, 7.5, 7.2, 6.9, 7.6, 7.3, 7.0, 7.5];

// ——— Sidebar ———————————————————————————————————————————
const SidebarItem = ({ it, active, onNav, primary }) => {
  const [hover, setHover] = useState(false);
  const isActive = active === it.id;
  const bg = isActive ? 'var(--surface-2)' : (hover ? 'var(--bg-2)' : 'transparent');
  const color = isActive ? 'var(--text)' : (hover ? 'var(--text)' : 'var(--text-muted)');
  return (
    <button onClick={() => onNav(it.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={primary ? 'row-h' : ''}
      style={{
        display:'flex', alignItems:'center', gap: 10,
        padding: '0 10px', height: primary ? 32 : 30,
        background: bg,
        border: 'none',
        borderRadius: 'var(--r-md)',
        color,
        fontFamily: 'inherit', fontSize: 13, fontWeight: primary ? 450 : 400,
        cursor: 'pointer', textAlign: 'left',
        transition: 'color .12s ease',
        position: 'relative',
      }}>
      <Icon name={it.icon} size={primary ? 15 : 14}/>
      <span>{it.label}</span>
      {it.kbd && <span className="kbd" style={{marginLeft: 'auto', opacity: .7}}>{it.kbd}</span>}
    </button>
  );
};

const Sidebar = ({ active, onNav }) => {
  const items = [
    { id: 'today',   icon: 'home',   label: 'Dziś',     kbd: '1' },
    { id: 'habits',  icon: 'list',   label: 'Nawyki',   kbd: '2' },
    { id: 'journal', icon: 'book',   label: 'Dziennik', kbd: '3' },
    { id: 'stats',   icon: 'chart',  label: 'Statystyki', kbd: '4' },
  ];
  const sub = [
    { id: 'goals',   icon: 'goal',   label: 'Cele' },
    { id: 'finance', icon: 'wallet', label: 'Finanse' },
    { id: 'sleep',   icon: 'moon',   label: 'Sen' },
    { id: 'weight',  icon: 'weight', label: 'Waga' },
  ];
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      background: 'var(--bg)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 10, padding: '4px 8px 18px' }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
          display:'grid', placeItems:'center', color: 'var(--accent)'
        }}>
          <div className="mono" style={{fontSize: 11, fontWeight: 600, letterSpacing: '-.02em'}}>L</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>LifeOS</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }} className="mono">v0.4</div>
      </div>

      {items.map(it => (
        <SidebarItem key={it.id} it={it} active={active} onNav={onNav} primary/>
      ))}

      <div className="label-eyebrow" style={{padding: '20px 10px 8px'}}>Moduły</div>
      {sub.map(it => (
        <SidebarItem key={it.id} it={it} active={active} onNav={onNav}/>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px 8px 4px', borderTop: '1px solid var(--border)', display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 999,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display:'grid', placeItems:'center',
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
        }}>M</div>
        <div style={{ display:'flex', flexDirection:'column', gap: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 12 }}>Michał</div>
          <div className="mono" style={{ fontSize: 10, color:'var(--text-dim)' }}>Level 12 · 4,820 XP</div>
        </div>
      </div>
    </aside>
  );
};

// ——— Top bar ——————————————————————————————————————————————
const TopBar = ({ onCmd }) => (
  <header style={{
    display:'flex', alignItems:'center', gap: 12,
    padding: '14px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
  }}>
    <div>
      <div className="label-eyebrow">Niedziela · 3 maja 2026</div>
      <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 2 }}>Dzień dobry, Michał</div>
    </div>

    <button onClick={onCmd} className="btn" style={{
      marginLeft: 'auto',
      width: 280, justifyContent: 'flex-start',
      color: 'var(--text-faint)',
    }}>
      <Icon name="search" size={14}/>
      <span style={{ fontSize: 12 }}>Szukaj, uruchom akcję…</span>
      <span style={{ marginLeft: 'auto', display:'flex', gap: 4 }}>
        <span className="kbd">⌘</span>
        <span className="kbd">K</span>
      </span>
    </button>

    <button className="btn btn-icon" aria-label="Ustawienia"><Icon name="settings" size={15}/></button>
  </header>
);

// ——— Streak card ————————————————————————————————————————
const StreakCard = ({ days, label, since, prominence = 'medium', onReset }) => {
  const big = prominence === 'high';
  return (
    <div className="card card-pad" style={{
      display:'flex', flexDirection:'column', gap: 10,
      gridColumn: big ? '1 / -1' : 'auto',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div className="label-eyebrow">{label}</div>
        <span className="chip chip-accent">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }}/>
          aktywny
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 10 }}>
        <div className="mono tnum" style={{
          fontSize: big ? 64 : 44, fontWeight: 500,
          letterSpacing: '-0.04em', lineHeight: 1,
        }}>{days}</div>
        <div style={{ color:'var(--text-muted)', fontSize: 13 }}>dni</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap: 6, color:'var(--text-faint)', fontSize: 11 }} className="mono">
          <Icon name="arrow-up" size={11}/> rekord 78
        </div>
      </div>
      <div style={{ fontSize: 12, color:'var(--text-faint)' }}>od {since}</div>
      <div style={{ display:'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-ghost" style={{ height: 28, fontSize: 12 }} onClick={onReset}>
          <Icon name="reset" size={12}/> Zresetuj
        </button>
        <button className="btn btn-ghost" style={{ height: 28, fontSize: 12, marginLeft:'auto' }}>
          Notatka
        </button>
      </div>
    </div>
  );
};

// ——— Habit row ——————————————————————————————————————————
const HabitRow = ({ h, onToggle }) => {
  const dayLabels = ['P','W','Ś','C','P','S','N'];
  return (
    <div className="row-h" style={{
      display:'grid',
      gridTemplateColumns: '28px 1fr auto auto',
      alignItems:'center', gap: 14,
      padding: '12px 4px',
      borderBottom: '1px solid var(--border)',
    }}>
      <button onClick={() => onToggle(h.id)}
        aria-label={h.done ? 'Odznacz' : 'Odhacz'}
        style={{
          width: 22, height: 22, borderRadius: 6,
          border: '1px solid ' + (h.done ? 'var(--accent-line)' : 'var(--border-strong)'),
          background: h.done ? 'var(--accent-soft)' : 'transparent',
          color: 'var(--accent)',
          display:'grid', placeItems:'center',
          cursor:'pointer', transition: 'all .15s ease',
        }}>
        {h.done && <Icon name="check" size={13}/>}
      </button>

      <div style={{ display:'flex', flexDirection:'column', minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 450,
          color: h.done ? 'var(--text-muted)' : 'var(--text)',
          textDecoration: h.done ? 'line-through' : 'none',
          textDecorationColor: 'var(--text-dim)',
        }}>{h.name}</div>
        <div className="mono" style={{ fontSize: 11, color:'var(--text-dim)', marginTop: 2 }}>{h.freq}</div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
        {h.week.map((v, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: v ? 'var(--accent)' : 'var(--border)',
            opacity: v ? (i === 6 ? 0.4 : 0.85) : 1,
          }} title={dayLabels[i]}/>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap: 6, minWidth: 60, justifyContent:'flex-end' }}>
        <Icon name="flame" size={12} style={{ color: h.streak > 0 ? 'var(--accent)' : 'var(--text-dim)' }}/>
        <span className="mono tnum" style={{
          fontSize: 12,
          color: h.streak > 0 ? 'var(--text)' : 'var(--text-dim)',
        }}>{h.streak}</span>
      </div>
    </div>
  );
};

// ——— Mood quick logger ————————————————————————————————————
const MoodLogger = ({ value, onChange }) => {
  const moods = [1,2,3,4,5];
  return (
    <div style={{ display:'flex', gap: 8 }}>
      {moods.map(m => (
        <button key={m} onClick={() => onChange(m)}
          aria-label={'Nastrój ' + m}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid ' + (value === m ? 'var(--accent-line)' : 'var(--border)'),
            background: value === m ? 'var(--accent-soft)' : 'var(--surface-2)',
            color: value === m ? 'var(--accent)' : 'var(--text-muted)',
            cursor:'pointer',
            display:'grid', placeItems:'center',
            fontFamily: 'var(--font-mono)', fontSize: 13,
            transition: 'all .12s ease',
          }}>
          {m}
        </button>
      ))}
    </div>
  );
};

// ——— Quick log card —————————————————————————————————————
const QuickLog = ({ tweaks }) => {
  const [mood, setMood] = useState(4);
  const [sleep, setSleep] = useState(7.5);
  const [weight, setWeight] = useState(80.1);
  return (
    <div className="card card-pad">
      <SectionHeader eyebrow="Szybki wpis" title="Zaloguj dziś"/>
      <div style={{ display:'flex', flexDirection:'column', gap: 18 }}>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Nastrój</div>
            <div className="mono" style={{ fontSize: 11, color:'var(--text-faint)' }}>{mood}/5</div>
          </div>
          <MoodLogger value={mood} onChange={setMood}/>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Sen wczoraj</div>
            <div className="mono tnum" style={{ fontSize: 12 }}>{sleep.toFixed(1)} h</div>
          </div>
          <input type="range" min="3" max="10" step="0.25" value={sleep}
            onChange={e => setSleep(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }} className="mono">
            <span style={{ fontSize: 10, color:'var(--text-dim)' }}>3h</span>
            <span style={{ fontSize: 10, color:'var(--text-dim)' }}>10h</span>
          </div>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Waga</div>
            <div className="mono tnum" style={{ fontSize: 12, color:'var(--accent)' }}>−0.4 kg ↓</div>
          </div>
          <div style={{ display:'flex', gap: 6, alignItems:'center' }}>
            <button className="btn btn-icon" onClick={() => setWeight(w => +(w-0.1).toFixed(1))}>
              <Icon name="minus" size={13}/>
            </button>
            <div style={{
              flex: 1, textAlign:'center',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', padding: '6px 0',
            }}>
              <span className="mono tnum" style={{ fontSize: 16, fontWeight: 500 }}>{weight.toFixed(1)}</span>
              <span style={{ color:'var(--text-faint)', fontSize: 12, marginLeft: 4 }}>kg</span>
            </div>
            <button className="btn btn-icon" onClick={() => setWeight(w => +(w+0.1).toFixed(1))}>
              <Icon name="plus" size={13}/>
            </button>
          </div>
        </div>

        <button className="btn btn-accent" style={{ height: 36, justifyContent:'center', fontWeight: 500 }}>
          Zapisz wpis
        </button>
      </div>
    </div>
  );
};

// ——— Goals strip ———————————————————————————————————————
const GoalsStrip = () => {
  const goals = [
    { id: 'a', name: '79 kg do końca lipca',     pct: 62, milestone: '80.1 / 79.0 kg', due: '~12 tyg' },
    { id: 'b', name: 'Przeczytać 24 książki',    pct: 41, milestone: '10 / 24',         due: '2026' },
    { id: 'c', name: 'Wpłaty: 50 000 zł',        pct: 78, milestone: '38 900 / 50 000', due: '2026' },
  ];
  return (
    <div className="card card-pad">
      <SectionHeader eyebrow="Cele długoterminowe" title="W toku"
        action={<button className="btn btn-ghost"><Icon name="plus" size={13}/> Nowy cel</button>}
      />
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {goals.map(g => (
          <div key={g.id} style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 450 }}>{g.name}</div>
            <div style={{ display:'flex', justifyContent:'space-between' }} className="mono">
              <span style={{ fontSize: 11, color:'var(--text-muted)' }}>{g.milestone}</span>
              <span style={{ fontSize: 11, color:'var(--text-faint)' }}>{g.due}</span>
            </div>
            <Bar value={g.pct}/>
            <div className="mono tnum" style={{ fontSize: 11, color:'var(--text-faint)' }}>{g.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ——— Stat tile (small) —————————————————————————————————————
const StatTile = ({ icon, label, value, unit, delta, deltaTone, series }) => (
  <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap: 12 }}>
    <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
      <Icon name={icon} size={14} style={{ color:'var(--text-muted)' }}/>
      <div style={{ fontSize: 12, color:'var(--text-muted)' }}>{label}</div>
      {delta && <div className="mono" style={{
        marginLeft:'auto', fontSize: 11,
        color: deltaTone === 'good' ? 'var(--accent)' : deltaTone === 'bad' ? 'var(--danger)' : 'var(--text-muted)'
      }}>{delta}</div>}
    </div>
    <div style={{ display:'flex', alignItems:'baseline', gap: 5 }}>
      <div className="mono tnum" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color:'var(--text-faint)' }}>{unit}</div>
    </div>
    {series && <Sparkline data={series} w={200} h={28} fill/>}
  </div>
);

// ——— Finance mini ————————————————————————————————————————
const FinanceMini = () => {
  const cats = [
    { name: 'Jedzenie',     amount: 980,  pct: 55 },
    { name: 'Transport',    amount: 240,  pct: 14 },
    { name: 'Inwestycje',   amount: 1500, pct: 85 },
    { name: 'Subskrypcje',  amount: 187,  pct: 31 },
  ];
  return (
    <div className="card card-pad">
      <SectionHeader eyebrow="Maj 2026" title="Finanse"
        action={<button className="btn btn-ghost"><Icon name="plus" size={13}/> Wydatek</button>}
      />
      <div style={{ display:'flex', alignItems:'baseline', gap: 8, marginBottom: 14 }}>
        <div className="mono tnum" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>2 907</div>
        <div style={{ fontSize: 12, color:'var(--text-faint)' }}>zł wydane / 5 800 budżet</div>
        <div className="chip" style={{ marginLeft:'auto' }}>50% miesiąca</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        {cats.map(c => (
          <div key={c.name}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>{c.name}</span>
              <span className="mono tnum" style={{ fontSize: 12, color:'var(--text-muted)' }}>{c.amount} zł</span>
            </div>
            <Bar value={c.pct} h={3} color={c.pct > 80 ? 'var(--warn)' : 'var(--accent)'}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ——— XP card ————————————————————————————————————————————
const XPCard = () => (
  <div className="card card-pad" style={{ display:'flex', alignItems:'center', gap: 16 }}>
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      <HabitRing value={68} total={100} size={56} stroke={4}/>
      <div className="mono tnum" style={{
        position:'absolute', inset: 0, display:'grid', placeItems:'center',
        fontSize: 14, fontWeight: 500
      }}>12</div>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap: 4, flex: 1 }}>
      <div className="label-eyebrow">Poziom</div>
      <div style={{ fontSize: 13 }}>4 820 / 7 100 XP</div>
      <div className="mono" style={{ fontSize: 11, color:'var(--text-faint)' }}>+180 dziś · +1 240 ten tydzień</div>
    </div>
  </div>
);

// ——— Main TODAY screen ——————————————————————————————————————
const TodayScreen = ({ tweaks }) => {
  const [habits, setHabits] = useState(todayHabits);
  const toggle = id => setHabits(hs => hs.map(h => h.id === id ? { ...h, done: !h.done, streak: h.done ? h.streak - 1 : h.streak + 1 } : h));
  const done = habits.filter(h => h.done).length;
  const total = habits.length;
  const streakProm = tweaks.streakProminence || 'medium';

  return (
    <div style={{ padding: '20px 24px 40px', display:'flex', flexDirection:'column', gap: 20, maxWidth: 1280, margin: '0 auto', width:'100%' }}>

      {/* Top row — XP + day progress + streak (depending on prominence) */}
      <div style={{ display:'grid', gridTemplateColumns: streakProm === 'high' ? '1fr' : '1.2fr 1fr 1fr', gap: 16 }}>
        {streakProm === 'high' && (
          <StreakCard days={47} label="Streak — czystość" since="17 marca 2026" prominence="high"/>
        )}
        {streakProm !== 'high' && (
          <>
            <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap: 14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div className="label-eyebrow">Postęp dnia</div>
                <span className="chip">tydz. 18</span>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                <div className="mono tnum" style={{ fontSize: 36, fontWeight: 500, letterSpacing:'-0.03em', lineHeight: 1 }}>
                  {done}<span style={{ color:'var(--text-faint)' }}>/{total}</span>
                </div>
                <div style={{ fontSize: 12, color:'var(--text-muted)' }}>nawyków</div>
              </div>
              <Bar value={done} max={total} h={6}/>
              <div style={{ display:'flex', gap: 16, marginTop: 4 }} className="mono">
                <span style={{ fontSize: 11, color:'var(--text-faint)' }}>journal · <span style={{color:'var(--accent)'}}>✓</span></span>
                <span style={{ fontSize: 11, color:'var(--text-faint)' }}>sleep · <span style={{color:'var(--accent)'}}>✓</span></span>
                <span style={{ fontSize: 11, color:'var(--text-faint)' }}>weight · <span style={{color:'var(--text-dim)'}}>·</span></span>
                <span style={{ fontSize: 11, color:'var(--text-faint)' }}>mood · <span style={{color:'var(--text-dim)'}}>·</span></span>
              </div>
            </div>
            <StreakCard days={47} label="Streak — czystość" since="17 marca 2026" prominence={streakProm}/>
            <XPCard/>
          </>
        )}
      </div>

      {/* Main 2-col */}
      <div style={{ display:'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <SectionHeader eyebrow={`${done} z ${total} ukończone`} title="Dzisiejsze nawyki"
            action={
              <div style={{ display:'flex', gap: 6 }}>
                <button className="btn btn-ghost"><Icon name="plus" size={13}/> Dodaj</button>
              </div>
            }/>
          <div style={{ marginTop: -4 }}>
            {habits.map(h => <HabitRow key={h.id} h={h} onToggle={toggle}/>)}
          </div>
        </div>
        <QuickLog tweaks={tweaks}/>
      </div>

      {/* Goals */}
      <GoalsStrip/>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatTile icon="weight" label="Waga" value="80.1" unit="kg"
          delta="−2.3 kg / 30d" deltaTone="good" series={weightSeries}/>
        <StatTile icon="moon" label="Sen (śr. 14d)" value="7.1" unit="h"
          delta="+0.4 h" deltaTone="good" series={sleepSeries}/>
        <StatTile icon="mood" label="Nastrój (śr. 14d)" value="3.8" unit="/5"
          delta="stabilny" deltaTone="neutral" series={[3,4,3,4,4,3,5,4,4,3,4,4,4,4]}/>
      </div>

      {/* Finance + Journal preview */}
      <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FinanceMini/>
        <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap: 12 }}>
          <SectionHeader eyebrow="Dziennik" title="Dzisiaj nie napisałeś jeszcze"
            action={<button className="btn btn-accent" style={{ height: 28, fontSize: 12 }}>Otwórz</button>}/>
          <div style={{
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--r-md)',
            padding: 18,
            color: 'var(--text-faint)',
            fontSize: 13,
            lineHeight: 1.55,
            minHeight: 110,
            fontStyle: 'italic',
          }}>
            Co dziś poszło dobrze? Co cię zaskoczyło? Co możesz zrobić jutro lepiej?
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div className="mono" style={{ fontSize: 11, color:'var(--text-dim)' }}>ostatni wpis · wczoraj, 22:14</div>
            <div style={{ display:'flex', gap: 4 }}>
              <span className="kbd">⌘</span><span className="kbd">⇧</span><span className="kbd">J</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

window.TodayScreen = TodayScreen;
window.Sidebar = Sidebar;
window.TopBar = TopBar;
window.todayHabits = todayHabits;
