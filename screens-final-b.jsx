// SaltCity FINAL — screens 7–11

function Tasks() {
  return (
    <div className="sc" data-screen-label="Tasks">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet day="5 open · 2 done">Your <em>checklist.</em></Greet>

        <Sect label="Overdue"/>
        <div className="sc-list">
          <div className="sc-row">
            <div className="sc-check"/>
            <div className="sc-row__body">
              <div className="sc-row__title">Submit Week 21 report</div>
              <div className="sc-row__sub"><Dot tone="urgent">Was due Friday</Dot></div>
            </div>
          </div>
        </div>

        <Sect label="This week"/>
        <div className="sc-list">
          {[
            {t:'Call Emeka about transport', d:'Today'},
            {t:'Confirm Sunday roster with Daniel', d:'Today'},
            {t:'Brief new members on welcome group', d:'Saturday'},
            {t:'Prepare Sunday attendance notes', d:'Saturday'},
          ].map((x,i)=>(
            <div key={i} className="sc-row">
              <div className="sc-check"/>
              <div className="sc-row__body">
                <div className="sc-row__title">{x.t}</div>
                <div className="sc-row__sub">{x.d}</div>
              </div>
            </div>
          ))}
        </div>

        <Sect label="Done" action="Hide"/>
        <div className="sc-list">
          {[
            {t:'Acknowledge board notice'},
            {t:"Close Mary's follow-up"},
          ].map((x,i)=>(
            <div key={i} className="sc-row" style={{opacity:0.5}}>
              <div className="sc-check is-done"/>
              <div className="sc-row__body">
                <div className="sc-row__title" style={{textDecoration:'line-through',color:'var(--ink-3)'}}>{x.t}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{padding:'18px 20px 0'}}>
          <button className="sc-btn sc-btn--ghost sc-btn--full sc-btn--lg">{SI.plus}Add a task</button>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="tasks"/>
    </div>
  );
}

function Announcements() {
  return (
    <div className="sc" data-screen-label="Announcements">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet>Notices.</Greet>

        <div style={{marginTop:8}}/>
        <div className="sc-notice sc-notice--urgent" style={{marginTop:8}}>
          <div className="sc-notice__ic">{SI.warn}</div>
          <div className="sc-notice__b">
            <div className="sc-notice__t">Side entrance only this Sunday</div>
            <div className="sc-notice__m">Main vestibule under repair · brief your members</div>
          </div>
        </div>

        <Sect label="This week"/>
        <div className="sc-list">
          {[
            {t:'Board meeting moved to October 24', m:'May 19 · company leaders'},
            {t:'Stewardship Sunday — June 1', m:'May 17 · all members'},
          ].map((n,i)=>(
            <div key={i} className="sc-row" style={{alignItems:'flex-start'}}>
              <div className="sc-row__body">
                <div style={{fontSize:15.5,fontWeight:600,color:'var(--ink)',letterSpacing:'-0.014em',lineHeight:1.3}}>{n.t}</div>
                <div className="sc-row__sub" style={{marginTop:4}}>{n.m}</div>
              </div>
              <div className="sc-row__tail">{SI.chev}</div>
            </div>
          ))}
        </div>

        <Sect label="Earlier" action="Archive"/>
        <div className="sc-list">
          {[
            {t:'Report auto-save now on', m:'May 10'},
            {t:'Spring fast concluded', m:'Apr 15'},
          ].map((n,i)=>(
            <div key={i} className="sc-row" style={{opacity:0.7}}>
              <div className="sc-row__body">
                <div className="sc-row__title">{n.t}</div>
                <div className="sc-row__sub">{n.m}</div>
              </div>
              <div className="sc-row__tail">{SI.chev}</div>
            </div>
          ))}
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="more"/>
    </div>
  );
}

function Events() {
  return (
    <div className="sc" data-screen-label="Events">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet>Calendar.</Greet>

        <Sect label="Every week"/>
        <div className="sc-list">
          {[
            {d:'Sun', t:'Main Service', m:'09:00 · Auditorium'},
            {d:'Tue', t:'Bible Study', m:'18:30 · Hall B'},
            {d:'Fri', t:'Prayer Watch', m:'19:00 · Chapel'},
          ].map((s,i)=>(
            <div key={i} className="sc-row">
              <div style={{flex:'0 0 40px',fontSize:13,fontWeight:600,color:'var(--primary)',letterSpacing:'-0.01em'}}>{s.d}</div>
              <div className="sc-row__body">
                <div className="sc-row__title">{s.t}</div>
                <div className="sc-row__sub">{s.m}</div>
              </div>
            </div>
          ))}
        </div>

        <Sect label="Coming up"/>
        <div className="sc-list">
          {[
            {m:'Jun',d:'01',berry:true,t:'Stewardship Sunday',meta:'09:00 · briefing 08:45'},
            {m:'Jun',d:'04',t:'Mid-week huddle',meta:'19:30 · online'},
            {m:'Jun',d:'08',t:'Guest minister',meta:'09:00 · welcome team 08:00'},
            {m:'Jun',d:'13',t:'Leadership retreat',meta:'08:00 · Salt Centre'},
          ].map((e,i)=>(
            <div key={i} className="sc-evt">
              <div className={`sc-evt__date ${e.berry?'berry':''}`}><div className="m">{e.m}</div><div className="d">{e.d}</div></div>
              <div className="sc-row__body">
                <div className="sc-evt__t">{e.t}</div>
                <div className="sc-evt__m">{e.meta}</div>
              </div>
              <div className="sc-row__tail">{SI.chev}</div>
            </div>
          ))}
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="more"/>
    </div>
  );
}

function Companies() {
  const members = [
    {n:'DJ Wes', i:'DW'},{n:'John Adeyemi', i:'JA'},
    {n:'Mary Okafor', i:'MO', ring:'ok'},{n:'Emeka Ibe', i:'EI', ring:'care'},
    {n:'Tobi Ade', i:'TA'},{n:'Ada Nwo', i:'AN'},
    {n:'Sade Kor', i:'SK'},{n:'Femi Olu', i:'FO'},
    {n:'Ngozi Eze', i:'NE', ring:'urgent'},{n:'Ruth Eze', i:'RE'},
    {n:'Joy Ben', i:'JB'},{n:'Grace Udo', i:'GU'},
  ];
  return (
    <div className="sc" data-screen-label="Companies">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet day="Company Alpha">Your <em>company.</em></Greet>

        <div className="sc-hero" style={{marginTop:14}}>
          <div className="sc-hero__flare"/>
          <div className="sc-hero__in">
            <div style={{display:'flex',gap:20}}>
              <div><div style={{fontSize:24,fontWeight:600,color:'var(--primary-ink)',letterSpacing:'-0.02em'}}>14</div><div style={{fontSize:11.5,color:'var(--primary-soft)',marginTop:3}}>Members</div></div>
              <div><div style={{fontSize:24,fontWeight:600,color:'var(--primary-ink)',letterSpacing:'-0.02em'}}>88<span style={{fontSize:14,color:'var(--primary-soft)'}}>%</span></div><div style={{fontSize:11.5,color:'var(--primary-soft)',marginTop:3}}>Attendance</div></div>
              <div><div style={{fontSize:24,fontWeight:600,color:'var(--primary-ink)',letterSpacing:'-0.02em'}}>3</div><div style={{fontSize:11.5,color:'var(--primary-soft)',marginTop:3}}>In care</div></div>
            </div>
          </div>
        </div>

        <Sect label="Leadership"/>
        <div className="sc-list">
          <Row lead={<Av initials="BA"/>} title="Bola Adeyemi" sub="Company Leader · you"/>
          <Row lead={<Av initials="DK"/>} title="Daniel Kwesi" sub="Assistant Leader"/>
        </div>

        <Sect label="Members" action="12"/>
        <div className="sc-list">
          {members.map(m=>(
            <Row key={m.n}
              lead={<Av initials={m.i} size="sm" ring={m.ring}/>}
              title={m.n}
              sub={m.ring==='urgent'?<Dot tone="urgent">In care · urgent</Dot>:m.ring==='care'?<Dot tone="care">In care</Dot>:m.ring==='ok'?<Dot tone="ok">Recovered</Dot>:'Active'}
            />
          ))}
        </div>

        <div style={{padding:'16px 20px 0'}}>
          <div style={{fontSize:12.5,color:'var(--ink-3)',textAlign:'center',fontFamily:'var(--serif)',fontStyle:'italic'}}>Members are added by the church office.</div>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="more"/>
    </div>
  );
}

function More() {
  const sections = [
    {label:'Sections', items:[
      {n:'Announcements', icon:SI.mega},
      {n:'Events', icon:SI.cal},
      {n:'Companies', icon:SI.users},
    ]},
    {label:'Account', items:[
      {n:'Notifications', icon:SI.bell},
      {n:'Display & language', icon:SI.more},
    ]},
  ];
  return (
    <div className="sc" data-screen-label="More">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet>More.</Greet>

        {sections.map(s=>(
          <React.Fragment key={s.label}>
            <Sect label={s.label}/>
            <div className="sc-list">
              {s.items.map(it=>(
                <Row key={it.n}
                  lead={<div className="sc-notice__ic" style={{borderRadius:10}}>{it.icon}</div>}
                  title={it.n}
                  tail={SI.chev}
                />
              ))}
            </div>
          </React.Fragment>
        ))}

        <Sect label="Coming soon"/>
        <div className="sc-list">
          {['Giving records','Discipleship paths'].map(n=>(
            <div key={n} className="sc-row" style={{opacity:0.5}}>
              <div className="sc-notice__ic" style={{borderRadius:10}}>{SI.plus}</div>
              <div className="sc-row__body"><div className="sc-row__title">{n}</div></div>
              <div className="sc-row__tail" style={{fontSize:11.5,color:'var(--ink-3)'}}>Soon</div>
            </div>
          ))}
        </div>

        <div style={{padding:'20px 20px 0'}}>
          <button className="sc-btn sc-btn--ghost sc-btn--full sc-btn--lg" style={{color:'var(--urgent)'}}>{SI.logout}Sign out</button>
        </div>
        <div style={{padding:'18px 20px 0',textAlign:'center'}}>
          <img src="assets/logo.svg" alt="SaltCity" style={{height:15,opacity:0.45}}/>
          <div style={{marginTop:8,fontSize:11.5,color:'var(--ink-3)'}}>SaltCity Leadership · v1.4</div>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="more"/>
    </div>
  );
}

Object.assign(window, { Tasks, Announcements, Events, Companies, More });
