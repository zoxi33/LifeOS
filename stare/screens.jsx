/* global React, Icon, Heatmap, Sparkline, Bar, SectionHeader, HabitRing */
const { useState, useMemo } = React;

// ——— HABITS SCREEN ——————————————————————————————————————————
const habitsList = [
  { id: 'workout',  name: 'Trening siłowy',     freq: 'Pn · Śr · Pt · Sb',     type: 'custom',  streak: 14, best: 28, completionRate: 0.86, target: 4, week: 3 },
  { id: 'read',     name: 'Czytanie 30 min',    freq: 'codziennie',            type: 'daily',   streak: 47, best: 89, completionRate: 0.94, target: 7, week: 6 },
  { id: 'meditate', name: 'Medytacja 10 min',   freq: 'codziennie',            type: 'daily',   streak: 12, best: 34, completionRate: 0.71, target: 7, week: 5 },
  { id: 'cold',     name: 'Zimny prysznic',     freq: 'codziennie',            type: 'daily',   streak: 6,  best: 21, completionRate: 0.62, target: 7, week: 6 },
  { id: 'lang',     name: 'Hiszpański (Anki)',  freq: 'codziennie',            type: 'daily',   streak: 89, best: 89, completionRate: 0.98, target: 7, week: 7 },
  { id: 'walk',     name: 'Spacer 8000 kroków', freq: '5×/tydzień',            type: 'weekly',  streak: 3,  best: 12, completionRate: 0.75, target: 5, week: 4 },
  { id: 'creatine', name: 'Kreatyna',           freq: 'codziennie',            type: 'daily',   streak: 132, best: 132, completionRate: 0.99, target: 7, week: 7 },
  { id: 'noscroll', name: 'Bez social mediów',  freq: 'Pn—Pt',                 type: 'custom',  streak: 9,  best: 21, completionRate: 0.81, target: 5, week: 4 },
];

const HabitDetail = ({ h }) => {
  // pseudo-random but stable
  const seed = h.id.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  const getValue = (date, idx) => {
    const x = Math.sin(seed * 9.7 + idx * 1.3) * 0.5 + 0.5;
    if (h.type === 'weekly') return idx % 7 < h.target && x > 0.4 ? Math.min(2, Math.floor(x * 2.5)) : 0;
    return x > (1 - h.completionRate) ? Math.min(2, Math.floor(x * 2.5)) : 0;
  };
  return (
    <div style={{
      padding: '14px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-2)',
      display:'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems:'center',
    }}>
      <div>
        <div className="label-eyebrow" style={{marginBottom:6}}>ostatnie 84 dni</div>
        <Heatmap days={84} getValue={getValue} cell={9} gap={2}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 8, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize: 12, color:'var(--text-muted)' }}>Ten tydzień</span>
          <span className="mono tnum" style={{ fontSize: 12 }}>{h.week} / {h.target}</span>
        </div>
        <Bar value={h.week} max={h.target}/>
        <div style={{ display:'flex', gap: 18, marginTop: 6 }} className="mono tnum">
          <div><div style={{ fontSize: 11, color:'var(--text-faint)' }}>średnia</div><div>{Math.round(h.completionRate*100)}%</div></div>
          <div><div style={{ fontSize: 11, color:'var(--text-faint)' }}>rekord</div><div>{h.best}</div></div>
          <div><div style={{ fontSize: 11, color:'var(--text-faint)' }}>start</div><div>02.2026</div></div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
        <button className="btn btn-ghost" style={{ height: 28, fontSize: 12 }}><Icon name="edit" size={12}/> Edytuj</button>
        <button className="btn btn-ghost" style={{ height: 28, fontSize: 12 }}>Statystyki</button>
      </div>
    </div>
  );
};

