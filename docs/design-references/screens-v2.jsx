// SaltCity v2 — Pastoral-first screens · rendered per palette

function V2Dashboard({ palette = 'a' }) {
  const wordCopy = {
    a: { body: '"Bear one another\'s burdens, and so fulfil the law of love."', cite: 'Galatians 6:2', eyebrow: 'For the week' },
    b: { body: '"He restores my soul: he leadeth me in the paths of righteousness for his name\'s sake."', cite: 'Psalm 23:3', eyebrow: 'For the week' },
    c: { body: '"Let love be without dissimulation. Cleave to that which is good. Be kindly affectioned one to another."', cite: 'Romans 12:9-10', eyebrow: 'Word of the week' },
  }[palette];

  const subCopy = {
    a: 'A short briefing for the week ahead — three places to give your attention.',
    b: 'Three places to give attention this week. The rest can wait.',
    c: 'A short briefing for the week ahead, with three places to give your care.',
  }[palette];

  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Dashboard`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Saturday · May 23"
          title='Good evening, <em>Bola.</em>'
          sub={subCopy}
        />

        <V2Word palette={palette} eyebrow={wordCopy.eyebrow} body={wordCopy.body} cite={wordCopy.cite}/>

        {/* Report reminder */}
        <V2Sect label="This week"/>
        <div className="v2-remind">
          <div className="v2-remind__row">
            <span className="v2-remind__eyebrow">Weekly Report · Alpha</span>
            <span className="v2-remind__deadline">Fri · 18:00</span>
          </div>
          <h2 className="v2-remind__title">Your report is <em style={{fontStyle:'italic'}}>almost there.</em></h2>
          <div className="v2-remind__body">Attendance, notes and support are saved. Add the testimonies when you have a quiet ten minutes — submit before Friday.</div>
          <div className="v2-progress"><i style={{width:'75%'}}/></div>
          <div className="v2-progress-meta"><span>3 of 4 sections</span><span>75% complete</span></div>
          <div style={{display:'flex',gap:8}}>
            <button className="v2-btn v2-btn--ink v2-btn--lg" style={{flex:1}}>Continue</button>
            <button className="v2-btn v2-btn--soft v2-btn--lg">Later</button>
          </div>
        </div>

        {/* People to remember */}
        <V2Sect label="People to remember" action="See all care"/>
        <div className="v2-card">
          {[
            {n:'Ngozi Eze', initials:'NE', ring:'urgent', sub:'3 weeks absent · family crisis', note:'A note or a call may be the right step.', pill:'urgent', pillT:'Urgent'},
            {n:'Emeka Ibe', initials:'EI', ring:'care', sub:'Missed Sun · work travel', note:'Confirm whether transport support is needed.', pill:'care', pillT:'Assigned'},
            {n:'Mary Okafor', initials:'MO', ring:'ok', sub:'Recovering · resolved this week', note:'Resolved this week — give thanks.', pill:'ok', pillT:'Resolved'},
          ].map(p=>(
            <div key={p.n} className="v2-prow">
              <V2Avatar initials={p.initials} ring={p.ring}/>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{p.n}</div>
                  <V2Pill tone={p.pill}>{p.pillT}</V2Pill>
                </div>
                <div className="v2-prow__sub">{p.sub}</div>
                <div className="v2-prow__note">"{p.note}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Small tasks */}
        <V2Sect label="Small things to close" action="All tasks"/>
        <div className="v2-card">
          {[
            {t:'Call Emeka about transport', done:false, meta:'Today · high'},
            {t:'Confirm Sunday roster with assistant', done:false, meta:'Today'},
            {t:'Acknowledge board meeting notice', done:true, meta:'Mon'},
          ].map((t,i)=>(
            <div className="v2-trow" key={i}>
              <div className={`v2-check ${t.done?'':'is-done'}`} style={{boxShadow: t.done?'none':'inset 0 0 0 1.5px var(--rule-strong)', background: t.done?'var(--calm)':'transparent'}}>
              </div>
              {/* second pass with done flag */}
            </div>
          ))}
          {/* render correctly */}
          <style>{`.v2-card .v2-trow .v2-check{}`}</style>
        </div>

        {/* (fix the task render above) */}
        <ScriptureCleaner palette={palette}/>

        {/* Sunday */}
        <V2Sect label="Sunday is coming"/>
        <div className="v2-sun">
          <div className="v2-sun__date dark">
            <div className="m">May</div>
            <div className="d">24</div>
            <div className="y">Sun</div>
          </div>
          <div style={{flex:1}}>
            <div className="v2-sun__eyebrow">Stewardship Sunday</div>
            <div className="v2-sun__title">Main Service · 09:00</div>
            <div className="v2-sun__meta">Leaders gather 15 min early in Hall B. Bring one written reflection.</div>
          </div>
        </div>

        {/* Notice */}
        <V2Sect label="From the desk"/>
        <div className="v2-notice">
          <div className="v2-notice__head">
            <span className="v2-notice__tag">General notice</span>
            <span className="v2-notice__date">Pub. May 19</span>
          </div>
          <div className="v2-notice__t">Board meeting rescheduled to October 24</div>
          <div className="v2-notice__b">Regional reports due by EOD Friday Oct 22. Final agenda follows next week.</div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="home"/>
    </div>
  );
}

// ---- clean re-render of tasks (avoiding the awkward inline above) ----
function ScriptureCleaner({ palette }) {
  // Used as a positional placeholder so we can replace the previous broken block above
  // with a proper rendered tasklist. Trick: render an absolutely-positioned overlay
  // ... but simpler: re-export a proper task card and we'll restructure dashboard below
  return null;
}

/* === Proper unified dashboard (replaces the v2Dashboard above) === */
function V2DashboardFixed({ palette = 'a' }) {
  const wordCopy = {
    a: { body: <>"Bear one another's burdens, and so fulfil the law of love."</>, cite: 'Galatians 6:2', eyebrow: 'For the week' },
    b: { body: <>"He restores my soul; he leadeth me in the paths of righteousness for his name's sake."</>, cite: 'Psalm 23:3', eyebrow: 'For the week' },
    c: { body: <>"Let love be without dissimulation. Be kindly affectioned one to another with brotherly love."</>, cite: 'Romans 12:9–10', eyebrow: 'Word of the week' },
  }[palette];

  const subCopy = {
    a: 'A short briefing for the week ahead — three places to give your attention.',
    b: 'Three places to give attention this week. The rest can wait.',
    c: 'A short briefing for the week ahead, with three places to give your care.',
  }[palette];

  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Leader Dashboard`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Saturday · May 23"
          title='Good evening, <em>Bola.</em>'
          sub={subCopy}
        />

        <V2Word palette={palette} eyebrow={wordCopy.eyebrow} body={wordCopy.body} cite={wordCopy.cite}/>

        <V2Sect label="This week"/>
        <div className="v2-remind">
          <div className="v2-remind__row">
            <span className="v2-remind__eyebrow">Weekly Report · Alpha</span>
            <span className="v2-remind__deadline">Fri · 18:00</span>
          </div>
          <h2 className="v2-remind__title">Your report is <em style={{fontStyle:'italic'}}>almost there.</em></h2>
          <div className="v2-remind__body">Attendance, notes and support are saved. Add the testimonies when you have a quiet ten minutes — submit before Friday.</div>
          <div className="v2-progress"><i style={{width:'75%'}}/></div>
          <div className="v2-progress-meta"><span>3 of 4 sections</span><span>75% complete</span></div>
          <div style={{display:'flex',gap:8}}>
            <button className="v2-btn v2-btn--ink v2-btn--lg" style={{flex:1}}>Continue</button>
            <button className="v2-btn v2-btn--soft v2-btn--lg">Later</button>
          </div>
        </div>

        <V2Sect label="People to remember" action="See all care"/>
        <div className="v2-card">
          {[
            {n:'Ngozi Eze', initials:'NE', ring:'urgent', sub:'3 weeks absent · family crisis', note:'A note or a call may be the right step.', pill:'urgent', pillT:'Urgent'},
            {n:'Emeka Ibe', initials:'EI', ring:'care', sub:'Missed Sun · work travel', note:'Confirm whether transport support is needed.', pill:'care', pillT:'Assigned'},
            {n:'Mary Okafor', initials:'MO', ring:'ok', sub:'Recovering · resolved this week', note:'Resolved — give thanks.', pill:'ok', pillT:'Resolved'},
          ].map(p=>(
            <div key={p.n} className="v2-prow">
              <V2Avatar initials={p.initials} ring={p.ring}/>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{p.n}</div>
                  <V2Pill tone={p.pill}>{p.pillT}</V2Pill>
                </div>
                <div className="v2-prow__sub">{p.sub}</div>
                <div className="v2-prow__note">"{p.note}"</div>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Small things to close" action="All tasks"/>
        <div className="v2-card">
          {[
            {t:'Call Emeka about transport', done:false, prio:'high', meta:'Today'},
            {t:'Confirm Sunday roster with assistant', done:false, prio:'normal', meta:'Today'},
            {t:'Acknowledge board meeting notice', done:true, prio:'low', meta:'Mon'},
          ].map((t,i)=>(
            <div className="v2-trow" key={i}>
              <div className={`v2-check ${t.done?'is-done':''}`}/>
              <div className="v2-trow__body">
                <div className={`v2-trow__t ${t.done?'is-done':''}`}>{t.t}</div>
                <div className="v2-trow__meta">
                  <span>{t.meta}</span>
                  {t.prio === 'high' ? <><span className="sep">·</span><span className="v2-trow__prio" style={{color:'var(--status-urgent)'}}>High</span></> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Sunday is coming"/>
        <div className="v2-sun">
          <div className="v2-sun__date dark">
            <div className="m">May</div>
            <div className="d">24</div>
            <div className="y">Sun</div>
          </div>
          <div style={{flex:1}}>
            <div className="v2-sun__eyebrow">Stewardship Sunday</div>
            <div className="v2-sun__title">Main Service · 09:00</div>
            <div className="v2-sun__meta">Leaders gather 15 min early in Hall B. Bring one written reflection.</div>
          </div>
        </div>

        <V2Sect label="From the desk"/>
        <div className="v2-notice">
          <div className="v2-notice__head">
            <span className="v2-notice__tag">General notice</span>
            <span className="v2-notice__date">Pub. May 19</span>
          </div>
          <div className="v2-notice__t">Board meeting rescheduled to October 24</div>
          <div className="v2-notice__b">Regional reports due by EOD Friday Oct 22. Final agenda follows next week.</div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="home"/>
    </div>
  );
}

function V2ReportDraft({ palette = 'a' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Report Draft`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Weekly Report · Week 21 · May 18–24"
          title='Company Alpha <em>draft.</em>'
          sub="Three quiet steps. Tap absent members, add notes, submit."
        />

        {/* Step rail */}
        <div style={{padding:'8px 24px 0'}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {['Attendance','Notes','Submit'].map((s,i)=>(
              <React.Fragment key={s}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:22,height:22,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:10,fontWeight:700,background:i<2?'var(--ink)':'var(--bg-deep)',color:i<2?'var(--bg)':'var(--ink-3)'}}>{i+1}</span>
                  <span style={{fontFamily:'var(--sans)',fontSize:12,fontWeight:i<2?600:500,color:i<2?'var(--ink)':'var(--ink-3)',letterSpacing:'-0.005em'}}>{s}</span>
                </div>
                {i<2 ? <span style={{flex:1,height:1,background:'var(--rule)'}}/> : null}
              </React.Fragment>
            ))}
          </div>
        </div>

        <V2Sect label="Step 1 · Attendance" action="14 members"/>
        <div className="v2-card">
          <div style={{display:'flex',gap:20,marginBottom:12}}>
            <div className="v2-counter"><div className="v">12 <small>/14</small></div><div className="l">Present today</div></div>
            <div className="v2-counter"><div className="v" style={{color:'var(--status-urgent)'}}>2</div><div className="l">Absent</div></div>
            <div className="v2-counter"><div className="v">2</div><div className="l">Visitors</div></div>
          </div>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:13.5,color:'var(--ink-2)',lineHeight:1.5}}>Everyone is present by default. Tap a member to mark them absent.</div>

          <div className="v2-soft-div"/>

          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:10,fontWeight:600}}>Marked absent</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
            {[{n:'Mary Okafor',i:'MO',r:'Illness'},{n:'Emeka Ibe',i:'EI',r:'Work'}].map(m=>(
              <span key={m.n} className="v2-mchip is-absent">
                <span className="mi">{m.i}</span>
                <span><span className="label">{m.n}</span> <span style={{opacity:0.7,fontSize:11.5,marginLeft:2}}>· {m.r}</span></span>
              </span>
            ))}
          </div>

          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:10,fontWeight:600}}>Present · tap to mark absent</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {[
              ['DJ Wes','DW'],['John Adeyemi','JA'],['Tobi A.','TA'],['Ada N.','AN'],
              ['Sade K.','SK'],['Femi O.','FO'],['Bisi I.','BI'],['Ruth E.','RE'],
              ['Daniel A.','DA'],['Grace U.','GU'],['Ebuka M.','EM'],['Joy B.','JB']
            ].map(([n,i])=>(
              <span key={n} className="v2-mchip">
                <span className="mi">{i}</span>
                <span className="label">{n}</span>
              </span>
            ))}
          </div>
        </div>

        <V2Sect label="Step 2 · Notes"/>
        <div className="v2-card">
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="v2-field">
              <label className="v2-field__label">Visitors this week</label>
              <input className="v2-input" defaultValue="2"/>
            </div>
            <div className="v2-field">
              <label className="v2-field__label">How was the week?</label>
              <textarea className="v2-ta" defaultValue="Good engagement in worship. Several first-timers connected with members during prayer."/>
            </div>
            <div className="v2-field">
              <label className="v2-field__label">Where do you need support?</label>
              <textarea className="v2-ta" defaultValue="Need follow-up on Mary's recovery and someone to lead the youth session next Sunday."/>
            </div>
            <div className="v2-field">
              <label className="v2-field__label">Testimonies</label>
              <textarea className="v2-ta" placeholder="What did God do this week? (one or two short stories)"/>
            </div>
          </div>
        </div>

        <div style={{padding:'18px 20px 0',display:'flex',gap:10}}>
          <button className="v2-btn v2-btn--soft v2-btn--lg" style={{flex:1}}>Save progress</button>
          <button className="v2-btn v2-btn--primary v2-btn--lg" style={{flex:1.3}}>Submit report</button>
        </div>
        <div style={{padding:'12px 20px 0',textAlign:'center',fontFamily:'var(--mono)',fontSize:10,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',fontWeight:600}}>
          Auto-saved · Tue 6:14 PM · window closes Fri 18:00
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="report"/>
    </div>
  );
}

function V2FollowUp({ palette = 'a' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Follow-up Care`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Pastoral Care · Company Alpha"
          title='Care for your <em>absent members.</em>'
          sub="Three live this week. One needs attention soon."
        />

        {/* Soft summary — counters without box */}
        <div style={{padding:'14px 24px 0',display:'flex',gap:22}}>
          <div className="v2-counter"><div className="v">3</div><div className="l">Active</div></div>
          <div className="v2-counter"><div className="v" style={{color:'var(--status-urgent)'}}>1</div><div className="l">Urgent</div></div>
          <div className="v2-counter"><div className="v">2</div><div className="l">Resolved</div></div>
        </div>

        {/* Urgent case — deep primary card */}
        <V2Sect label="Urgent · please look first"/>
        <div className="v2-word" style={{background:'var(--ink)', color:'#fff'}}>
          <div className="v2-word__glyph" style={{color:'rgba(255,255,255,0.07)'}}>{'\u201D'}</div>
          <div className="v2-word__eyebrow" style={{color:'var(--status-urgent-bg)'}}>
            {V2Icons.warn}<span>3 Weeks Absent · Family Crisis</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <div className="v2-prow__avatar" style={{background:'rgba(255,255,255,0.1)',color:'#fff',width:46,height:46,flex:'0 0 46px',fontSize:14}}>NE</div>
            <div>
              <div style={{fontFamily:'var(--serif)',fontSize:22,color:'#fff',fontWeight:500,letterSpacing:'-0.012em',lineHeight:1.1}}>Ngozi Eze</div>
              <div style={{fontFamily:'var(--sans)',fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:3}}>Company Alpha · Absent since May 4</div>
            </div>
          </div>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:14.5,lineHeight:1.5,color:'rgba(255,255,255,0.9)',paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.12)'}}>
            "Last contact May 4. Two attempts by your assistant, no response. A family member reported a bereavement on May 11."
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            <button className="v2-btn v2-btn--lg" style={{background:'#fff',color:'var(--ink)',flex:1}}>Update case</button>
            <button className="v2-btn v2-btn--lg" style={{background:'rgba(255,255,255,0.1)',color:'#fff'}}>Hand to pastor</button>
          </div>
        </div>

        {/* Assigned case — editable */}
        <V2Sect label="Assigned to you" action="Open all"/>
        <div className="v2-card">
          <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
            <V2Avatar initials="EI" ring="care"/>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}>
                <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.005em'}}>Emeka Ibe</div>
                <V2Pill tone="care">Assigned</V2Pill>
              </div>
              <div className="v2-prow__sub">Company Alpha · Missed May 17 · work travel</div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div className="v2-counter"><div className="l">Last contact</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3}}>—</div></div>
            <div className="v2-counter"><div className="l">Linked report</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3}}>Week 20</div></div>
          </div>

          <div className="v2-soft-div"/>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="v2-field">
              <label className="v2-field__label">Next action</label>
              <textarea className="v2-ta" defaultValue="Call after evening service and confirm whether transport support is needed."/>
            </div>
            <div className="v2-field">
              <label className="v2-field__label">Pastoral note (private)</label>
              <textarea className="v2-ta" placeholder="A short note for yourself — what to remember when you speak."/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="v2-btn v2-btn--soft v2-btn--lg" style={{flex:1}}>Mark contacted</button>
              <button className="v2-btn v2-btn--primary v2-btn--lg" style={{flex:1.2}}>Save update</button>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <V2Sect label="Resolved · with thanks" action="Archive"/>
        <div className="v2-card">
          {[
            {n:'Mary Okafor', initials:'MO', sub:'Family situation · May 18', note:'Member contacted; recovery support in place. Family attending Sunday.'},
            {n:'Ify Johnson', initials:'IJ', sub:'Illness · May 15', note:'Reported malaria; prayer team followed up. Recovering well.'},
          ].map(c=>(
            <div key={c.n} className="v2-prow">
              <V2Avatar initials={c.initials} ring="ok"/>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{c.n}</div>
                  <V2Pill tone="ok">Resolved</V2Pill>
                </div>
                <div className="v2-prow__sub">{c.sub}</div>
                <div className="v2-prow__note">"{c.note}"</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="care"/>
    </div>
  );
}

/* === Recommended-direction extras: Admin Dashboard + Tasks === */

function V2AdminDashboard({ palette = 'c' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Admin Dashboard`}>
      <V2Head role="Church Admin" name="Pastor Salt"/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Saturday · May 23"
          title='Good evening, <em>Pastor.</em>'
          sub="Two companies have not submitted. One care case needs your hand this week."
        />

        <V2Word
          palette={palette}
          eyebrow="Word for shepherds"
          body={<>"And let us consider one another, to provoke unto love and to good works."</>}
          cite="Hebrews 10:24"
        />

        {/* Submission progress */}
        <V2Sect label="Reports · Week 21"/>
        <div className="v2-remind">
          <div className="v2-remind__row">
            <span className="v2-remind__eyebrow">Submission Progress</span>
            <span className="v2-remind__deadline">71% In · 2 Left</span>
          </div>
          <h2 className="v2-remind__title">5 of 7 companies <em style={{fontStyle:'italic'}}>have submitted.</em></h2>
          <div className="v2-progress"><i style={{width:'71%'}}/></div>
          <div className="v2-progress-meta"><span>3 awaiting review</span><span>2 reviewed</span></div>
          <div style={{display:'flex',gap:8}}>
            <button className="v2-btn v2-btn--ink v2-btn--lg" style={{flex:1}}>Review queue</button>
            <button className="v2-btn v2-btn--soft v2-btn--lg">Nudge missing</button>
          </div>
        </div>

        {/* Missing */}
        <V2Sect label="Missing submissions"/>
        <div className="v2-card">
          {[
            {co:'Company Zeta', lead:'Tunde O.', late:'2 days late'},
            {co:'Company Eta', lead:'Chika M.', late:'1 day late'},
          ].map(c=>(
            <div key={c.co} className="v2-prow">
              <div className="v2-prow__avatar" style={{background:'var(--status-urgent-bg)',color:'var(--status-urgent)'}}>{V2Icons.warn}</div>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{c.co}</div>
                  <V2Pill tone="urgent">Missing</V2Pill>
                </div>
                <div className="v2-prow__sub">Leader {c.lead} · {c.late}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent care */}
        <V2Sect label="Urgent care · across leadership"/>
        <div className="v2-word" style={{background:'var(--ink)', color:'#fff'}}>
          <div className="v2-word__glyph" style={{color:'rgba(255,255,255,0.07)'}}>"</div>
          <div className="v2-word__eyebrow" style={{color:'var(--status-urgent-bg)'}}>
            {V2Icons.warn}<span>Pastoral Care · Urgent</span>
          </div>
          <div style={{fontFamily:'var(--serif)',fontSize:21,color:'#fff',fontWeight:500,letterSpacing:'-0.012em',lineHeight:1.18,marginBottom:8,marginTop:2}}>Ngozi Eze — 3 weeks absent</div>
          <div style={{fontSize:13,lineHeight:1.5,color:'rgba(255,255,255,0.8)'}}>Company Delta. No contact since May 4. Assistant leader has tried twice. Family member reported a bereavement.</div>
          <div style={{display:'flex',gap:8,marginTop:14}}>
            <button className="v2-btn v2-btn--lg" style={{background:'#fff',color:'var(--ink)'}}>Assign pastor</button>
            <button className="v2-btn v2-btn--lg" style={{background:'rgba(255,255,255,0.1)',color:'#fff'}}>View case</button>
          </div>
        </div>

        {/* Admin tasks */}
        <V2Sect label="Admin checklist" action="All tasks"/>
        <div className="v2-card">
          {[
            {t:'Approve Company Beta report (flagged)', done:false, prio:'high', meta:'Today'},
            {t:'Sign off on volunteer schedule v3', done:false, prio:'normal', meta:'Wed'},
            {t:'Publish board meeting notice', done:true, prio:'low', meta:'Mon'},
            {t:'Confirm guest speaker — May 31', done:false, prio:'normal', meta:'Thu'},
          ].map((t,i)=>(
            <div className="v2-trow" key={i}>
              <div className={`v2-check ${t.done?'is-done':''}`}/>
              <div className="v2-trow__body">
                <div className={`v2-trow__t ${t.done?'is-done':''}`}>{t.t}</div>
                <div className="v2-trow__meta">
                  <span>{t.meta}</span>
                  {t.prio === 'high' ? <><span className="sep">·</span><span className="v2-trow__prio" style={{color:'var(--status-urgent)'}}>High</span></> : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <V2Sect label="From the desk"/>
        <div className="v2-notice" style={{background:'var(--status-urgent-bg)'}}>
          <div className="v2-notice__head">
            <span className="v2-notice__tag" style={{color:'var(--status-urgent)'}}>Urgent notice</span>
            <span className="v2-notice__date">Pub. May 22</span>
          </div>
          <div className="v2-notice__t">Building access — side entrance on Sunday</div>
          <div className="v2-notice__b">Main vestibule under repair. Brief members at company close.</div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="home" variant="admin"/>
    </div>
  );
}

function V2Tasks({ palette = 'c' }) {
  const groups = [
    { label: 'Today · Saturday May 23', items: [
      {t:'Call Emeka about transport support', done:false, prio:'high', co:'Company Alpha'},
      {t:'Confirm Sunday roster with assistant', done:false, prio:'normal', co:'Company Alpha'},
    ]},
    { label: 'This week', items: [
      {t:'Prepare Sunday leader attendance notes', done:false, prio:'normal', co:'Company Alpha'},
      {t:'Brief two new members on welcome group', done:false, prio:'normal', co:'Company Alpha'},
      {t:'Submit Week 21 weekly report', done:false, prio:'high', co:'Company Alpha'},
    ]},
    { label: 'Done', items: [
      {t:'Acknowledge board meeting notice', done:true, prio:'low', co:'Admin'},
      {t:'Close completed illness follow-up', done:true, prio:'low', co:'Company Alpha'},
    ]},
  ];

  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Tasks`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Leadership Checklist"
          title='Five to close <em>this week.</em>'
          sub="A simple, gentle pass through what you've taken on."
        />

        {/* Counters in flat soft strip */}
        <div style={{padding:'14px 24px 0',display:'flex',gap:22}}>
          <div className="v2-counter"><div className="v">7</div><div className="l">Total</div></div>
          <div className="v2-counter"><div className="v" style={{color:'var(--status-urgent)'}}>2</div><div className="l">High prio</div></div>
          <div className="v2-counter"><div className="v">2</div><div className="l">Done</div></div>
        </div>

        {groups.map(g=>(
          <React.Fragment key={g.label}>
            <V2Sect label={g.label} action={`${g.items.length}`}/>
            <div className="v2-card">
              {g.items.map((t,i)=>(
                <div className="v2-trow" key={i}>
                  <div className={`v2-check ${t.done?'is-done':''}`}/>
                  <div className="v2-trow__body">
                    <div className={`v2-trow__t ${t.done?'is-done':''}`}>{t.t}</div>
                    <div className="v2-trow__meta">
                      <span>{t.co}</span>
                      <span className="sep">·</span>
                      <span>{t.done?'Done':'Open'}</span>
                      {t.prio==='high' ? <><span className="sep">·</span><span className="v2-trow__prio" style={{color:'var(--status-urgent)'}}>High</span></> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}

        <div style={{padding:'20px 20px 0'}}>
          <button className="v2-btn v2-btn--soft v2-btn--lg v2-btn--full">{V2Icons.plus}<span>Add a personal task</span></button>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="tasks"/>
    </div>
  );
}

Object.assign(window, { V2DashboardFixed, V2ReportDraft, V2FollowUp, V2AdminDashboard, V2Tasks });
