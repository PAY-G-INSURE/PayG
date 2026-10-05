import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

const palette = `
  :root { --green-950:#0A1F12; --green-900:#102A18; --green-800:#173A23; --green-600:#27833D; --green-400:#75CC86; --ink:#F0F6F1; --muted:#B6C7B9; --line:#2D4D35; }
  *,*::before,*::after { box-sizing:border-box; }
  body { margin:0; background:var(--green-950); color:var(--ink); font-family:Inter,Arial,sans-serif; line-height:1.55; }
`
const enter = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{duration:.45}} }
const button = { background:'var(--green-600)', color:'#fff', border:0, borderRadius:10, padding:'13px 20px', fontSize:14, fontWeight:700, cursor:'pointer' }
const card = { background:'var(--green-900)', border:'1px solid var(--line)', borderRadius:16 }

export default function Landing() {
  const navigate = useNavigate()
  return <div style={{minHeight:'100vh',background:'var(--green-950)',color:'var(--ink)'}}>
    <style>{palette}</style>
    <header style={{position:'sticky',top:0,zIndex:5,background:'rgba(10,31,18,.96)',borderBottom:'1px solid var(--line)'}}>
      <div style={{maxWidth:1160,margin:'auto',padding:'0 24px',height:70,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}><img src={logo} alt="" style={{width:30,height:30,objectFit:'contain'}}/><strong style={{fontSize:19,letterSpacing:'.04em'}}>PAYG <span style={{color:'var(--green-400)'}}>HEALTH</span></strong></div>
        <div style={{display:'flex',alignItems:'center',gap:18}}><button onClick={()=>navigate('/auth')} style={{background:'none',border:0,color:'var(--muted)',fontWeight:600,cursor:'pointer'}}>Sign in</button><button onClick={()=>navigate('/auth')} style={button}>Get started</button></div>
      </div>
    </header>
    <main>
      <section style={{padding:'clamp(64px,10vw,112px) 24px 80px'}}>
        <div style={{maxWidth:1120,margin:'auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,380px),1fr))',gap:64,alignItems:'center'}}>
          <motion.div initial="hidden" animate="show" variants={enter}>
            <p style={{color:'var(--green-400)',fontSize:12,fontWeight:700,letterSpacing:1.4,margin:'0 0 18px'}}>HEALTH COVER, MADE CLEAR</p>
            <h1 style={{fontSize:'clamp(42px,6vw,68px)',lineHeight:1.04,letterSpacing:'-.045em',margin:'0 0 22px',fontWeight:750}}>Health cover<br/><span style={{color:'var(--green-400)'}}>with clear choices.</span></h1>
            <p style={{color:'var(--muted)',fontSize:18,maxWidth:480,margin:'0 0 26px'}}>Explore health plans, review the details, and manage your account in one place.</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:30}}>{['Plan details','Wallet','Account support'].map(x=><span key={x} style={{border:'1px solid var(--line)',background:'var(--green-900)',borderRadius:999,padding:'7px 13px',fontSize:13,color:'var(--muted)'}}>{x}</span>)}</div>
            <button onClick={()=>navigate('/auth')} style={button}>Explore health plans <span aria-hidden="true">→</span></button>
          </motion.div>
          <div style={{...card,padding:'clamp(24px,5vw,40px)',minHeight:330,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <p style={{color:'var(--green-400)',fontSize:12,fontWeight:700,letterSpacing:1.3,textTransform:'uppercase',margin:'0 0 10px'}}>Your cover, organized</p><h2 style={{fontSize:28,lineHeight:1.2,margin:'0 0 22px',letterSpacing:'-.02em'}}>Everything important, in one place.</h2>
            {['Review plan information','Track wallet activity','Manage your account'].map((x,i)=><div key={x} style={{display:'flex',alignItems:'center',gap:14,borderTop:'1px solid var(--line)',padding:'15px 0'}}><span style={{width:34,height:34,display:'grid',placeItems:'center',borderRadius:9,background:'var(--green-800)',color:'var(--green-400)',fontWeight:700}}>0{i+1}</span><span style={{color:'var(--muted)'}}>{x}</span></div>)}
          </div>
        </div>
      </section>
      <section style={{padding:'76px 24px',background:'var(--green-900)',borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}}>
        <div style={{maxWidth:1000,margin:'auto'}}><div style={{textAlign:'center',marginBottom:36}}><h2 style={{fontSize:'clamp(28px,4vw,40px)',letterSpacing:'-.03em',margin:'0 0 8px'}}>How it works</h2><p style={{color:'var(--muted)',margin:0}}>A straightforward path to understanding and managing your cover.</p></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16}}>{[
            ['01','Review health plans','Compare the plan information and contribution amounts shown on the site.'],['02','Fund your wallet','Use the available online payment option and review your wallet activity.'],['03','Manage your account','View your account details and use the available support and claims tools.']
          ].map(([n,title,desc])=><article key={n} style={{...card,padding:24}}><span style={{color:'var(--green-400)',fontSize:13,fontWeight:700}}>{n}</span><h3 style={{fontSize:17,margin:'12px 0 7px'}}>{title}</h3><p style={{color:'var(--muted)',fontSize:14,lineHeight:1.65,margin:0}}>{desc}</p></article>)}</div>
        </div>
      </section>
      <section style={{padding:'82px 24px'}}><div style={{maxWidth:1080,margin:'auto'}}>
        <div style={{textAlign:'center',marginBottom:34}}><h2 style={{fontSize:'clamp(28px,4vw,40px)',letterSpacing:'-.03em',margin:'0 0 8px'}}>Tools for managing your cover</h2><p style={{color:'var(--muted)',margin:0}}>Plan information and account tools, together in one place.</p></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16}}>{[
          ['account_balance_wallet','Wallet activity','Review wallet funding and transaction details from your account.'],['health_and_safety','Health plan details','Find plan information and contribution details before you proceed.'],['support_agent','Account support','Access the account tools and support options available in the app.']
        ].map(([icon,title,desc])=><article key={title} style={{...card,padding:24}}><span className="icon" style={{color:'var(--green-400)',fontSize:27}}>{icon}</span><h3 style={{fontSize:17,margin:'14px 0 7px'}}>{title}</h3><p style={{color:'var(--muted)',fontSize:14,lineHeight:1.65,margin:0}}>{desc}</p></article>)}</div>
      </div></section>
      <section style={{padding:'10px 24px 88px'}}><div style={{...card,maxWidth:900,margin:'auto',padding:'clamp(30px,7vw,64px)',textAlign:'center'}}><h2 style={{fontSize:'clamp(30px,5vw,48px)',lineHeight:1.1,letterSpacing:'-.035em',margin:'0 0 14px'}}>Explore your options.<br/><span style={{color:'var(--green-400)'}}>Manage your cover.</span></h2><p style={{color:'var(--muted)',margin:'0 auto 24px',maxWidth:480}}>Review the available health plans and continue when you are ready.</p><button onClick={()=>navigate('/auth')} style={button}>View health plans →</button></div></section>
    </main>
    <footer style={{borderTop:'1px solid var(--line)',padding:'24px',textAlign:'center',color:'var(--muted)',fontSize:13}}>© {new Date().getFullYear()} PAYG Health. Information subject to plan terms.</footer>
  </div>
}
