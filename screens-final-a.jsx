// SaltCity FINAL — screens 1–6

function Login() {
  return (
    <div className="sc" data-screen-label="Login">
      <div className="sc-login">
        <div className="sc-login__mark"><img src="assets/logo-white.svg" alt="SaltCity"/></div>
        <h1 className="sc-login__title">Welcome <em>back.</em></h1>
        <div className="sc-login__sub">Sign in to lead your company.</div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="sc-field">
            <label className="sc-field__label">Email</label>
            <input className="sc-input" defaultValue="bola@saltcity.church"/>
          </div>
          <div className="sc-field">
            <label className="sc-field__label">Password</label>
            <input className="sc-input" type="password" defaultValue="abcdefghij"/>
          </div>
          <button className="sc-btn sc-btn--berry sc-btn--full sc-btn--lg" style={{marginTop:14}}>Sign in</button>
          <button style={{background:'transparent',border:0,color:'var(--ink-3)',fontSize:13,fontWeight:500,cursor:'pointer',marginTop:2}}>Forgot password</button>
        </div>
        <div style={{marginTop:'auto',paddingBottom:34,textAlign:'center'}}>
          <div style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:14,color:'var(--ink-2)'}}>"Walk gently. Lead faithfully."</div>
          <div style={{marginTop:8,fontSize:11.5,color:'var(--ink-3)'}}>SaltCity Leadership · v1.4</div>
        </div>
      </div>
    </div>
  );
}

function LeaderDash() {
  return (
    <div className="sc" data-screen-label="Leader Dashboard">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet day="Friday, May 30">Hi, <em>Bola.</em></Greet>

        <div className="sc-hero">
          <div className="sc-hero__flare"/>
          <div className="sc-hero__in">
            <div className="sc-hero__label">This week's report</div>
            <div className="sc-hero__title">Week 22 — <em>not started.</em></div>
            <div className="sc-hero__meta"><b>Closes Sunday 18:00</b> · takes 2 minutes</div>
            <div className="sc-hero__action">
              <button className="sc-btn sc-btn--light">Start report</button>
            </div>
          </div>
        </div>

        <Sect label="Assigned to you" action="See all"/>
        <div className="sc-list">
          <Row
            lead={<Av initials="NE" ring="urgent"/>}
            title="Ngozi Eze"
            sub={<Dot tone="urgent">Urgent · 3 weeks absent</Dot>}
            tail={SI.chev}
          />
          <Row
            lead={<Av initials="EI" ring="care"/>}
            title="Emeka Ibe"
            sub="Missed Sunday · call after service"
            tail={SI.chev}
          />
        </div>

        <Sect label="Up next"/>
        <div className="sc-list">
          <div className="sc-evt">
            <div className="sc-evt__date berry"><div className="m">Jun</div><div className="d">01</div></div>
            <div className="sc-row__body">
              <div className="sc-evt__t">Sunday Service · Stewardship</div>
              <div className="sc-evt__m">09:00 · briefing in Hall B at 08:45</div>
            </div>
            <div className="sc-row__tail">{SI.chev}</div>
          </div>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="home"/>
    </div>
  );
}