const HabitListRow = ({ h, isOpen, onToggle }) => {
  const [hover, setHover] = useState(false);
  const bg = isOpen ? 'var(--surface-2)' : (hover ? 'var(--bg-2)' : 'transparent');
  return (
    <div>
      <button onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width:'100%', textAlign:'left',
          display:'grid', gridTemplateColumns: '1fr 220px 80px 100px 24px',
          alignItems:'center',
          padding: '14px 18px',
          background: bg,
          border: 'none',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text)',
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'background .12s ease',
        }}>
        <div>
          <div style={{ fontSize: 13.5 }}>{h.name}</div>
          <div className="mono" style={{ fontSize: 11, color:'var(--text-faint)', marginTop: 2 }}>{h.freq}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ flex: 1 }}><Bar value={h.week} max={h.target} h={4}/></div>
          <span className="mono tnum" style={{ fontSize: 11, color:'var(--text-muted)', minWidth: 30 }}>{h.week}/{h.target}</span>
        </div>
        <div className="mono tnum" style={{ textAlign:'right', fontSize: 12, color: h.completionRate > 0.85 ? 'var(--accent)' : 'var(--text-muted)' }}>{Math.round(h.completionRate*100)}%</div>
        <div style={{ textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 6 }}>
          <Icon name="flame" size={11} style={{ color:'var(--accent)' }}/>
          <span className="mono tnum" style={{ fontSize: 12 }}>{h.streak}</span>
        </div>
        <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} style={{ color: 'var(--text-faint)' }}/>
      </button>
      {isOpen && <HabitDetail h={h}/>}
    </div>
  );
};

const HabitsScreen = () => {
  const [open, setOpen] = useState('read');
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? habitsList : habitsList.filter(h => h.type === filter);
  return (
    <div style={{ padding: '20px 24px 40px', display:'flex', flexDirection:'column', gap: 16, maxWidth: 1280, margin: '0 auto', width:'100%' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 4 }}>
        <div>
          <div className="label-eyebrow">Nawyki</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>8 aktywnych</div>
        </div>
        <div style={{ display:'flex', gap: 6 }}>
          {[['all','Wszystkie'],['daily','Codzienne'],['weekly','Tygodniowe'],['custom','Niestandardowe']].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} className="btn"
              style={{
                background: filter === k ? 'var(--surface-2)' : 'transparent',
                borderColor: filter === k ? 'var(--border-strong)' : 'transparent',
                color: filter === k ? 'var(--text)' : 'var(--text-muted)',
              }}>{l}</button>
          ))}
          <button className="btn btn-accent"><Icon name="plus" size={13}/> Nowy nawyk</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display:'grid',
          gridTemplateColumns: '1fr 220px 80px 100px 24px',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-2)',
        }} className="label-eyebrow">
          <div>Nawyk</div>
          <div>Tydzień</div>
          <div style={{textAlign:'right'}}>%</div>
          <div style={{textAlign:'right'}}>Streak</div>
          <div></div>
        </div>
        {filtered.map(h => (
          <HabitListRow key={h.id} h={h} isOpen={open === h.id}
            onToggle={() => setOpen(open === h.id ? null : h.id)}/>
        ))}
      </div>
    </div>
  );
};

// ——— JOURNAL ————————————————————————————————————————————
const journalEntries = [
  { date: '2026-05-02', mood: 4, sleep: 7.5, weight: 80.1, title: 'Dobry trening, mglista głowa wieczorem', body: 'Rano świetnie — przysiad 120kg na 5. Wieczorem spadek energii, prawdopodobnie późny obiad. Jutro spróbuję jeść główny posiłek wcześniej. Czytanie szło wolno, ale 35 stron i tak.', tags: ['trening','energia'] },
  { date: '2026-05-01', mood: 5, sleep: 8.2, weight: 80.5, title: 'Pierwszy maja — reset', body: 'Długi spacer, zero ekranu do południa. Czuję spokój którego brakowało w kwietniu. Plan na ten miesiąc: skupienie na śnie 7.5h+, 4 treningi/tydz, finanse pod kontrolą.', tags: ['plan','spokój'] },
  { date: '2026-04-30', mood: 3, sleep: 6.8, weight: 80.4, title: 'Krótka noc, długi dzień', body: 'Pracowałem do późna nad projektem. Spadek koncentracji popołudniu. Decyzja: o 22:30 telefon w drugim pokoju, koniec dyskusji.', tags: ['sen'] },
  { date: '2026-04-29', mood: 4, sleep: 7.2, weight: 80.7, title: 'Stabilny rytm', body: 'Wszystkie nawyki ✓. Hiszpański przekroczył 87 dni. Czuję jak rutyna zaczyna grać sama.', tags: ['streak'] },
];

const moodDot = (m) => {
  const colors = { 1: 'var(--danger)', 2: 'var(--warn)', 3: 'var(--text-faint)', 4: 'var(--accent)', 5: 'var(--accent)' };
  return colors[m] || 'var(--text-faint)';
};

