// SaltCity v2 — Remaining 6 screens (palette-agnostic via prop)

function V2ReportReviewed({ palette = 'a' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Report Reviewed`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Weekly Report · Week 20 · May 11 — 17"
          title='Company Alpha — <em>reviewed.</em>'
          sub="The week is closed. Read-only summary below."
        />

        <div style={{padding:'8px 24px 0',display:'flex',gap:8,alignItems:'center'}}>
          <V2Pill tone="ok">Reviewed by Pastor Salt</V2Pill>
          <span style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-3)'}}>May 19 · 8:12 AM</span>
        </div>

        <V2Sect label="Submission record"/>
        <div className="v2-card">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:14,columnGap:14}}>
            <div className="v2-counter"><div className="l">Submitted</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3,letterSpacing:'-0.005em'}}>May 18 · 9:56 PM</div></div>
            <div className="v2-counter"><div className="l">Reviewed</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3,letterSpacing:'-0.005em'}}>May 19 · 8:12 AM</div></div>
            <div className="v2-counter"><div className="l">Week of</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3}}>May 11 — 17</div></div>
            <div className="v2-counter"><div className="l">Status</div><div style={{fontFamily:'var(--sans)',fontSize:14,fontWeight:600,marginTop:3,color:'var(--status-ok)'}}>Reviewed</div></div>
          </div>
        </div>

        <V2Sect label="Attendance"/>
        <div className="v2-card">
          <div style={{display:'flex',gap:24,marginBottom:10}}>
            <div className="v2-counter"><div className="v">11 <small>/14</small></div><div className="l">Present</div></div>
            <div className="v2-counter"><div className="v" style={{color:'var(--status-urgent)'}}>3</div><div className="l">Absent</div></div>
            <div className="v2-counter"><div className="v">1</div><div className="l">Visitor</div></div>
          </div>
          <div className="v2-soft-div"/>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:10,fontWeight:600}}>Absent — recorded</div>
          {[
            {n:'Mary Okafor', initials:'MO', r:'Family situation', d:'May 11', linked:true},
            {n:'Ify Johnson', initials:'IJ', r:'Illness', d:'May 17', linked:true},
            {n:'Tobi Adeyemi', initials:'TA', r:'Travel', d:'May 11', linked:false},
          ].map((a,i,arr)=>(
            <div key={a.n} className="v2-prow" style={{padding:'12px 0', boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <V2Avatar initials={a.initials}/>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{a.n}</div>
                  <span style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-3)'}}>{a.d}</span>
                </div>
                <div className="v2-prow__sub">{a.r}{a.linked ? <> · <span style={{color:'var(--status-care)'}}>care case linked</span></> : null}</div>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Notes from the week"/>
        <div className="v2-card">
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:6,fontWeight:600}}>General</div>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:14,color:'var(--ink-2)',lineHeight:1.55}}>Strong worship engagement. Two new members from Tobi's invitation; both joined the welcome group.</div>
          <div className="v2-soft-div"/>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:6,fontWeight:600}}>Support needed</div>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:14,color:'var(--ink-2)',lineHeight:1.55}}>Need a youth lead for Sun May 24. Mary's family situation needs pastoral attention.</div>
          <div className="v2-soft-div"/>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:6,fontWeight:600}}>Testimonies</div>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:14,color:'var(--ink-2)',lineHeight:1.55}}>Femi shared on family reconciliation; Joy testified on healing during the week of prayer.</div>
        </div>

        <div style={{padding:'14px 24px 0'}}>
          <div style={{fontFamily:'var(--sans)',fontSize:12.5,color:'var(--ink-3)',lineHeight:1.55,fontStyle:'italic',fontFamily:'var(--serif)'}}>Editing is closed for reviewed reports. For a correction, message the church admin.</div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="report"/>
    </div>
  );
}

function V2AdminReports({ palette = 'a' }) {
  const cos = [
    {n:'Company Alpha', lead:'Bola A.', s:'reviewed', sub:'May 18 · 9:56 PM', att:'11/14'},
    {n:'Company Beta', lead:'Dami K.', s:'submitted', sub:'May 19 · 7:30 AM', att:'9/13'},
    {n:'Company Gamma', lead:'Funke A.', s:'flagged', sub:'May 19 · 10:14 PM', att:'8/12', flag:'Low attendance · check on Funke'},
    {n:'Company Delta', lead:'Uche N.', s:'submitted', sub:'May 19 · 5:48 PM', att:'10/15'},
    {n:'Company Epsilon', lead:'Tobi O.', s:'reviewed', sub:'May 18 · 11:02 PM', att:'12/13'},
    {n:'Company Zeta', lead:'Tunde O.', s:'missing', sub:'No submission', att:'—'},
    {n:'Company Eta', lead:'Chika M.', s:'missing', sub:'No submission', att:'—'},
  ];
  const toneOf = (s) => ({reviewed:'ok',submitted:'care',flagged:'urgent',missing:'quiet'})[s];
  const labelOf = (s) => ({reviewed:'Reviewed',submitted:'Submitted',flagged:'Flagged',missing:'Missing'})[s];

  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Admin Reports`}>
      <V2Head role="Church Admin" name="Pastor Salt"/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Reports · Week 21 · May 18 — 24"
          title='Weekly submissions.'
          sub="Five are in. Two outstanding. One flagged for your eye."
        />

        {/* Progress hero */}
        <div className="v2-remind">
          <div className="v2-remind__row">
            <span className="v2-remind__eyebrow">Overall Completion</span>
            <span className="v2-remind__deadline">5 of 7</span>
          </div>
          <h2 className="v2-remind__title">71% in. <em style={{fontStyle:'italic'}}>Two left.</em></h2>
          <div className="v2-progress"><i style={{width:'71%'}}/></div>
          <div className="v2-progress-meta" style={{marginBottom:0}}>
            <span><span style={{display:'inline-block',width:6,height:6,borderRadius:3,background:'var(--status-ok)',marginRight:6,verticalAlign:'1px'}}/>2 reviewed</span>
            <span><span style={{display:'inline-block',width:6,height:6,borderRadius:3,background:'var(--status-care)',marginRight:6,verticalAlign:'1px'}}/>2 submitted</span>
            <span><span style={{display:'inline-block',width:6,height:6,borderRadius:3,background:'var(--status-urgent)',marginRight:6,verticalAlign:'1px'}}/>1 flagged</span>
            <span><span style={{display:'inline-block',width:6,height:6,borderRadius:3,background:'var(--quiet)',marginRight:6,verticalAlign:'1px'}}/>2 missing</span>
          </div>
        </div>

        <V2Sect label="Needs your attention" action="Nudge all"/>
        <div className="v2-card">
          {cos.filter(c=>c.s==='missing'||c.s==='flagged').map((c,i,arr)=>(
            <div key={c.n} className="v2-prow" style={{padding:'14px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none',alignItems:'center'}}>
              <div className="v2-prow__avatar" style={{background: c.s==='missing'?'var(--quiet-bg)':'var(--status-urgent-bg)', color: c.s==='missing'?'var(--quiet)':'var(--status-urgent)'}}>
                {V2Icons.warn}
              </div>
              <div className="v2-prow__body">
                <div className="v2-prow__head">
                  <div className="v2-prow__name">{c.n}</div>
                  <V2Pill tone={toneOf(c.s)}>{labelOf(c.s)}</V2Pill>
                </div>
                <div className="v2-prow__sub">{c.lead} · {c.sub}</div>
                {c.flag ? <div className="v2-prow__note" style={{color:'var(--status-urgent)',fontStyle:'normal',fontFamily:'var(--sans)',fontSize:12.5,fontWeight:500}}>{c.flag}</div> : null}
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  {c.s==='missing'
                    ? <button className="v2-btn v2-btn--soft" style={{padding:'7px 12px',fontSize:11.5}}>Send nudge</button>
                    : <button className="v2-btn v2-btn--primary" style={{padding:'7px 12px',fontSize:11.5}}>Review now</button>}
                  <button className="v2-btn v2-btn--soft" style={{padding:'7px 12px',fontSize:11.5}}>Open</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Awaiting review" action="3 ready"/>
        <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
          {cos.filter(c=>c.s==='submitted').map(c=>(
            <div key={c.n} style={{background:'var(--surface)',borderRadius:'var(--r-card)',padding:'14px 16px',boxShadow:'var(--shadow-lift)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8,marginBottom:8}}>
                <div style={{fontFamily:'var(--serif)',fontSize:17,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.005em'}}>{c.n}</div>
                <V2Pill tone="care">Submitted</V2Pill>
              </div>
              <div style={{display:'flex',gap:18,marginBottom:10}}>
                <div className="v2-counter"><div className="v" style={{fontSize:18}}>{c.att}</div><div className="l">Attend.</div></div>
                <div className="v2-counter"><div className="v" style={{fontSize:18}}>1</div><div className="l">Visitor</div></div>
                <div className="v2-counter"><div className="v" style={{fontSize:18}}>2</div><div className="l">Absent</div></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,paddingTop:10,borderTop:'1px solid var(--rule)'}}>
                <div style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-3)'}}>{c.lead} · {c.sub}</div>
                <button className="v2-btn v2-btn--ink" style={{padding:'8px 14px',fontSize:11.5}}>Review →</button>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Reviewed this week"/>
        <div className="v2-card">
          {cos.filter(c=>c.s==='reviewed').map((c,i,arr)=>(
            <div key={c.n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:16,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.005em'}}>{c.n}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--ink-3)',marginTop:2}}>{c.lead} · {c.att} attended</div>
              </div>
              <V2Pill tone="ok">Reviewed</V2Pill>
            </div>
          ))}
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="report" variant="admin"/>
    </div>
  );
}

function V2Announcements({ palette = 'a' }) {
  const urgent = {
    title:'Building access — side entrance on Sunday',
    body:'All leaders must use the side entrance on Sunday morning while the main vestibule is under repair. Please brief your members at the close of each company gathering. Security has been notified and badges remain valid.',
    date:'May 22', exp:'Expires May 25', audience:'All leaders'
  };
  const notices = [
    {tag:'General notice', date:'May 19', exp:'No expiry', audience:'Company leaders',
      title:'Board meeting rescheduled to October 24',
      body:'The quarterly oversight meeting has been moved to October 24, 9:00 AM. Please ensure regional reports are uploaded by EOD Friday Oct 22. Final agenda will follow next week.', tone:'care'},
    {tag:'General notice', date:'May 17', exp:'Expires Jun 7', audience:'All members',
      title:'Stewardship Sunday — May 24',
      body:'May 24 is set apart as Stewardship Sunday. Companies are asked to prepare one written reflection to share during the small-group hour. Leaders gather 15 min early in Hall B.', tone:'care'},
  ];

  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Announcements`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Notice Board"
          title='From the desk.'
          sub="Four active notices. One urgent, please read first."
        />

        {/* Urgent featured */}
        <div style={{padding:'18px 20px 0'}}>
          <div style={{background:'var(--status-urgent-bg)',borderRadius:'var(--r-card)',padding:'18px 20px 18px',position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8,marginBottom:8}}>
              <V2Pill tone="urgent">Urgent</V2Pill>
              <span style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--status-urgent)',textTransform:'uppercase',fontWeight:600,opacity:0.75}}>Pub. {urgent.date}</span>
            </div>
            <div style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.014em',lineHeight:1.18,marginBottom:10,textWrap:'pretty'}}>{urgent.title}</div>
            <div style={{fontSize:13.5,lineHeight:1.55,color:'var(--ink-2)'}}>{urgent.body}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:14,paddingTop:12,borderTop:'1px solid rgba(140,42,41,0.15)'}}>
              <span style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--status-urgent)',fontWeight:500,letterSpacing:'0.01em'}}>{urgent.audience} · {urgent.exp}</span>
              <button className="v2-btn" style={{background:'var(--status-urgent)',color:'#fff',padding:'8px 14px',fontSize:11.5}}>Acknowledge</button>
            </div>
          </div>
        </div>

        <V2Sect label="Active notices"/>
        <div className="v2-card">
          {notices.map((n,i,arr)=>(
            <div key={n.title} style={{padding:'14px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div style={{display:'flex',gap:10,alignItems:'baseline',marginBottom:6}}>
                <V2Pill tone={n.tone}>{n.tag}</V2Pill>
                <span style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-3)'}}>{n.date}</span>
              </div>
              <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.008em',lineHeight:1.22,marginBottom:6,textWrap:'pretty'}}>{n.title}</div>
              <div style={{fontSize:13,lineHeight:1.55,color:'var(--ink-2)'}}>{n.body}</div>
              <div style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-4)',marginTop:8}}>{n.audience} · {n.exp}</div>
            </div>
          ))}
        </div>

        <V2Sect label="Archive"/>
        <div className="v2-card">
          {[
            {title:'New report draft auto-save now active', body:'Drafts now save every two minutes. You no longer need to tap save progress.', date:'May 10'},
            {title:'Spring fast — concluded April 12', body:'Thank you to all leaders who shepherded their companies through the season.', date:'Apr 15'},
          ].map((n,i,arr)=>(
            <div key={n.title} style={{padding:'14px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div style={{display:'flex',gap:10,alignItems:'baseline',marginBottom:4}}>
                <V2Pill tone="quiet">Archived</V2Pill>
                <span style={{fontFamily:'var(--sans)',fontSize:11.5,color:'var(--ink-3)'}}>{n.date}</span>
              </div>
              <div style={{fontFamily:'var(--serif)',fontSize:15,fontWeight:500,color:'var(--ink-2)',marginBottom:4,letterSpacing:'-0.005em'}}>{n.title}</div>
              <div style={{fontSize:12.5,color:'var(--ink-3)',lineHeight:1.5}}>{n.body}</div>
            </div>
          ))}
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="more"/>
    </div>
  );
}

function V2Events({ palette = 'a' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Events`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Calendar · May — June 2026"
          title='Services & gatherings.'
          sub="Weekly rhythm and what's coming next."
        />

        <V2Sect label="Regular schedule"/>
        <div className="v2-card">
          {[
            {d:'Sundays', t:'09:00 — 11:30', n:'Main Service', p:'Main Auditorium'},
            {d:'Tuesdays', t:'18:30 — 20:00', n:'Bible Study', p:'Hall B'},
            {d:'Fridays', t:'19:00 — 20:30', n:'Prayer Watch', p:'Chapel'},
          ].map((s,i,arr)=>(
            <div key={s.n} style={{display:'flex',gap:18,padding:'14px 0',alignItems:'center',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:10,letterSpacing:'0.14em',color:'var(--primary)',textTransform:'uppercase',width:74,fontWeight:700}}>{s.d}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--serif)',fontSize:16,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.005em'}}>{s.n}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--ink-3)',marginTop:2}}>{s.t} · {s.p}</div>
              </div>
            </div>
          ))}
        </div>

        <V2Sect label="Upcoming"/>
        <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
          {[
            {m:'May',d:'24',y:'Sun', dark:true, tag:'Stewardship Sunday', title:'Main Service', meta:'09:00 — 11:30 · Main Auditorium', body:'Leaders gather 15 min early in Hall B. One written reflection per company.'},
            {m:'May',d:'27',y:'Wed', dark:false, tag:'Leaders meeting', title:'Mid-week huddle', meta:'19:30 — 20:30 · Online', body:'Bring company snapshots and one care item to discuss with the room.'},
            {m:'May',d:'31',y:'Sun', dark:false, tag:'Guest minister', title:'Sunday Service', meta:'09:00 — 11:30 · Main Auditorium', body:'Pastor Adaeze Nwosu preaching. Welcome team meets at 08:00.'},
            {m:'Jun',d:'05',y:'Fri', dark:false, tag:'Leaders retreat', title:'Quarterly leadership retreat', meta:'08:00 — 17:00 · Salt Centre', body:'All company and assistant leaders. Lunch and dinner provided.'},
          ].map((e,i)=>(
            <div key={i} style={{background:'var(--surface)',borderRadius:'var(--r-card)',padding:'16px',display:'flex',gap:16,alignItems:'flex-start',boxShadow:'var(--shadow-lift)'}}>
              <div className={`v2-sun__date ${e.dark?'dark':''}`}>
                <div className="m">{e.m}</div>
                <div className="d">{e.d}</div>
                <div className="y">{e.y}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="v2-sun__eyebrow" style={{color: e.dark?'var(--primary)':'var(--ink-3)'}}>{e.tag}</div>
                <div className="v2-sun__title">{e.title}</div>
                <div className="v2-sun__meta">{e.meta}</div>
                <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:13,color:'var(--ink-2)',marginTop:6,lineHeight:1.45}}>{e.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="more"/>
    </div>
  );
}

function V2Companies({ palette = 'a' }) {
  const members = [
    {n:'DJ Wes', i:'DW', s:'Active'},
    {n:'John Adeyemi', i:'JA', s:'Active'},
    {n:'Mary Okafor', i:'MO', s:'Care · resolved', tone:'ok'},
    {n:'Emeka Ibe', i:'EI', s:'Care · active', tone:'care'},
    {n:'Tobi A.', i:'TA', s:'Active'},
    {n:'Ada N.', i:'AN', s:'Active'},
    {n:'Sade K.', i:'SK', s:'Active'},
    {n:'Femi O.', i:'FO', s:'Active'},
    {n:'Ngozi Eze', i:'NE', s:'Care · urgent', tone:'urgent'},
    {n:'Ruth E.', i:'RE', s:'Active'},
    {n:'Joy B.', i:'JB', s:'Active'},
    {n:'Grace U.', i:'GU', s:'Active'},
  ];
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · Companies`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Directory · 1 of 7"
          title='Company Alpha.'
          sub="Your company. Members, care state, leadership."
        />

        {/* Company hero card */}
        <div style={{padding:'18px 20px 0'}}>
          <div style={{background:'var(--primary)',color:'var(--primary-ink)',borderRadius:'var(--r-card)',padding:'20px 22px',position:'relative',overflow:'hidden',boxShadow:'var(--shadow-lift)'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.18em',color:'var(--primary-soft)',textTransform:'uppercase',fontWeight:600,marginBottom:6}}>Company overview</div>
            <div style={{fontFamily:'var(--serif)',fontSize:14,color:'var(--primary-soft)',fontStyle:'italic',marginBottom:14,lineHeight:1.5}}>Quiet, steady, growing. Two new welcome-group members this month.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.16)'}}>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:500,color:'var(--primary-ink)',letterSpacing:'-0.012em',lineHeight:1}}>14</div>
                <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--primary-soft)',marginTop:6,letterSpacing:0,opacity:0.85}}>Members</div>
              </div>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:500,color:'var(--primary-ink)',letterSpacing:'-0.012em',lineHeight:1}}>88<span style={{fontSize:14,color:'var(--primary-soft)'}}>%</span></div>
                <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--primary-soft)',marginTop:6,opacity:0.85}}>Avg. attend.</div>
              </div>
              <div>
                <div style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:500,color:'var(--primary-ink)',letterSpacing:'-0.012em',lineHeight:1}}>3</div>
                <div style={{fontFamily:'var(--sans)',fontSize:11,color:'var(--primary-soft)',marginTop:6,opacity:0.85}}>Care cases</div>
              </div>
            </div>
          </div>
        </div>

        <V2Sect label="Leadership"/>
        <div className="v2-card">
          <div className="v2-prow">
            <V2Avatar initials="BA"/>
            <div className="v2-prow__body">
              <div className="v2-prow__head">
                <div className="v2-prow__name">Bola Adeyemi</div>
                <V2Pill tone="quiet">Leader · you</V2Pill>
              </div>
              <div className="v2-prow__sub">Company Leader</div>
            </div>
          </div>
          <div className="v2-prow">
            <V2Avatar initials="DK"/>
            <div className="v2-prow__body">
              <div className="v2-prow__head">
                <div className="v2-prow__name">Daniel Kwesi</div>
                <V2Pill tone="quiet">Assistant</V2Pill>
              </div>
              <div className="v2-prow__sub">Assistant Leader</div>
            </div>
          </div>
        </div>

        <V2Sect label="Members" action="12 active"/>
        <div className="v2-card">
          {members.map((m,i,arr)=>(
            <div key={m.n} style={{display:'flex',gap:14,alignItems:'center',padding:'11px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <V2Avatar initials={m.i} ring={m.tone}/>
              <div style={{flex:1,minWidth:0}}>
                <div className="v2-prow__name" style={{fontSize:14}}>{m.n}</div>
                <div className="v2-prow__sub" style={{marginTop:1, color: m.tone==='urgent'?'var(--status-urgent)':m.tone==='care'?'var(--status-care)':'var(--ink-3)'}}>{m.s}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{padding:'18px 20px 0'}}>
          <div style={{background:'var(--surface-2)',borderRadius:'var(--r-card)',padding:'14px 16px',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:13,color:'var(--ink-2)',lineHeight:1.5,textAlign:'center'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.14em',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:4,fontWeight:600,fontStyle:'normal'}}>Read-only</div>
            Adding or removing members is performed by the church admin.
          </div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="more"/>
    </div>
  );
}

function V2More({ palette = 'a' }) {
  return (
    <div className={`v2 pal-${palette}`} data-screen-label={`${palette.toUpperCase()} · More`}>
      <V2Head/>
      <div className="v2-scroll">
        <V2Greeting
          eyebrow="Index"
          title='Everything else.'
          sub="The rest of the app, settings, and what's coming."
        />

        <V2Sect label="Available"/>
        <div className="v2-card" style={{padding:'4px 20px'}}>
          {[
            {n:'Announcements', s:'4 active · 1 urgent'},
            {n:'Events', s:'4 upcoming this month'},
            {n:'Companies', s:'Your directory — Company Alpha'},
            {n:'Care archive', s:'2 cases resolved this month'},
            {n:'Reports archive', s:'Last 12 weeks · read-only'},
          ].map((it,i,arr)=>(
            <div key={it.n} style={{display:'flex',gap:16,alignItems:'center',padding:'15px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--ink-4)',width:22}}>0{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--serif)',fontSize:17,fontWeight:500,color:'var(--ink)',letterSpacing:'-0.005em'}}>{it.n}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--ink-3)',marginTop:2}}>{it.s}</div>
              </div>
              <div style={{color:'var(--ink-3)'}}>{V2Icons.arrow}</div>
            </div>
          ))}
        </div>

        <V2Sect label="Coming soon" action="Not yet available"/>
        <div className="v2-card" style={{background:'var(--surface-2)',padding:'4px 20px'}}>
          {[
            {n:'Giving records', s:'Quarterly stewardship view'},
            {n:'Discipleship paths', s:'Personal growth tracking'},
            {n:'Cross-company directory', s:'Search across all companies'},
          ].map((it,i,arr)=>(
            <div key={it.n} style={{display:'flex',gap:16,alignItems:'center',padding:'15px 0',boxShadow: i>0 ? 'inset 0 1px 0 rgba(0,0,0,0.05)':'none',opacity:0.75}}>
              <div style={{fontFamily:'var(--mono)',fontSize:11,fontWeight:600,letterSpacing:'0.04em',color:'var(--ink-4)',width:22}}>0{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--serif)',fontSize:17,fontWeight:500,color:'var(--ink-2)',letterSpacing:'-0.005em'}}>{it.n}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--ink-3)',marginTop:2}}>{it.s}</div>
              </div>
              <V2Pill tone="quiet">Soon</V2Pill>
            </div>
          ))}
        </div>

        <V2Sect label="Settings"/>
        <div className="v2-card" style={{padding:'4px 20px'}}>
          {[
            {n:'Notifications', s:'Care alerts, report reminders'},
            {n:'Display & language', s:'English (UK) · Warm Berry theme'},
            {n:'Account & access', s:'Bola Adeyemi · Company Leader'},
            {n:'About SaltCity', s:'v1.4.0 — Briefing System'},
          ].map((it,i,arr)=>(
            <div key={it.n} style={{display:'flex',gap:16,alignItems:'center',padding:'15px 0',boxShadow: i>0 ? 'inset 0 1px 0 var(--rule)':'none'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--sans)',fontSize:14.5,fontWeight:500,color:'var(--ink)'}}>{it.n}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:12,color:'var(--ink-3)',marginTop:2}}>{it.s}</div>
              </div>
              <div style={{color:'var(--ink-3)'}}>{V2Icons.arrow}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'20px 20px 0'}}>
          <button className="v2-btn v2-btn--soft v2-btn--full v2-btn--lg" style={{color:'var(--status-urgent)'}}>Sign out</button>
        </div>

        <div style={{padding:'22px 20px 0',textAlign:'center'}}>
          <img src="assets/logo.svg" alt="SaltCity" style={{height:16,opacity:0.5}}/>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:13,color:'var(--ink-3)',marginTop:10}}>Walk gently. Lead faithfully.</div>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'0.18em',color:'var(--ink-4)',textTransform:'uppercase',marginTop:8,fontWeight:600}}>Leadership Briefing System</div>
        </div>

        <div style={{height:30}}/>
      </div>
      <V2Nav active="more"/>
    </div>
  );
}

Object.assign(window, { V2ReportReviewed, V2AdminReports, V2Announcements, V2Events, V2Companies, V2More });