function AdminDash() {
  return (
    <div className="sc" data-screen-label="Admin Dashboard">
      <Head role="Church Admin" name="Pastor Salt"/>
      <div className="sc-scroll">
        <Greet day="Friday, May 30">Hi, <em>Pastor.</em></Greet>

        <div className="sc-hero">
          <div className="sc-hero__flare"/>
          <div className="sc-hero__in">
            <div className="sc-hero__label">Week 22 reports</div>
            <div className="sc-hero__title">5 of 7 <em>are in.</em></div>
            <div className="sc-hero__meta"><b>Tunde and Chika</b> still to submit</div>
            <div className="sc-hero__progress"><i style={{width:'71%'}}/></div>
            <div className="sc-hero__action">
              <button className="sc-btn sc-btn--light">Review queue</button>
              <button className="sc-btn sc-btn--onhero">Nudge</button>
            </div>
          </div>
        </div>

        <Sect label="Needs attention" action="See all"/>
        <div className="sc-list">
          <Row
            lead={<Av initials="GA" ring="care"/>}
            title="Company Gamma · Funke"
            sub={<Dot tone="care">Flagged · low attendance</Dot>}
            tail={<button className="sc-btn sc-btn--ghost sc-btn--sm">Review</button>}
          />
          <Row
            lead={<Av initials="ZE"/>}
            title="Company Zeta · Tunde"
            sub={<Dot tone="urgent">Missing · 2 days late</Dot>}
            tail={<button className="sc-btn sc-btn--ghost sc-btn--sm">Nudge</button>}
          />
        </div>

        <Sect label="Urgent care"/>
        <div className="sc-notice sc-notice--urgent">
          <div className="sc-notice__ic">{SI.warn}</div>
          <div className="sc-notice__b">
            <div className="sc-notice__t">Ngozi Eze · 3 weeks absent</div>
            <div className="sc-notice__m">Company Delta · assigned to Daniel</div>
          </div>
          <button className="sc-btn sc-btn--sm" style={{background:'rgba(255,255,255,0.18)',color:'#fff'}}>Open</button>
        </div>

        <Sect label="Latest notice"/>
        <div className="sc-card">
          <div style={{fontSize:11.5,color:'var(--ink-3)',marginBottom:5}}>May 22 · all leaders</div>
          <div style={{fontSize:16,fontWeight:600,color:'var(--ink)',letterSpacing:'-0.016em',lineHeight:1.25,marginBottom:5}}>Side entrance only this Sunday</div>
          <div style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.5}}>Main vestibule is under repair. Brief members at company close.</div>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="home"/>
    </div>
  );
}

function Report() {
  // 18 members — demonstrates 15-30 scale
  const members = ['DJ Wes','John Adeyemi','Tobi Ade','Ada Nwo','Sade Kor','Femi Olu','Bisi Ige','Ruth Eze','Daniel Ama','Grace Udo','Ebuka Mba','Joy Ben','Mary Okafor','Emeka Ibe','Paul Eke','Rita Obi','Sam Udo','Lara Fay'];
  const absent = ['Mary Okafor','Emeka Ibe'];
  return (
    <div className="sc" data-screen-label="Report Flow">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet day="Week 22 · May 25 — 31">Mark <em>absentees.</em></Greet>

        <div style={{padding:'12px 20px 0',display:'flex',gap:26}}>
          <div className="sc-count"><div className="v">16 <small>/18</small></div><div className="l">Present</div></div>
          <div className="sc-count"><div className="v" style={{color:'var(--urgent)'}}>2</div><div className="l">Absent</div></div>
          <div className="sc-count"><div className="v">2</div><div className="l">Visitors</div></div>
        </div>

        <Sect label="Tap anyone who was away"/>
        <div className="sc-search">
          {SI.search}<input placeholder="Search members"/>
        </div>
        <div className="sc-members" style={{marginTop:10}}>
          {members.map(n=>{
            const isAbsent = absent.includes(n);
            const initials = n.split(' ').map(s=>s[0]).slice(0,2).join('');
            return (
              <div key={n} className={`sc-mem ${isAbsent?'is-absent':''}`}>
                <span className="sc-mem__i">{initials}</span>
                <span className="sc-mem__n">{n}</span>
              </div>
            );
          })}
        </div>

        <Sect label="Visitors"/>
        <div className="sc-stepper">
          <button>−</button>
          <div className="val">2</div>
          <button>+</button>
        </div>

        <Sect label="Anything to share?"/>
        <div style={{padding:'0 20px'}}>
          <textarea className="sc-ta" placeholder="A short note for the office — testimony, need, or word for the week."/>
        </div>

        <div style={{padding:'18px 20px 0',display:'flex',gap:10}}>
          <button className="sc-btn sc-btn--ghost sc-btn--lg" style={{flex:1}}>Save</button>
          <button className="sc-btn sc-btn--berry sc-btn--lg" style={{flex:1.5}}>{SI.send}Submit report</button>
        </div>
        <div style={{padding:'11px 20px 0',textAlign:'center',fontSize:11.5,color:'var(--ink-3)'}}>Auto-saved just now</div>

        <div className="sc-tail"/>
      </div>
      <Nav active="report"/>
    </div>
  );
}

