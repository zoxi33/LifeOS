/* global React, Icon, Sparkline, Bar, Heatmap, SectionHeader, HabitRing */
const { useState } = React;

// ——— GOALS ——————————————————————————————————————————————
const goalsData = [
  {
    id: 'weight', name: '79 kg do końca lipca', category: 'Zdrowie',
    pct: 62, current: 80.1, target: 79.0, unit: 'kg', start: 82.4,
    due: '31 lip 2026', startDate: '01 sty 2026',
    milestones: [
      { name: '82 → 81 kg', done: true, date: '14 lut' },
      { name: '81 → 80 kg', done: true, date: '08 kwi' },
      { name: '80 → 79 kg', done: false, date: 'lip' },
    ],
    note: 'Tempo −0.18 kg/tydz, projekcja: 12 czerwca',
  },
  {
    id: 'books', name: 'Przeczytać 24 książki', category: 'Rozwój',
    pct: 41, current: 10, target: 24, unit: 'książek',
    due: '31 gru 2026', startDate: '01 sty 2026',
    milestones: [
      { name: '6 książek (Q1)', done: true, date: 'mar' },
      { name: '12 książek (Q2)', done: false, date: 'cze' },
      { name: '18 książek (Q3)', done: false, date: 'wrz' },
      { name: '24 książki (Q4)', done: false, date: 'gru' },
    ],
    note: 'Tempo: 2.5 / mies. — wymagane 2.0',
  },
  {
    id: 'savings', name: 'Wpłaty: 50 000 zł', category: 'Finanse',
    pct: 78, current: 38900, target: 50000, unit: 'zł',
    due: '31 gru 2026', startDate: '01 sty 2026',
    milestones: [
      { name: '12 500 zł', done: true, date: 'mar' },
      { name: '25 000 zł', done: true, date: 'cze' },
      { name: '37 500 zł', done: true, date: 'wrz' },
      { name: '50 000 zł', done: false, date: 'gru' },
    ],
    note: 'Wyprzedzenie planu o 6 800 zł',
  },
];