const JournalScreen = () => {
  const [selected, setSelected] = useState(0);
  const e = journalEntries[selected];
  return (
    <div style={{ padding: '20px 24px 40px', display:'grid', gridTemplateColumns: '320px 1fr', gap: 16, maxWidth: 1280, margin: '0 auto', width:'100%' }}>
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div className="label-eyebrow">Dziennik</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>148 wpisów</div>
          </div>
          <button className="btn btn-accent"><Icon name="plus" size={13}/></button>
        </div>

        <div className="card" style={{ overflow:'hidden' }}>
          {journalEntries.map((j, i) => (
            <button key={i} onClick={() => setSelected(i)}
              style={{
                width:'100%', textAlign:'left',
                padding: '14px 16px',
                background: selected === i ? 'var(--surface-2)' : 'transparent',
                border:'none',
                borderBottom: i < journalEntries.length - 1 ? '1px solid var(--border)' : 'none',
                color:'var(--text)', fontFamily:'inherit', cursor:'pointer',
                display:'flex', flexDirection:'column', gap: 6,
                borderLeft: '2px solid ' + (selected === i ? 'var(--accent)' : 'transparent'),
              }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="mono" style={{ fontSize: 11, color:'var(--text-faint)' }}>{j.date}</span>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: moodDot(j.mood) }}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 450, lineHeight: 1.4 }}>{j.title}</div>
              <div style={{ fontSize: 11, color:'var(--text-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.body}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap: 18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color:'var(--text-faint)' }}>{e.date} · niedziela · 22:14</div>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.25 }}>{e.title}</div>
          </div>
          <button className="btn btn-ghost"><Icon name="edit" size={13}/> Edytuj</button>
        </div>

        <div style={{ display:'flex', gap: 24, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Nastrój</div>
            <div className="mono tnum" style={{ fontSize: 16 }}>{e.mood}/5</div>
          </div>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Sen</div>
            <div className="mono tnum" style={{ fontSize: 16 }}>{e.sleep} h</div>
          </div>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Waga</div>
            <div className="mono tnum" style={{ fontSize: 16 }}>{e.weight} kg</div>
          </div>
          <div style={{ marginLeft: 'auto', display:'flex', gap: 6, alignItems:'flex-end' }}>
            {e.tags.map(t => <span key={t} className="chip">#{t}</span>)}
          </div>
        </div>

        <div style={{ fontSize: 14.5, lineHeight: 1.7, color:'var(--text)', maxWidth: '60ch', textWrap: 'pretty' }}>
          {e.body}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="mono" style={{ fontSize: 11, color:'var(--text-dim)' }}>{e.body.split(' ').length} słów · 1 min czytania</div>
          <div style={{ display:'flex', gap: 4 }}>
            <span className="kbd">⌘</span><span className="kbd">⇧</span><span className="kbd">J</span>
            <span style={{ fontSize: 11, color:'var(--text-faint)', marginLeft: 6, alignSelf: 'center' }}>nowy wpis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ——— STATS ——————————————————————————————————————————————
const StatsScreen = () => {
  const seed = (s) => Array.from({length: 90}, (_, i) => Math.sin(s + i * 0.4) * 0.5 + 0.5 + Math.sin(s * 2 + i * 0.07) * 0.2);

  return (
    <div style={{ padding: '20px 24px 40px', display:'flex', flexDirection:'column', gap: 16, maxWidth: 1280, margin: '0 auto', width:'100%' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <div className="label-eyebrow">Statystyki</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>Twoje wzorce</div>
        </div>
        <div style={{ display:'flex', gap: 6 }}>
          {['7d','30d','90d','rok','wszystko'].map((p,i) => (
            <button key={p} className="btn"
              style={{
                background: i === 2 ? 'var(--surface-2)' : 'transparent',
                borderColor: i === 2 ? 'var(--border-strong)' : 'transparent',
                color: i === 2 ? 'var(--text)' : 'var(--text-muted)',
              }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Big number row */}
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Konsekwencja', value: '87', unit: '%', sub: '14d średnia', good: true },
          { label: 'Najdłuższy streak', value: '132', unit: 'dni', sub: 'kreatyna' },
          { label: 'Wpisów dziennika', value: '148', unit: '', sub: '4 ten tydzień' },
          { label: 'XP zdobyte', value: '4 820', unit: '', sub: '+23% mc/mc', good: true },
        ].map(s => (
          <div key={s.label} className="card card-pad" style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            <div className="label-eyebrow">{s.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap: 5 }}>
              <div className="mono tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', color: s.good ? 'var(--accent)' : 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color:'var(--text-faint)' }}>{s.unit}</div>
            </div>
            <div className="mono" style={{ fontSize: 11, color:'var(--text-faint)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Big chart card */}
      <div className="card card-pad">
        <SectionHeader eyebrow="Konsekwencja nawyków · 90 dni" title="Pełna mapa"
          action={
            <div style={{ display:'flex', gap: 12, alignItems:'center', fontSize: 11 }} className="mono">
              <span style={{ display:'flex', alignItems:'center', gap: 5, color:'var(--text-faint)' }}>
                <span style={{ width: 8, height: 8, background:'var(--border)', borderRadius: 2 }}/> brak
              </span>
              <span style={{ display:'flex', alignItems:'center', gap: 5, color:'var(--text-faint)' }}>
                <span style={{ width: 8, height: 8, background:'var(--accent)', opacity: 0.4, borderRadius: 2 }}/> niski
              </span>
              <span style={{ display:'flex', alignItems:'center', gap: 5, color:'var(--text-faint)' }}>
                <span style={{ width: 8, height: 8, background:'var(--accent)', borderRadius: 2 }}/> pełny
              </span>
            </div>
          }/>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {habitsList.slice(0,6).map((h, idx) => (
            <div key={h.id} style={{ display:'grid', gridTemplateColumns: '180px 1fr 60px', alignItems:'center', gap: 16 }}>
              <div style={{ fontSize: 12, color:'var(--text-muted)' }}>{h.name}</div>
              <Heatmap days={90} cell={9} gap={2}
                getValue={(d, i) => {
                  const x = Math.sin(idx * 7.3 + i * 1.1) * 0.5 + 0.5;
                  return x > (1 - h.completionRate) ? Math.min(2, Math.floor(x * 2.4)) : 0;
                }}/>
              <div className="mono tnum" style={{ fontSize: 11, color:'var(--text-faint)', textAlign:'right' }}>{Math.round(h.completionRate*100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <SectionHeader eyebrow="Sen vs Nastrój · 60 dni" title="Korelacja"/>
          <div style={{
            position: 'relative', height: 180,
            background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
          }}>
            {Array.from({length: 60}).map((_, i) => {
              const sleep = 4 + Math.sin(i * 0.4) * 2 + Math.random() * 2;
              const mood = sleep / 9 * 4 + Math.random() * 1.2;
              return <div key={i} style={{
                position:'absolute',
                left: 8 + ((sleep - 3) / 7) * 92 + '%',
                bottom: 8 + (mood / 5) * 90 + '%',
                width: 6, height: 6, borderRadius: 999,
                background: 'var(--accent)', opacity: 0.55,
                transform: 'translate(-50%, 50%)',
              }}/>;
            })}
            <div className="mono" style={{ position:'absolute', left: 10, bottom: 6, fontSize: 10, color:'var(--text-dim)' }}>3h sen →</div>
            <div className="mono" style={{ position:'absolute', right: 10, bottom: 6, fontSize: 10, color:'var(--text-dim)' }}>10h</div>
            <div className="mono" style={{ position:'absolute', left: 10, top: 8, fontSize: 10, color:'var(--text-dim)' }}>↑ nastrój 5</div>
          </div>
          <div className="mono" style={{ marginTop: 12, fontSize: 12, color:'var(--text-muted)' }}>
            r = <span style={{ color: 'var(--accent)' }}>+0.62</span> · silna korelacja dodatnia
          </div>
        </div>

        <div className="card card-pad">
          <SectionHeader eyebrow="Waga · 90 dni" title="Trend"/>
          <div style={{ height: 140, position: 'relative' }}>
            <Sparkline w={500} h={140} fill data={Array.from({length: 90}, (_, i) => 82.4 - i * 0.025 + Math.sin(i * 0.5) * 0.3)}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 12 }} className="mono tnum">
            <div>
              <div style={{ fontSize: 10, color:'var(--text-faint)' }}>start</div>
              <div style={{ fontSize: 13 }}>82.4 kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color:'var(--text-faint)' }}>obecnie</div>
              <div style={{ fontSize: 13, color:'var(--accent)' }}>80.1 kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color:'var(--text-faint)' }}>cel</div>
              <div style={{ fontSize: 13 }}>79.0 kg</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color:'var(--text-faint)' }}>tempo</div>
              <div style={{ fontSize: 13 }}>−0.18 kg/tydz</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.HabitsScreen = HabitsScreen;
window.JournalScreen = JournalScreen;
window.StatsScreen = StatsScreen;