function FollowLeader() {
  return (
    <div className="sc" data-screen-label="Follow-up · Leader">
      <Head role="Company Leader" name="Bola"/>
      <div className="sc-scroll">
        <Greet day="2 assigned">Assigned to <em>you.</em></Greet>

        <div style={{padding:'16px 20px 0'}}>
          <div style={{background:'var(--surface)',borderRadius:'var(--r-card)',padding:'18px',boxShadow:'var(--shadow-lift)'}}>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:14}}>
              <Av initials="NE" size="lg" ring="urgent"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:18,fontWeight:600,color:'var(--ink)',letterSpacing:'-0.018em'}}>Ngozi Eze</div>
                <div style={{marginTop:2}}><Dot tone="urgent">3 weeks absent · family crisis</Dot></div>
              </div>
            </div>
            <div style={{padding:'12px 14px',background:'var(--bg-2)',borderRadius:12,fontSize:13,color:'var(--ink-2)',lineHeight:1.5,marginBottom:14}}>
              Last contact May 4. A family member reported a bereavement. Try a gentle message first.
            </div>
            <div style={{fontSize:13,fontWeight:500,color:'var(--ink-2)',marginBottom:8}}>Record contact</div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <button className="sc-btn sc-btn--ghost sc-btn--sm" style={{flex:1}}>{SI.phone}Called</button>
              <button className="sc-btn sc-btn--ghost sc-btn--sm" style={{flex:1}}>{SI.send}Messaged</button>
              <button className="sc-btn sc-btn--ghost sc-btn--sm" style={{flex:1}}>{SI.heart}Visited</button>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="sc-btn sc-btn--ghost sc-btn--lg" style={{flex:1}}>Hand to pastor</button>
              <button className="sc-btn sc-btn--berry sc-btn--lg" style={{flex:1.2}}>Save update</button>
            </div>
          </div>
        </div>

        <Sect label="Also assigned"/>
        <div className="sc-list">
          <Row
            lead={<Av initials="EI" ring="care"/>}
            title="Emeka Ibe"
            sub="Missed Sunday · work travel"
            tail={SI.chev}
          />
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="care"/>
    </div>
  );
}

function FollowAdmin() {
  return (
    <div className="sc" data-screen-label="Follow-up · Admin">
      <Head role="Church Admin" name="Pastor Salt"/>
      <div className="sc-scroll">
        <Greet day="3 new · 4 active">Care <em>queue.</em></Greet>

        <Sect label="New from this week" action="3"/>
        <div className="sc-list">
          {[
            {n:'Mary Okafor', i:'MO', co:'Alpha · Bola'},
            {n:'Kemi Ade', i:'KA', co:'Beta · Dami'},
            {n:'Paul Eke', i:'PE', co:'Alpha · Bola'},
          ].map(m=>(
            <Row key={m.n}
              lead={<Av initials={m.i}/>}
              title={m.n}
              sub={m.co}
              tail={<button className="sc-btn sc-btn--berry sc-btn--sm">Assign</button>}
            />
          ))}
        </div>

        <Sect label="Active" action="4"/>
        <div className="sc-list">
          {[
            {n:'Ngozi Eze', i:'NE', sub:'Daniel · 3 weeks · no contact', ring:'urgent'},
            {n:'Emeka Ibe', i:'EI', sub:'Bola · contacted Monday', ring:'care'},
            {n:'Tobi Ade', i:'TA', sub:'Daniel · checking in Sunday', ring:'care'},
            {n:'Sade Kor', i:'SK', sub:'Bola · awaiting confirmation', ring:'care'},
          ].map(m=>(
            <Row key={m.n}
              lead={<Av initials={m.i} ring={m.ring}/>}
              title={m.n}
              sub={m.sub}
              tail={SI.chev}
            />
          ))}
        </div>

        <Sect label="Resolved this month" action="View"/>
        <div style={{padding:'2px 20px 0',display:'flex',gap:8,alignItems:'center',color:'var(--ink-3)',fontSize:13}}>
          <Av initials="MO" size="sm" ring="ok"/>
          <Av initials="IJ" size="sm" ring="ok"/>
          <span style={{flex:1}}>Mary and Ify are both back at service.</span>
        </div>

        <div className="sc-tail"/>
      </div>
      <Nav active="care"/>
    </div>
  );
}

Object.assign(window, { Login, LeaderDash, AdminDash, Report, FollowLeader, FollowAdmin });