const GoalsScreen = () => {
  const [sel, setSel] = useState('weight');
  const g = goalsData.find(x => x.id === sel);
  return (
    <div style={{ padding:'20px 24px 40px', display:'grid', gridTemplateColumns:'320px 1fr', gap:16, maxWidth:1280, margin:'0 auto', width:'100%' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div className="label-eyebrow">Cele</div>
            <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginTop:4 }}>{goalsData.length} aktywnych</div>
          </div>
          <button className="btn btn-accent"><Icon name="plus" size={13}/></button>
        </div>
        <div className="card" style={{ overflow:'hidden' }}>
          {goalsData.map((x,i) => (
            <button key={x.id} onClick={() => setSel(x.id)} style={{
              width:'100%', textAlign:'left',
              padding:'14px 16px',
              background: sel === x.id ? 'var(--surface-2)' : 'transparent',
              border:'none',
              borderBottom: i < goalsData.length-1 ? '1px solid var(--border)' : 'none',
              borderLeft:'2px solid ' + (sel === x.id ? 'var(--accent)' : 'transparent'),
              color:'var(--text)', fontFamily:'inherit', cursor:'pointer',
              display:'flex', flexDirection:'column', gap:8,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span className="mono" style={{ fontSize:10, color:'var(--text-faint)', letterSpacing:'.06em', textTransform:'uppercase' }}>{x.category}</span>
                <span className="mono tnum" style={{ fontSize:11, color:'var(--text-muted)' }}>{x.pct}%</span>
              </div>
              <div style={{ fontSize:13, fontWeight:450 }}>{x.name}</div>
              <Bar value={x.pct} h={3}/>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div className="card card-pad" style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <span className="chip">{g.category}</span>
              <div style={{ fontSize:26, fontWeight:500, letterSpacing:'-0.02em', marginTop:10 }}>{g.name}</div>
              <div className="mono" style={{ fontSize:11, color:'var(--text-faint)', marginTop:6 }}>termin · {g.due}</div>
            </div>
            <div style={{ position:'relative', width:88, height:88 }}>
              <HabitRing value={g.pct} total={100} size={88} stroke={5}/>
              <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', flexDirection:'column' }}>
                <div className="mono tnum" style={{ fontSize:22, fontWeight:500 }}>{g.pct}<span style={{ fontSize:11, color:'var(--text-faint)' }}>%</span></div>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, padding:'14px 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div className="label-eyebrow" style={{ marginBottom:4 }}>Obecnie</div>
              <div className="mono tnum" style={{ fontSize:18, color:'var(--accent)' }}>{g.current.toLocaleString('pl')} <span style={{ fontSize:11, color:'var(--text-faint)' }}>{g.unit}</span></div>
            </div>
            <div>
              <div className="label-eyebrow" style={{ marginBottom:4 }}>Cel</div>
              <div className="mono tnum" style={{ fontSize:18 }}>{g.target.toLocaleString('pl')} <span style={{ fontSize:11, color:'var(--text-faint)' }}>{g.unit}</span></div>
            </div>
            <div>
              <div className="label-eyebrow" style={{ marginBottom:4 }}>Notatka</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{g.note}</div>
            </div>
          </div>

          <div>
            <div className="label-eyebrow" style={{ marginBottom:14 }}>Kamienie milowe</div>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {g.milestones.map((m,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom: i < g.milestones.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{
                    width:22, height:22, borderRadius:6, flexShrink:0,
                    border:'1px solid ' + (m.done ? 'var(--accent-line)' : 'var(--border-strong)'),
                    background: m.done ? 'var(--accent-soft)' : 'transparent',
                    color:'var(--accent)',
                    display:'grid', placeItems:'center',
                  }}>
                    {m.done && <Icon name="check" size={12}/>}
                  </div>
                  <div style={{ flex:1, fontSize:13, color: m.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none', textDecorationColor:'var(--text-dim)' }}>{m.name}</div>
                  <div className="mono" style={{ fontSize:11, color:'var(--text-faint)' }}>{m.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ——— FINANCE ———————————————————————————————————————————
const txData = [
  { d:'02 maja', cat:'Jedzenie',     name:'Lidl',                amount:-184.20, type:'expense' },
  { d:'02 maja', cat:'Inwestycje',   name:'IKE — wpłata',         amount:-1500,   type:'invest' },
  { d:'01 maja', cat:'Jedzenie',     name:'Restauracja Kuchnia', amount:-87.00,  type:'expense' },
  { d:'30 kwi', cat:'Subskrypcje',  name:'Spotify',              amount:-23.99,  type:'expense' },
  { d:'30 kwi', cat:'Transport',    name:'BP Paliwo',            amount:-240.50, type:'expense' },
  { d:'29 kwi', cat:'Przychód',     name:'Faktura · Klient X',   amount:+8400,   type:'income' },
  { d:'28 kwi', cat:'Subskrypcje',  name:'Notion',               amount:-48.00,  type:'expense' },
  { d:'27 kwi', cat:'Jedzenie',     name:'Biedronka',            amount:-126.40, type:'expense' },
];
const cats = [
  { name:'Jedzenie', amount:980, budget:1800, color:'var(--accent)' },
  { name:'Transport', amount:240, budget:600, color:'var(--accent)' },
  { name:'Inwestycje', amount:1500, budget:1500, color:'var(--info)' },
  { name:'Subskrypcje', amount:187, budget:600, color:'var(--accent)' },
  { name:'Inne', amount:0, budget:1300, color:'var(--accent)' },
];

const FinanceScreen = () => (
  <div style={{ padding:'20px 24px 40px', display:'flex', flexDirection:'column', gap:16, maxWidth:1280, margin:'0 auto', width:'100%' }}>
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
      <div>
        <div className="label-eyebrow">Finanse · Maj 2026</div>
        <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginTop:4 }}>2 907 zł / 5 800 budżet</div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn"><Icon name="arrow-up" size={12}/> Przychód</button>
        <button className="btn btn-accent"><Icon name="plus" size={13}/> Wydatek</button>
      </div>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
      {[
        { l:'Pozostało', v:'2 893', u:'zł', sub:'do końca miesiąca', good:true },
        { l:'Średnia dzienna', v:'92', u:'zł', sub:'cel 187 zł/dzień' },
        { l:'Oszczędności', v:'38 900', u:'zł', sub:'+1 500 zł ten mies.', good:true },
        { l:'Saldo', v:'62 410', u:'zł', sub:'wszystkie konta' },
      ].map(s => (
        <div key={s.l} className="card card-pad" style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div className="label-eyebrow">{s.l}</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
            <div className="mono tnum" style={{ fontSize:28, fontWeight:500, letterSpacing:'-0.025em', color: s.good ? 'var(--accent)' : 'var(--text)' }}>{s.v}</div>
            <div style={{ fontSize:12, color:'var(--text-faint)' }}>{s.u}</div>
          </div>
          <div className="mono" style={{ fontSize:11, color:'var(--text-faint)' }}>{s.sub}</div>
        </div>
      ))}
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:16 }}>
      <div className="card card-pad">
        <SectionHeader eyebrow="Kategorie" title="Budżet"/>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {cats.map(c => {
            const pct = (c.amount/c.budget)*100;
            return (
              <div key={c.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13 }}>{c.name}</span>
                  <span className="mono tnum" style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {c.amount.toLocaleString('pl')} <span style={{ color:'var(--text-faint)' }}>/ {c.budget.toLocaleString('pl')} zł</span>
                  </span>
                </div>
                <Bar value={pct} h={4} color={pct >= 100 ? 'var(--warn)' : c.color}/>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card card-pad">
        <SectionHeader eyebrow="Trend · 6 mc" title="Wydatki vs przychód"/>
        <div style={{ display:'flex', alignItems:'flex-end', gap:14, height:160, padding:'12px 0' }}>
          {[
            { m:'Gru', e:3200, i:7200 },{ m:'Sty', e:2800, i:8400 },{ m:'Lut', e:3100, i:7200 },
            { m:'Mar', e:2900, i:8400 },{ m:'Kwi', e:3400, i:7200 },{ m:'Maj', e:2907, i:8400 },
          ].map((b,i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:120, width:'100%', justifyContent:'center' }}>
                <div style={{ width:14, height: (b.e/9000)*120, background:'var(--surface-2)', border:'1px solid var(--border-strong)', borderRadius:'3px 3px 0 0' }}/>
                <div style={{ width:14, height: (b.i/9000)*120, background:'var(--accent-soft)', border:'1px solid var(--accent-line)', borderRadius:'3px 3px 0 0' }}/>
              </div>
              <div className="mono" style={{ fontSize:10, color:'var(--text-faint)' }}>{b.m}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:14, marginTop:6 }} className="mono">
          <span style={{ fontSize:11, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8, height:8, background:'var(--surface-2)', border:'1px solid var(--border-strong)' }}/>wydatki
          </span>
          <span style={{ fontSize:11, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8, height:8, background:'var(--accent-soft)', border:'1px solid var(--accent-line)' }}/>przychód
          </span>
        </div>
      </div>
    </div>

    <div className="card">
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div className="label-eyebrow">Ostatnie transakcje</div>
        <button className="btn btn-ghost" style={{ height:28, fontSize:12 }}>Zobacz wszystkie</button>
      </div>
      {txData.map((t,i) => (
        <div key={i} style={{
          display:'grid', gridTemplateColumns:'80px 1fr 140px 120px',
          alignItems:'center', gap:14,
          padding:'12px 18px',
          borderBottom: i < txData.length-1 ? '1px solid var(--border)' : 'none',
        }}>
          <div className="mono" style={{ fontSize:11, color:'var(--text-faint)' }}>{t.d}</div>
          <div style={{ fontSize:13 }}>{t.name}</div>
          <span className="chip" style={{ justifySelf:'start' }}>{t.cat}</span>
          <div className="mono tnum" style={{
            textAlign:'right', fontSize:13, fontWeight:500,
            color: t.amount > 0 ? 'var(--accent)' : 'var(--text)',
          }}>
            {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('pl', { minimumFractionDigits: 2 })} zł
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ——— SLEEP ——————————————————————————————————————————————
const sleepDays = Array.from({length:30}, (_,i) => ({
  date: i,
  hours: 5.5 + Math.sin(i*0.5)*1.2 + Math.random()*1.4,
  bed: 22.5 + Math.random()*1.5,
  wake: 6 + Math.random()*1.5,
  quality: Math.floor(2 + Math.random()*4),
}));

const SleepScreen = () => (
  <div style={{ padding:'20px 24px 40px', display:'flex', flexDirection:'column', gap:16, maxWidth:1280, margin:'0 auto', width:'100%' }}>
    <div>
      <div className="label-eyebrow">Sen</div>
      <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginTop:4 }}>Ostatnie 30 dni</div>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
      {[
        { l:'Średnia', v:'7.1', u:'h', sub:'cel 7.5 h' },
        { l:'Konsekwencja', v:'87', u:'%', sub:'7+ h dni', good:true },
        { l:'Najlepsza noc', v:'8.4', u:'h', sub:'29 kwietnia' },
        { l:'Średni go-to-bed', v:'23:08', u:'', sub:'cel 22:30' },
      ].map(s => (
        <div key={s.l} className="card card-pad" style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div className="label-eyebrow">{s.l}</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
            <div className="mono tnum" style={{ fontSize:26, fontWeight:500, letterSpacing:'-0.02em', color: s.good ? 'var(--accent)' : 'var(--text)' }}>{s.v}</div>
            <div style={{ fontSize:12, color:'var(--text-faint)' }}>{s.u}</div>
          </div>
          <div className="mono" style={{ fontSize:11, color:'var(--text-faint)' }}>{s.sub}</div>
        </div>
      ))}
    </div>

    <div className="card card-pad">
      <SectionHeader eyebrow="Długość snu · 30 dni" title="Codzienne logi"/>
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:200, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
        {sleepDays.map((d,i) => {
          const target = d.hours >= 7;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{
                width:'100%', maxWidth:18,
                height: (d.hours/10)*180,
                background: target ? 'var(--accent)' : 'var(--surface-2)',
                opacity: target ? 0.85 : 1,
                border: target ? 'none' : '1px solid var(--border-strong)',
                borderRadius:'3px 3px 0 0',
              }} title={`${d.hours.toFixed(1)} h`}/>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }} className="mono">
        <span style={{ fontSize:10, color:'var(--text-dim)' }}>30 dni temu</span>
        <span style={{ fontSize:10, color:'var(--text-dim)' }}>cel: 7h ▬</span>
        <span style={{ fontSize:10, color:'var(--text-dim)' }}>dziś</span>
      </div>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <div className="card card-pad">
        <SectionHeader eyebrow="Rozkład jakości" title="Subiektywna ocena"/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { l:'Bardzo dobry · 5', count:8, color:'var(--accent)' },
            { l:'Dobry · 4', count:11, color:'var(--accent)' },
            { l:'Średni · 3', count:7, color:'var(--text-faint)' },
            { l:'Słaby · 2', count:3, color:'var(--warn)' },
            { l:'Bardzo słaby · 1', count:1, color:'var(--danger)' },
          ].map(r => (
            <div key={r.l}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12 }}>{r.l}</span>
                <span className="mono tnum" style={{ fontSize:11, color:'var(--text-muted)' }}>{r.count} dni</span>
              </div>
              <Bar value={r.count} max={11} h={4} color={r.color}/>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <SectionHeader eyebrow="Insight" title="Co działa"/>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { t:'Trening rano → +0.6 h snu', good:true },
            { t:'Ekran po 22:00 → −0.8 h snu', good:false },
            { t:'Kawa po 14:00 → −0.4 h snu', good:false },
            { t:'Sport vs. brak: śr. 7.4 vs. 6.6 h', good:true },
          ].map((x,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)' }}>
              <span style={{
                width:6, height:6, borderRadius:999,
                background: x.good ? 'var(--accent)' : 'var(--danger)',
                flexShrink:0,
              }}/>
              <div style={{ fontSize:13, color:'var(--text)' }}>{x.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ——— WEIGHT ——————————————————————————————————————————————
const weightLog = Array.from({length:90}, (_,i) => 82.4 - (i*0.025) + Math.sin(i*0.5)*0.3);
const weightEntries = [
  { d:'02 maja, 07:12', w:80.1, delta:-0.2 },
  { d:'01 maja, 07:05', w:80.3, delta:-0.1 },
  { d:'30 kwi, 07:30', w:80.4, delta:+0.1 },
  { d:'29 kwi, 06:58', w:80.3, delta:-0.4 },
  { d:'28 kwi, 07:22', w:80.7, delta:0 },
];

const WeightScreen = () => (
  <div style={{ padding:'20px 24px 40px', display:'flex', flexDirection:'column', gap:16, maxWidth:1280, margin:'0 auto', width:'100%' }}>
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
      <div>
        <div className="label-eyebrow">Waga</div>
        <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.02em', marginTop:4 }}>−2.3 kg / 90 dni</div>
      </div>
      <button className="btn btn-accent"><Icon name="plus" size={13}/> Zaloguj</button>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
      {[
        { l:'Obecna', v:'80.1', u:'kg', sub:'02 maja, 07:12', good:true },
        { l:'Cel', v:'79.0', u:'kg', sub:'31 lipca' },
        { l:'BMI', v:'24.3', u:'', sub:'norma' },
        { l:'Tempo', v:'−0.18', u:'kg/tydz', sub:'cel −0.20', good:true },
      ].map(s => (
        <div key={s.l} className="card card-pad" style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div className="label-eyebrow">{s.l}</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
            <div className="mono tnum" style={{ fontSize:28, fontWeight:500, letterSpacing:'-0.025em', color: s.good ? 'var(--accent)' : 'var(--text)' }}>{s.v}</div>
            <div style={{ fontSize:12, color:'var(--text-faint)' }}>{s.u}</div>
          </div>
          <div className="mono" style={{ fontSize:11, color:'var(--text-faint)' }}>{s.sub}</div>
        </div>
      ))}
    </div>

    <div className="card card-pad">
      <SectionHeader eyebrow="Trend · 90 dni" title="Linia wagi"
        action={<div style={{ display:'flex', gap:6 }}>
          {['7d','30d','90d','rok'].map((p,i) => (
            <button key={p} className="btn" style={{
              background: i === 2 ? 'var(--surface-2)' : 'transparent',
              borderColor: i === 2 ? 'var(--border-strong)' : 'transparent',
              color: i === 2 ? 'var(--text)' : 'var(--text-muted)',
            }}>{p}</button>
          ))}
        </div>}/>
      <div style={{ position:'relative', height:240 }}>
        <Sparkline w={1100} h={240} fill data={weightLog}/>
        {/* Target line */}
        <div style={{ position:'absolute', left:0, right:0, top: 240 - ((79 - Math.min(...weightLog))/(Math.max(...weightLog)-Math.min(...weightLog)))*236 - 2, borderTop:'1px dashed var(--border-strong)' }}>
          <span className="mono" style={{ position:'absolute', right:0, top:-16, fontSize:10, color:'var(--text-faint)', background:'var(--surface)', padding:'0 6px' }}>cel 79.0 kg</span>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }} className="mono">
        <span style={{ fontSize:10, color:'var(--text-dim)' }}>02 lutego</span>
        <span style={{ fontSize:10, color:'var(--text-dim)' }}>02 maja</span>
      </div>
    </div>

    <div className="card">
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }} className="label-eyebrow">Ostatnie pomiary</div>
      {weightEntries.map((e,i) => (
        <div key={i} style={{
          display:'grid', gridTemplateColumns:'1fr 100px 100px',
          alignItems:'center', gap:14,
          padding:'12px 18px',
          borderBottom: i < weightEntries.length-1 ? '1px solid var(--border)' : 'none',
        }}>
          <div className="mono" style={{ fontSize:12, color:'var(--text-muted)' }}>{e.d}</div>
          <div className="mono tnum" style={{ textAlign:'right', fontSize:14, fontWeight:500 }}>{e.w} <span style={{ color:'var(--text-faint)', fontSize:11 }}>kg</span></div>
          <div className="mono tnum" style={{
            textAlign:'right', fontSize:12,
            color: e.delta < 0 ? 'var(--accent)' : e.delta > 0 ? 'var(--warn)' : 'var(--text-faint)',
          }}>
            {e.delta > 0 ? '+' : ''}{e.delta.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

window.GoalsScreen = GoalsScreen;
window.FinanceScreen = FinanceScreen;
window.SleepScreen = SleepScreen;
window.WeightScreen = WeightScreen;
