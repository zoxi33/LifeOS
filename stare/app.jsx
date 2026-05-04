/* global React, ReactDOM, TodayScreen, HabitsScreen, JournalScreen, StatsScreen, Sidebar, TopBar, MobileToday, CommandPalette, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSlider, TweakColor */
const { useState, useEffect } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 145,
  "accentChroma": 0.14,
  "density": "default",
  "streakProminence": "medium",
  "showXP": true
}/*EDITMODE-END*/;

function AppShell() {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);
  const [active, setActive] = useState('today');
  const [cmd, setCmd] = useState(false);

  // Apply accent live
  useEffect(() => {
    const root = document.documentElement;
    const h = tweaks.accentHue;
    const c = tweaks.accentChroma;
    root.style.setProperty('--accent', `oklch(0.78 ${c} ${h})`);
    root.style.setProperty('--accent-soft', `oklch(0.78 ${c} ${h} / 0.14)`);
    root.style.setProperty('--accent-line', `oklch(0.78 ${c} ${h} / 0.32)`);
    root.style.setProperty('--success', `oklch(0.78 ${c} ${h})`);
  }, [tweaks.accentHue, tweaks.accentChroma]);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmd(true); }
      if (e.key === 'Escape') setCmd(false);
      if (!e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === '1') setActive('today');
        if (e.key === '2') setActive('habits');
        if (e.key === '3') setActive('journal');
        if (e.key === '4') setActive('stats');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const screen = (
    active === 'today'   ? <TodayScreen tweaks={tweaks}/> :
    active === 'habits'  ? <HabitsScreen/> :
    active === 'journal' ? <JournalScreen/> :
    active === 'stats'   ? <StatsScreen/> :
    active === 'goals'   ? <GoalsScreen/> :
    active === 'finance' ? <FinanceScreen/> :
    active === 'sleep'   ? <SleepScreen/> :
    active === 'weight'  ? <WeightScreen/> :
    <TodayScreen tweaks={tweaks}/>
  );

  const screenLabel = (
    active === 'today' ? 'Today' :
    active === 'habits' ? 'Habits' :
    active === 'journal' ? 'Journal' :
    active === 'stats' ? 'Stats' :
    active === 'goals' ? 'Goals' :
    active === 'finance' ? 'Finance' :
    active === 'sleep' ? 'Sleep' :
    active === 'weight' ? 'Weight' :
    'Other'
  );

  return (
    <div className={'density-' + (tweaks.density || 'default')} style={{
      display:'flex', minHeight:'100vh',
      background: 'var(--bg)',
    }} data-screen-label={screenLabel}>
      <Sidebar active={active} onNav={setActive}/>
      <div style={{ flex: 1, display:'flex', flexDirection:'column', minWidth: 0 }}>
        <TopBar onCmd={() => setCmd(true)}/>
        <main style={{ flex: 1, overflow:'auto' }}>
          {screen}
        </main>
      </div>
      {cmd && <CommandPalette onClose={() => setCmd(false)}/>}

      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Akcent">
          <TweakSlider label="Hue" value={tweaks.accentHue} min={0} max={360} step={1}
            onChange={v => setTweak('accentHue', v)} unit="°"/>
          <TweakSlider label="Saturacja" value={tweaks.accentChroma} min={0} max={0.22} step={0.01}
            onChange={v => setTweak('accentChroma', v)}/>
          <div style={{ display:'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {[
              { name:'Zielony',  h: 145 },
              { name:'Bursztyn', h: 75 },
              { name:'Stalowy',  h: 235 },
              { name:'Mono',     h: 145, c: 0 },
            ].map(p => (
              <button key={p.name} onClick={() => { setTweak('accentHue', p.h); setTweak('accentChroma', p.c ?? 0.14); }}
                style={{
                  padding: '4px 10px', fontSize: 11,
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 999, cursor:'pointer',
                  fontFamily: 'inherit',
                  display:'flex', alignItems:'center', gap: 6,
                }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: `oklch(0.78 ${p.c ?? 0.14} ${p.h})` }}/>
                {p.name}
              </button>
            ))}
          </div>
        </TweakSection>

        <TweakSection title="Layout">
          <TweakRadio label="Gęstość" value={tweaks.density}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'default', label: 'Default' },
              { value: 'loose',   label: 'Loose' },
            ]}
            onChange={v => setTweak('density', v)}/>
          <TweakRadio label="Streak" value={tweaks.streakProminence}
            options={[
              { value: 'subtle', label: 'Subtelnie' },
              { value: 'medium', label: 'Średnio' },
              { value: 'high',   label: 'Mocno' },
            ]}
            onChange={v => setTweak('streakProminence', v)}/>
          <TweakToggle label="Pokaż XP / poziom" value={tweaks.showXP}
            onChange={v => setTweak('showXP', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.AppShell = AppShell;
