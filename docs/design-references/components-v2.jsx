// SaltCity v2 — Components shared across the 3 palettes

const V2Icons = {
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  more: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>,
  doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  quote: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

function V2Head({ role = 'Company Leader', name = 'Bola A.' }) {
  return (
    <header className="v2-head">
      <div className="v2-head__mark"><img src="assets/logo-white.svg" alt="SaltCity"/></div>
      <div className="v2-head__id">
        <div className="v2-head__title">SaltCity Central</div>
        <div className="v2-head__role"><b>{role}</b><span> · {name}</span></div>
      </div>
      <div className="v2-head__actions">
        <button className="v2-iconbtn" aria-label="Alerts">{V2Icons.bell}</button>
        <button className="v2-iconbtn" aria-label="More">{V2Icons.more}</button>
      </div>
    </header>
  );
}

function V2Nav({ active = 'home', variant = 'leader' }) {
  const items = [
    { id:'home',   label:'Home',    icon:V2Icons.home },
    { id:'report', label:'Report',  icon:V2Icons.doc },
    { id:'care',   label:'Care',    icon:V2Icons.heart },
    { id:'tasks',  label:'Tasks',   icon:V2Icons.check },
    { id:'more',   label:'More',    icon:V2Icons.more },
  ];
  return (
    <nav className="v2-nav">
      <div className="v2-nav__rail">
        {items.map(it => (
          <button key={it.id} className={`v2-nav__item ${active===it.id ? 'is-active':''}`}>
            {it.icon}<span>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function V2Sect({ label, action, onAction }) {
  return (
    <div className="v2-sect">
      <div className="v2-sect__t">{label}</div>
      {action ? <button className="v2-sect__a" onClick={onAction}>{action}</button> : null}
    </div>
  );
}

function V2Pill({ tone='care', children }) {
  return <span className={`v2-pill v2-pill--${tone}`}><span className="pd"/>{children}</span>;
}

function V2Word({ palette, eyebrow='For the week', body, cite }) {
  return (
    <div className="v2-word">
      <div className="v2-word__glyph">"</div>
      <div className="v2-word__eyebrow">{V2Icons.quote}<span>{eyebrow}</span></div>
      <div className="v2-word__body">{body}</div>
      <div className="v2-word__cite">{cite}</div>
    </div>
  );
}

function V2Avatar({ initials, ring }) {
  const ringClass = ring ? `v2-prow__avatar--ring-${ring}` : '';
  return <div className={`v2-prow__avatar ${ringClass}`}>{initials}</div>;
}

function V2Greeting({ eyebrow, title, sub }) {
  return (
    <div className="v2-greet">
      {eyebrow ? <div className="v2-greet__eyebrow">{eyebrow}</div> : null}
      <h1 className="v2-greet__title" dangerouslySetInnerHTML={{__html: title}}/>
      {sub ? <div className="v2-greet__sub">{sub}</div> : null}
    </div>
  );
}

function V2PaletteSwatch({ palette }) {
  const palettes = {
    a: { name:'A · Warm Pastoral', swatches:['#6E2A40','#B5703F','#6D7A4A','#F1E9D9'] },
    b: { name:'B · Clean Modern Church', swatches:['#0E4C5B','#D8806E','#7B8AB2','#FAF7F1'] },
    c: { name:'C · Editorial Alive', swatches:['#6E1F2C','#4F6334','#B27933','#F1ECDF'] },
  };
  const p = palettes[palette];
  return (
    <div className="pal-label">
      <span>{p.name}</span>
      <span className="swatch">{p.swatches.map((c,i)=>(<i key={i} style={{background:c}}/>))}</span>
    </div>
  );
}

Object.assign(window, { V2Icons, V2Head, V2Nav, V2Sect, V2Pill, V2Word, V2Avatar, V2Greeting, V2PaletteSwatch });
