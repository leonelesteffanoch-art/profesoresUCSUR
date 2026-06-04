import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, doc, updateDoc, deleteDoc,
  getDocs, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlh41094phxhm6NZDyzKFENmivi5ceRuI",
  authDomain: "ratemyprofe-fea08.firebaseapp.com",
  projectId: "ratemyprofe-fea08",
  storageBucket: "ratemyprofe-fea08.firebasestorage.app",
  messagingSenderId: "103032053506",
  appId: "1:103032053506:web:74f887daba6bc94a6fac1b"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const COL_RESENAS = "resenas";

// ─── Paleta ───────────────────────────────────────────────
const BLUE   = "#1560AA";
const BLUE_D = "#0C447C";
const BLUE_L = "#deeaf8";
const OR     = "#E87722";

const FAC_COLOR = {
  "Ciencias de la Arquitectura":              "#B45309",
  "Ciencias Biológicas":                      "#059669",
  "Ciencias de la Comunicación y Creatividad":"#9333EA",
  "Ciencias Empresariales":                   "#0891B2",
  "Ciencias de la Ingenieria":                "#1560AA",
  "Ciencias de la Salud":                     "#E87722",
  "Ciencias Políticas y Derecho":             "#7C3AED",
  "Ciencias de la Educación":                 "#DB2777",
};
const FAC_BG = {
  "Ciencias de la Arquitectura":              "#fef3c7",
  "Ciencias Biológicas":                      "#d1fae5",
  "Ciencias de la Comunicación y Creatividad":"#f3e8ff",
  "Ciencias Empresariales":                   "#e0f2fe",
  "Ciencias de la Ingenieria":                "#deeaf8",
  "Ciencias de la Salud":                     "#fff3e0",
  "Ciencias Políticas y Derecho":             "#ede9fe",
  "Ciencias de la Educación":                 "#fce7f3",
};
const FAC_EMOJI = {
  "Ciencias de la Arquitectura":              "🏛️",
  "Ciencias Biológicas":                      "🔬",
  "Ciencias de la Comunicación y Creatividad":"🎨",
  "Ciencias Empresariales":                   "📊",
  "Ciencias de la Ingenieria":                "⚙️",
  "Ciencias de la Salud":                     "🩺",
  "Ciencias Políticas y Derecho":             "⚖️",
  "Ciencias de la Educación":                 "📚",
};

const FACULTADES      = ["Todas","Ciencias de la Arquitectura","Ciencias Biológicas","Ciencias de la Comunicación y Creatividad","Ciencias Empresariales","Ciencias de la Ingenieria","Ciencias de la Salud","Ciencias Políticas y Derecho","Ciencias de la Educación"];
const FACULTADES_FORM = FACULTADES.filter(f => f !== "Todas");
const CRIT            = ["claridad","puntualidad","trato","examenes"];
const CRIT_LABEL      = { claridad:"Claridad", puntualidad:"Puntualidad", trato:"Trato", examenes:"Exámenes" };
const CRIT_ICON       = { claridad:"💡", puntualidad:"⏰", trato:"🤝", examenes:"📝" };

const FORM_EMPTY = { texto:"", claridad:0, puntualidad:0, trato:0, examenes:0, facultadAlumno:"", carrera:"", ciclo:"" };
const ADD_EMPTY  = { nombre:"", facultad:"Ciencias de la Ingenieria", curso:"", bio:"" };

const FRASES = [
  "Opiniones reales de estudiantes de la Científica del Sur.",
  "Tu guía de supervivencia para armar tu horario.",
  "Califica y ayuda a otros estudiantes a elegir mejor.",
  "La verdad sobre tus profes, contada por estudiantes.",
];

// ─── Helpers ──────────────────────────────────────────────
const avg      = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
const initials = n  => n.split(" ").map(x=>x[0]).slice(0,2).join("");
const ratingColor = r => r>=4.5?"#059669":r>=3.5?BLUE:r>=2.5?OR:"#DC2626";
const ratingLabel = r => r>=4.5?"Excelente":r>=3.5?"Bueno":r>=2.5?"Regular":"Deficiente";
const calcRating  = rs => rs.length ? parseFloat(avg(rs.map(x=>avg(CRIT.map(c=>x.criterios[c])))).toFixed(1)) : 0;

const similarity = (a,b) => {
  a=a.toLowerCase().trim(); b=b.toLowerCase().trim();
  if(a===b) return 1;
  if(a.includes(b)||b.includes(a)) return 0.9;
  const wa=a.split(" "), wb=b.split(" ");
  return wa.filter(w=>wb.some(x=>x.startsWith(w)||w.startsWith(x))).length/Math.max(wa.length,wb.length);
};

const formatFecha = d => {
  if(!d) return "";
  const date = d?.toDate ? d.toDate() : new Date(d);
  const diff  = (new Date() - date)/1000;
  if(diff<60)    return "Hace un momento";
  if(diff<3600)  return `Hace ${Math.floor(diff/60)} min`;
  if(diff<86400) return `Hace ${Math.floor(diff/3600)}h`;
  return date.toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"})
    + " · " + date.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"});
};

// ─── CSS Global ───────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#eef2f9;-webkit-font-smoothing:antialiased;overscroll-behavior-y:none}

/* Scrollbar */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#f0f4fa}
::-webkit-scrollbar-thumb{background:#c8d5e8;border-radius:2px}

/* Cards */
.card{background:#fff;border-radius:18px;border:1px solid #e2eaf5;box-shadow:0 1px 4px rgba(21,96,170,.05)}
.card-tap{transition:background .12s}
.card-tap:active{background:#f5f8fd}

/* Buttons */
.btn{border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;transition:opacity .12s,transform .1s;font-family:inherit;padding:12px 20px;letter-spacing:.01em;touch-action:manipulation}
.btn:active{opacity:.82;transform:scale(.97)}
.btn-blue{background:#1560AA;color:#fff}
.btn-orange{background:#E87722;color:#fff}
.btn-ghost{background:#f0f4fa;color:#3a4a60;border:1.5px solid #e2eaf5}
.btn-red{background:#fef2f2;color:#DC2626;border:1px solid #fecaca}
.btn-green{background:#d1fae5;color:#059669;border:1px solid #6ee7b7}
.btn-cta{background:#E87722;color:#fff;font-size:15px;padding:15px 28px;border-radius:14px;border:none;cursor:pointer;font-family:inherit;font-weight:800;touch-action:manipulation}
.btn-cta:active{opacity:.85}

/* Inputs */
.input{width:100%;padding:13px 14px;border-radius:12px;border:1.5px solid #d8e3ef;font-size:15px;font-family:inherit;outline:none;transition:border .15s;background:#fafcff;color:#1a2540;-webkit-appearance:none;appearance:none}
.input:focus{border-color:#1560AA;box-shadow:0 0 0 3px #1560AA18}
select.input{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
.textarea{width:100%;min-height:120px;padding:13px 14px;border-radius:12px;border:1.5px solid #d8e3ef;font-size:15px;resize:vertical;font-family:inherit;outline:none;transition:border .15s;background:#fafcff;color:#1a2540;line-height:1.6}
.textarea:focus{border-color:#E87722;box-shadow:0 0 0 3px #E8772218}

/* Pills */
.pill{display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}

/* Utility */
.fade-in{animation:fadeIn .3s ease both}
.shimmer{background:linear-gradient(90deg,#f0f4fa 25%,#e2eaf5 50%,#f0f4fa 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:14px}
.crit-box{background:#f7f9fc;border:1.5px solid #e2eaf5;border-radius:14px;padding:14px;cursor:default;transition:border-color .15s,background .15s}
.crit-box.active{background:#fff8f2;border-color:#E8772260}
.tab{padding:9px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:inherit;touch-action:manipulation}
.chip-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.chip-scroll::-webkit-scrollbar{display:none}
.chip{padding:8px 14px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid;cursor:pointer;white-space:nowrap;scroll-snap-align:start;touch-action:manipulation;transition:none}
.chip:active{opacity:.75}

/* Bottom nav */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2eaf5;display:flex;z-index:200;padding-bottom:env(safe-area-inset-bottom)}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;cursor:pointer;touch-action:manipulation;transition:none;gap:3px;border:none;background:none;font-family:inherit}
.bnav-item:active .bnav-icon{transform:scale(.9)}
.bnav-icon{font-size:22px;transition:transform .1s;line-height:1}
.bnav-label{font-size:10px;font-weight:700;letter-spacing:.3px}

/* Topbar */
.topbar{background:linear-gradient(135deg,#0C447C 0%,#1560AA 100%);height:56px;display:flex;align-items:center;padding:0 16px;gap:10px;position:sticky;top:0;z-index:150;box-shadow:0 2px 12px rgba(12,68,124,.3)}

/* Toast */
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a2540;color:#fff;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:600;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,.25);animation:slideUp .25s ease;white-space:nowrap;max-width:calc(100vw - 32px);text-align:center}

/* Section headers */
.section-title{font-size:17px;font-weight:800;color:#0C447C;margin-bottom:4px}
.section-sub{font-size:12px;color:#8a99b0}

/* Profile hero */
.prof-hero{background:linear-gradient(150deg,#0C447C 0%,#1560AA 100%);padding:24px 16px 20px}

/* Step badge */
.step-badge{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid rgba(255,255,255,.3)}

@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

// ─── Sub-components ───────────────────────────────────────
const Stars = ({ value, onChange, size=20, gap=3 }) => (
  <span style={{display:"inline-flex",gap}}>
    {[1,2,3,4,5].map(s=>(
      <span key={s}
        onClick={()=>onChange&&onChange(s)}
        style={{fontSize:size,color:s<=Math.round(value)?OR:"#dde3ec",cursor:onChange?"pointer":"default",lineHeight:1,display:"inline-block",userSelect:"none"}}
      >★</span>
    ))}
  </span>
);

const Avatar = ({ name, fac, size=48 }) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:FAC_BG[fac]||BLUE_L,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:800,color:FAC_COLOR[fac]||BLUE,flexShrink:0,border:`2px solid ${FAC_COLOR[fac]||BLUE}35`,letterSpacing:"-.5px"}}>
    {initials(name)}
  </div>
);

const RatingChip = ({ r, large=false }) => {
  if(!r) return <span style={{color:"#bbb",fontSize:12}}>Sin calificar</span>;
  const c = ratingColor(r);
  return large ? (
    <div style={{textAlign:"center"}}>
      <span style={{background:`${c}15`,color:c,fontWeight:800,fontSize:26,padding:"8px 16px",borderRadius:12,display:"inline-block"}}>★ {r.toFixed(1)}</span>
      <div style={{fontSize:11,color:c,fontWeight:700,marginTop:3}}>{ratingLabel(r)}</div>
    </div>
  ) : <span style={{background:`${c}15`,color:c,fontWeight:800,fontSize:14,padding:"3px 10px",borderRadius:10}}>{r.toFixed(1)}</span>;
};

const CritBar = ({ label, icon, value }) => (
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
    <span style={{fontSize:13,width:18,textAlign:"center"}}>{icon}</span>
    <span style={{fontSize:12,color:"#6b7a90",width:82,flexShrink:0}}>{label}</span>
    <div style={{flex:1,background:"#edf1f7",borderRadius:6,height:8,overflow:"hidden"}}>
      <div style={{width:`${value*20}%`,background:`linear-gradient(90deg,${BLUE},${OR})`,height:"100%",borderRadius:6,transition:"width .5s ease"}}/>
    </div>
    <span style={{fontSize:12,fontWeight:800,color:ratingColor(value),width:26,textAlign:"right"}}>{value>0?value.toFixed(1):"—"}</span>
  </div>
);

const Divider = () => <hr style={{border:"none",borderTop:"1px solid #edf1f7",margin:"12px 0"}}/>;

const Toast = ({ msg, onDone }) => {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t)},[]);
  return <div className="toast">{msg}</div>;
};

// ─── Bottom Nav ───────────────────────────────────────────
const BottomNav = ({ page, setPage }) => {
  const items = [
    { key:"home",   icon:"🏠", label:"Inicio"  },
    { key:"ranking",icon:"🏆", label:"Ranking"  },
    { key:"agregar",icon:"➕", label:"Agregar"  },
    { key:"admin",  icon:"⚙️", label:"Admin"    },
  ];
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
      {items.map(it=>(
        <button key={it.key} className="bnav-item" onClick={()=>setPage(it.key)}
          aria-current={page===it.key?"page":undefined}
          style={{color:page===it.key?BLUE:"#8a99b0"}}>
          <span className="bnav-icon">{it.icon}</span>
          <span className="bnav-label" style={{fontWeight:page===it.key?800:600}}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ─── Top Bar ──────────────────────────────────────────────
const Topbar = ({ title, onBack, action }) => (
  <header className="topbar">
    {onBack && (
      <button onClick={onBack} style={{background:"none",border:"none",color:"rgba(255,255,255,.8)",fontSize:22,cursor:"pointer",padding:"4px 8px 4px 0",lineHeight:1,touchAction:"manipulation"}}>←</button>
    )}
    {!onBack && (
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{background:OR,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>★</div>
        <div>
          <div style={{color:"#fff",fontWeight:800,fontSize:14,lineHeight:1.1}}>ProfesoresUCSUR</div>
          <div style={{color:"rgba(255,255,255,.45)",fontSize:9,letterSpacing:.8,fontWeight:700}}>CIENTÍFICA DEL SUR</div>
        </div>
      </div>
    )}
    {onBack && <span style={{color:"#fff",fontWeight:800,fontSize:15,flex:1}}>{title}</span>}
    <span style={{flex:1}}/>
    {action}
  </header>
);

// ══════════════════════════════════════════════════════════
// ─── Main App ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════
export default function App() {
  const [page,       setPage]       = useState("home");
  const [profesores, setProfesores] = useState([]);
  const [resenas,    setResenas]    = useState({});
  const [carreras,   setCarreras]   = useState({});
  const [selProf,    setSelProf]    = useState(null);
  const [busqueda,   setBusqueda]   = useState("");
  const [facFiltro,  setFacFiltro]  = useState("Todas");
  const [sortBy,     setSortBy]     = useState("rating");
  const [form,       setForm]       = useState(FORM_EMPTY);
  const [formErr,    setFormErr]    = useState("");
  const [addProf,    setAddProf]    = useState(ADD_EMPTY);
  const [addMode,    setAddMode]    = useState("nuevo");
  const [addProfSel, setAddProfSel] = useState(null);
  const [addCurso,   setAddCurso]   = useState("");
  const [toast,      setToast]      = useState(null);
  const [rankTab,    setRankTab]    = useState("top");
  const [loading,    setLoading]    = useState(true);
  const [adminUser,  setAdminUser]  = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass,  setAdminPass]  = useState("");
  const [adminLoading,setAdminLoading]=useState(false);
  const [reportes,   setReportes]   = useState([]);
  const [frase,      setFrase]      = useState(FRASES[0]);
  const [editCursoProf,setEditCursoProf]=useState(null);
  const [editCursoVal, setEditCursoVal] =useState("");
  const [todasResenas, setTodasResenas] =useState([]);
  const [showSearch,   setShowSearch]   = useState(false);
  const [votados, setVotados] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("rmp_votes")||"{}")}catch{return{}}
  });
  const formRef = useRef();
  const searchRef = useRef();

  // ── Firestore listeners ──
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"profesores"),snap=>{
      setProfesores(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"config","carreras"),snap=>{
      if(snap.exists()) setCarreras(snap.data());
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{
    if(!selProf) return;
    const q = query(collection(db,"profesores",selProf.id,COL_RESENAS),orderBy("createdAt","desc"));
    const unsub = onSnapshot(q,snap=>{
      setResenas(prev=>({...prev,[selProf.id]:snap.docs.map(d=>({id:d.id,...d.data()}))}));
    });
    return()=>unsub();
  },[selProf]);

  useEffect(()=>{
    if(!adminUser||profesores.length===0) return;
    const unsubs = profesores.map(p=>{
      const q = query(collection(db,"profesores",p.id,COL_RESENAS),orderBy("createdAt","desc"));
      return onSnapshot(q,snap=>{
        const rs = snap.docs.map(d=>({id:d.id,profId:p.id,profNombre:p.nombre,profFac:p.facultad,...d.data()}));
        setTodasResenas(prev=>{
          const sinEste = prev.filter(r=>r.profId!==p.id);
          return [...sinEste,...rs].sort((a,b)=>(b.createdAt?.toDate?.()?.getTime()||0)-(a.createdAt?.toDate?.()?.getTime()||0));
        });
        setResenas(prev=>({...prev,[p.id]:snap.docs.map(d=>({id:d.id,...d.data()}))}));
      });
    });
    return()=>unsubs.forEach(u=>u());
  },[adminUser,profesores.length]);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"reportes"),snap=>{
      setReportes(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return()=>unsub();
  },[]);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,user=>setAdminUser(user));
    return()=>unsub();
  },[]);

  useEffect(()=>{
    if(page==="home") setFrase(FRASES[Math.floor(Math.random()*FRASES.length)]);
  },[page]);

  // Focus search input when opened
  useEffect(()=>{
    if(showSearch && searchRef.current) searchRef.current.focus();
  },[showSearch]);

  const showToast = msg => setToast(msg);

  const navigate = useCallback((p, prof=null)=>{
    setPage(p); setFormErr(""); setForm(FORM_EMPTY);
    setAddProf(ADD_EMPTY); setAddMode("nuevo"); setAddProfSel(null); setAddCurso("");
    setShowSearch(false);
    if(prof) setSelProf(prof);
    window.scrollTo(0,0);
  },[]);

  // ── Actions ──
  const submitResena = async () => {
    if(!form.texto.trim()||CRIT.some(c=>form[c]===0)){
      setFormErr("Completa todos los criterios y escribe un comentario.");
      return;
    }
    try{
      const r={
        texto:form.texto,
        criterios:{claridad:form.claridad,puntualidad:form.puntualidad,trato:form.trato,examenes:form.examenes},
        facultadAlumno:form.facultadAlumno||"",
        carrera:form.carrera||"",
        ciclo:form.ciclo||"",
        util:0,noUtil:0,createdAt:serverTimestamp()
      };
      await addDoc(collection(db,"profesores",selProf.id,COL_RESENAS),r);
      const allR=[r,...(resenas[selProf.id]||[])];
      await updateDoc(doc(db,"profesores",selProf.id),{rating:calcRating(allR),totalReseñas:allR.length});
      setForm(FORM_EMPTY); setFormErr("");
      showToast("✅ ¡Reseña publicada de forma anónima!");
    }catch(e){showToast("❌ Error al publicar. Verifica tu conexión.");}
  };

  const submitAddProf = async () => {
    if(!addProf.nombre.trim()){showToast("⚠️ Escribe el nombre del profesor.");return;}
    if(!addProf.curso.trim()){showToast("⚠️ Escribe al menos un curso.");return;}
    const similar = profesores.find(p=>similarity(p.nombre,addProf.nombre)>0.85);
    if(similar){
      showToast(`⚠️ Ya existe "${similar.nombre}". ¿Quisiste agregar un curso?`);
      setAddProfSel(similar);setAddMode("curso");setAddCurso(addProf.curso);return;
    }
    try{
      await addDoc(collection(db,"profesores"),{
        nombre:addProf.nombre.trim(),facultad:addProf.facultad,
        cursos:[addProf.curso.trim()],bio:addProf.bio.trim()||"Profesor de la Universidad Científica del Sur.",
        rating:0,totalReseñas:0,createdAt:serverTimestamp()
      });
      showToast("✅ ¡Profesor agregado!");
      setTimeout(()=>navigate("home"),1200);
    }catch(e){showToast("❌ Error al agregar. Verifica tu conexión.");}
  };

  const submitAgregarCurso = async () => {
    if(!addProfSel) return;
    if(!addCurso.trim()){showToast("⚠️ Escribe el nombre del curso.");return;}
    if((addProfSel.cursos||[]).map(c=>c.toLowerCase()).includes(addCurso.trim().toLowerCase())){
      showToast("⚠️ Ese curso ya está registrado.");return;
    }
    try{
      await updateDoc(doc(db,"profesores",addProfSel.id),{cursos:[...(addProfSel.cursos||[]),addCurso.trim()]});
      showToast(`✅ Curso "${addCurso.trim()}" agregado a ${addProfSel.nombre}`);
      setTimeout(()=>navigate("home"),1200);
    }catch(e){showToast("❌ Error al agregar el curso.");}
  };

  const eliminarCurso = async (prof,curso) => {
    if(!window.confirm(`¿Eliminar el curso "${curso}" de ${prof.nombre}?`)) return;
    try{
      await updateDoc(doc(db,"profesores",prof.id),{cursos:(prof.cursos||[]).filter(c=>c!==curso)});
      showToast("✅ Curso eliminado.");
    }catch(e){showToast("❌ Error al eliminar el curso.");}
  };

  const adminAgregarCurso = async (prof) => {
    if(!editCursoVal.trim()){showToast("⚠️ Escribe el nombre del curso.");return;}
    if((prof.cursos||[]).map(c=>c.toLowerCase()).includes(editCursoVal.trim().toLowerCase())){
      showToast("⚠️ Ese curso ya existe.");return;
    }
    try{
      await updateDoc(doc(db,"profesores",prof.id),{cursos:[...(prof.cursos||[]),editCursoVal.trim()]});
      setEditCursoProf(null);setEditCursoVal("");
      showToast("✅ Curso agregado.");
    }catch(e){showToast("❌ Error al agregar el curso.");}
  };

  const toggleUtil = async (profId,resId,tipo) => {
    if(votados[resId]) return;
    const r = resenas[profId]?.find(x=>x.id===resId); if(!r) return;
    try{
      await updateDoc(doc(db,"profesores",profId,COL_RESENAS,resId),{[tipo]:(r[tipo]||0)+1});
      const nuevos={...votados,[resId]:tipo};
      setVotados(nuevos);
      localStorage.setItem("rmp_votes",JSON.stringify(nuevos));
    }catch(e){showToast("❌ Error al registrar tu voto.");}
  };

  const eliminarProfesor = async (p) => {
    if(!window.confirm(`¿Eliminar a ${p.nombre} y todas sus reseñas?`)) return;
    try{
      const rSnap = await getDocs(collection(db,"profesores",p.id,COL_RESENAS));
      for(const r of rSnap.docs) await deleteDoc(doc(db,"profesores",p.id,COL_RESENAS,r.id));
      await deleteDoc(doc(db,"profesores",p.id));
      showToast(`🗑️ ${p.nombre} eliminado.`);
    }catch(e){showToast("❌ Error al eliminar.");}
  };

  const eliminarResena = async (p,r) => {
    if(!window.confirm("¿Eliminar esta reseña?")) return;
    try{
      const profObj = typeof p==="string" ? profesores.find(x=>x.id===p) : p;
      if(!profObj) return;
      await deleteDoc(doc(db,"profesores",profObj.id,COL_RESENAS,r.id));
      const remaining = (resenas[profObj.id]||[]).filter(x=>x.id!==r.id);
      const newRating = calcRating(remaining);
      await updateDoc(doc(db,"profesores",profObj.id),{rating:newRating,totalReseñas:remaining.length});
      setResenas(prev=>({...prev,[profObj.id]:remaining}));
      setTodasResenas(prev=>prev.filter(x=>x.id!==r.id));
      setProfesores(prev=>prev.map(x=>x.id===profObj.id?{...x,rating:newRating,totalReseñas:remaining.length}:x));
      showToast("🗑️ Reseña eliminada.");
    }catch(e){showToast("❌ Error al eliminar.");}
  };

  const reportarResena = async (profId,resId,texto,profNombre) => {
    if(!window.confirm("¿Reportar esta reseña como inapropiada o falsa?")) return;
    if(reportes.some(r=>r.resId===resId)){showToast("⚠️ Esta reseña ya fue reportada.");return;}
    try{
      await addDoc(collection(db,"reportes"),{profId,resId,texto,profNombre,fecha:serverTimestamp(),estado:"pendiente"});
      showToast("⚠️ Reseña reportada. La revisaremos pronto.");
    }catch(e){showToast("❌ Error al enviar el reporte.");}
  };

  // ── Derived data ──
  const allR = selProf ? (resenas[selProf.id]||[]) : [];
  const critAvg = CRIT.reduce((acc,c)=>({...acc,[c]:allR.length?avg(allR.map(r=>r.criterios[c])):0}),{});
  const globalRating = calcRating(allR);
  const carrerasForm = form.facultadAlumno ? (carreras[form.facultadAlumno]||[]) : [];

  const filtered = profesores
    .filter(p=>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cursos?.some(c=>c.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .filter(p=>facFiltro==="Todas"||p.facultad===facFiltro)
    .sort((a,b)=>sortBy==="rating"?b.rating-a.rating:(b.totalReseñas||0)-(a.totalReseñas||0));

  // ════════════════════════════════════════════════════
  // ─── PAGE: HOME ─────────────────────────────────────
  // ════════════════════════════════════════════════════
  if(page==="home") return (
    <div style={{minHeight:"100vh",background:"#eef2f9",paddingBottom:80}}>
      <style>{css}</style>

      {/* Topbar */}
      <Topbar action={
        <button onClick={()=>{setShowSearch(s=>!s)}} style={{background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:10,color:"#fff",fontSize:20,width:40,height:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {showSearch?"✕":"🔍"}
        </button>
      }/>

      {/* Search bar (expandable) */}
      {showSearch && (
        <div style={{background:BLUE_D,padding:"8px 16px 12px"}}>
          <input ref={searchRef} className="input" value={busqueda}
            onChange={e=>setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o curso..."
            style={{background:"rgba(255,255,255,.95)"}}
          />
        </div>
      )}

      {/* Hero compacto */}
      {!showSearch && (
        <div style={{background:`linear-gradient(150deg,${BLUE_D} 0%,${BLUE} 100%)`,padding:"20px 16px 28px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(232,119,34,.1)",pointerEvents:"none"}}/>
          <p style={{color:"rgba(255,255,255,.7)",fontSize:13,marginBottom:14,lineHeight:1.5}}>{frase}</p>

          {/* Stats row */}
          <div style={{display:"flex",gap:8}}>
            {[{n:profesores.length,l:"profes",i:"👨‍🏫"},{n:profesores.reduce((t,p)=>t+(p.totalReseñas||0),0),l:"reseñas",i:"💬"},{n:FACULTADES.length-1,l:"facultades",i:"🏫"}].map(s=>(
              <div key={s.l} style={{flex:1,background:"rgba(255,255,255,.13)",borderRadius:10,padding:"8px 6px",textAlign:"center",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontSize:15}}>{s.i}</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{s.n}</div>
                <div style={{color:"rgba(255,255,255,.6)",fontSize:10}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner agregar profe */}
      <div style={{margin:"12px 16px 0"}}>
        <div style={{background:`linear-gradient(135deg,${BLUE_D},${BLUE})`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 3px 12px ${BLUE}40`}}>
          <div style={{fontSize:24,flexShrink:0}}>👨‍🏫</div>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:700,fontSize:13,marginBottom:1}}>¿No encuentras a tu profe?</div>
            <div style={{color:"rgba(255,255,255,.6)",fontSize:11}}>Agrégalo para que todos puedan calificarlo</div>
          </div>
          <button className="btn-cta" style={{fontSize:12,padding:"9px 14px",borderRadius:10,flexShrink:0}} onClick={()=>navigate("agregar")}>
            ➕ Agregar
          </button>
        </div>
      </div>

      {/* Filtros facultad */}
      <div style={{margin:"12px 0 0",padding:"0 16px"}}>
        <div className="chip-scroll">
          {FACULTADES.map(f=>(
            <button key={f} className="chip"
              onClick={()=>setFacFiltro(f)}
              style={{
                background:facFiltro===f?(FAC_COLOR[f]||BLUE):"transparent",
                color:facFiltro===f?"#fff":(FAC_COLOR[f]||"#666"),
                borderColor:facFiltro===f?(FAC_COLOR[f]||BLUE):(FAC_BG[f]||"#e2eaf5"),
              }}>
              {f==="Todas"?"Todas":`${FAC_EMOJI[f]||""} ${f.replace("Ciencias de la ","").replace("Ciencias ","")}`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px 6px"}}>
        <span style={{fontSize:13,color:"#6b7a90",fontWeight:600}}>{filtered.length} profesor{filtered.length!==1?"es":""}</span>
        <select className="input" style={{width:"auto",padding:"7px 32px 7px 12px",fontSize:12,height:36,borderRadius:10}}
          value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="rating">⭐ Mejor calificados</option>
          <option value="resenas">💬 Más reseñas</option>
        </select>
      </div>

      {/* Lista profesores */}
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
        {loading && [1,2,3,4].map(i=><div key={i} className="shimmer" style={{height:90}}/>)}

        {!loading && filtered.length===0 && (
          <div className="card" style={{padding:40,textAlign:"center",marginTop:8}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <div style={{color:"#aaa",fontSize:14,marginBottom:16}}>No se encontraron profesores.</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn btn-ghost" onClick={()=>{setBusqueda("");setFacFiltro("Todas")}}>Limpiar filtros</button>
              <button className="btn btn-orange" onClick={()=>navigate("agregar")}>➕ Agregar profe</button>
            </div>
          </div>
        )}

        {filtered.map((p,i)=>(
          <div key={p.id} className="card card-tap fade-in"
            onClick={()=>navigate("perfil",p)}
            style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderLeft:`3px solid ${FAC_COLOR[p.facultad]||BLUE}`,animationDelay:`${i*.03}s`,cursor:"pointer"}}>
            <Avatar name={p.nombre} fac={p.facultad} size={50}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:14,color:"#1a2540",marginBottom:4,lineHeight:1.25}}>{p.nombre}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                <span className="pill" style={{background:FAC_BG[p.facultad]||BLUE_L,color:FAC_COLOR[p.facultad]||BLUE_D,fontSize:10}}>
                  {FAC_EMOJI[p.facultad]||""} {(p.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}
                </span>
                {(p.cursos||[]).slice(0,2).map(c=>(
                  <span key={c} className="pill" style={{background:"#f3f6fb",color:"#5a6a80",fontSize:10}}>📚 {c}</span>
                ))}
                {(p.cursos||[]).length>2 && <span style={{fontSize:10,color:"#aaa",alignSelf:"center"}}>+{p.cursos.length-2}</span>}
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <RatingChip r={p.rating}/>
              <div style={{marginTop:4}}><Stars value={p.rating} size={11} gap={1}/></div>
              <div style={{fontSize:10,color:"#a0adb8",marginTop:2}}>{p.totalReseñas||0} reseñas</div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav page={page} setPage={p=>{navigate(p)}}/>
      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );

  // ════════════════════════════════════════════════════
  // ─── PAGE: RANKING ──────────────────────────────────
  // ════════════════════════════════════════════════════
  if(page==="ranking"){
    const withR   = profesores.filter(p=>p.totalReseñas>0);
    const top     = [...withR].sort((a,b)=>b.rating-a.rating);
    const worst   = [...withR].sort((a,b)=>a.rating-b.rating);
    const popular = [...profesores].sort((a,b)=>(b.totalReseñas||0)-(a.totalReseñas||0));
    const maxR    = Math.max(...profesores.map(p=>p.totalReseñas||0),1);
    const podio   = top.slice(0,3);
    const medals  = ["🥇","🥈","🥉"];
    const podioOrder = podio.length>=3?[1,0,2]:podio.length===2?[1,0]:[0];
    const podioHeights = ["52px","70px","38px"];

    return (
      <div style={{minHeight:"100vh",background:"#eef2f9",paddingBottom:80}}>
        <style>{css}</style>
        <Topbar/>

        <div style={{padding:"20px 16px 0"}}>
          <div className="section-title">🏆 Ranking</div>
          <div className="section-sub" style={{marginBottom:16}}>Basado en calificaciones reales de estudiantes</div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,background:"#e2eaf5",borderRadius:12,padding:4,marginBottom:20}}>
            {[["top","⭐ Top"],["worst","💔 Peores"],["popular","🔥 Populares"]].map(([k,l])=>(
              <button key={k} className="tab" onClick={()=>setRankTab(k)} style={{flex:1,background:rankTab===k?BLUE:"transparent",color:rankTab===k?"#fff":"#6b7a90"}}>{l}</button>
            ))}
          </div>

          {/* Podio */}
          {rankTab==="top" && podio.length>0 && (
            <>
              <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:10,marginBottom:20,paddingTop:8}}>
                {podioOrder.map((idx,i)=>{
                  const p=podio[idx]; if(!p) return null;
                  return(
                    <div key={p.id} onClick={()=>navigate("perfil",p)}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flex:1,maxWidth:120}}>
                      <span style={{fontSize:20,marginBottom:3}}>{medals[idx]}</span>
                      <Avatar name={p.nombre} fac={p.facultad} size={idx===0?54:42}/>
                      <div style={{fontSize:11,fontWeight:800,color:"#1a2540",marginTop:5,textAlign:"center",lineHeight:1.2}}>{p.nombre.split(" ").slice(0,2).join(" ")}</div>
                      <RatingChip r={p.rating}/>
                      <div style={{background:idx===0?OR:idx===1?"#a8b8cc":"#b8a090",height:podioHeights[i],width:"100%",borderRadius:"8px 8px 0 0",marginTop:8,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:5}}>
                        <span style={{color:"#fff",fontWeight:800,fontSize:14}}>#{idx+1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card" style={{padding:"4px 0"}}>
                {top.slice(3).map((p,i)=>(
                  <div key={p.id} onClick={()=>navigate("perfil",p)}
                    className="card-tap"
                    style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderTop:i>0?"1px solid #edf1f7":"none",cursor:"pointer"}}>
                    <span style={{fontSize:13,color:"#a0adb8",fontWeight:700,width:26}}>#{i+4}</span>
                    <Avatar name={p.nombre} fac={p.facultad} size={34}/>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div><div style={{fontSize:11,color:"#8a99b0"}}>{(p.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}</div></div>
                    <RatingChip r={p.rating}/>
                  </div>
                ))}
              </div>
            </>
          )}

          {rankTab==="worst" && (
            <div className="card" style={{padding:"4px 0"}}>
              {worst.map((p,i)=>(
                <div key={p.id} onClick={()=>navigate("perfil",p)} className="card-tap"
                  style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderTop:i>0?"1px solid #edf1f7":"none",cursor:"pointer"}}>
                  <span style={{fontSize:20}}>{i===0?"💀":i===1?"😬":"😕"}</span>
                  <Avatar name={p.nombre} fac={p.facultad} size={34}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div><div style={{fontSize:11,color:"#8a99b0"}}>{(p.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}</div></div>
                  <RatingChip r={p.rating}/>
                </div>
              ))}
            </div>
          )}

          {rankTab==="popular" && (
            <div className="card" style={{padding:"4px 0"}}>
              {popular.map((p,i)=>(
                <div key={p.id} onClick={()=>navigate("perfil",p)} className="card-tap"
                  style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderTop:i>0?"1px solid #edf1f7":"none",cursor:"pointer"}}>
                  <span style={{fontSize:12,color:"#a0adb8",fontWeight:700,width:24}}>#{i+1}</span>
                  <Avatar name={p.nombre} fac={p.facultad} size={34}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div><div style={{fontSize:11,color:"#8a99b0"}}>{p.totalReseñas||0} reseñas</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <div style={{width:60,background:"#edf1f7",borderRadius:5,height:7,overflow:"hidden"}}>
                      <div style={{width:`${((p.totalReseñas||0)/maxR)*100}%`,background:`linear-gradient(90deg,${BLUE},${OR})`,height:"100%",borderRadius:5}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:BLUE}}>{p.totalReseñas||0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav page={page} setPage={p=>navigate(p)}/>
        {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ─── PAGE: AGREGAR ──────────────────────────────────
  // ════════════════════════════════════════════════════
  if(page==="agregar"){
    const sugerencias = addProf.nombre.length>=2
      ? profesores.filter(p=>similarity(p.nombre,addProf.nombre)>0.4)
          .sort((a,b)=>similarity(b.nombre,addProf.nombre)-similarity(a.nombre,addProf.nombre))
          .slice(0,4)
      : [];
    const cursosExistentes = [...new Set(profesores.filter(p=>p.facultad===addProf.facultad).flatMap(p=>p.cursos||[]))];

    return (
      <div style={{minHeight:"100vh",background:"#eef2f9",paddingBottom:80}}>
        <style>{css}</style>
        <Topbar/>

        <div style={{padding:"20px 16px 0"}}>
          {/* Guía */}
          <div style={{background:`linear-gradient(135deg,${BLUE_D},${BLUE})`,borderRadius:14,padding:"18px 18px",marginBottom:18,boxShadow:`0 3px 14px ${BLUE}40`}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:15,marginBottom:12}}>¿Cómo funciona?</div>
            {[["1","Elige si quieres agregar un profe nuevo o un curso a uno que ya existe."],
              ["2","Completa el formulario con el nombre, facultad y curso."],
              ["3","¡Listo! Otros alumnos podrán calificarlo."]].map(([n,t])=>(
              <div key={n} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:n==="3"?0:10}}>
                <div className="step-badge">{n}</div>
                <p style={{color:"rgba(255,255,255,.8)",fontSize:13,lineHeight:1.5}}>{t}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,background:"#e2eaf5",borderRadius:12,padding:4,marginBottom:18}}>
            {[["nuevo","➕ Nuevo profesor"],["curso","📚 Agregar curso"]].map(([m,l])=>(
              <button key={m} className="tab"
                onClick={()=>{setAddMode(m);setAddProfSel(null);setAddCurso("")}}
                style={{flex:1,background:addMode===m?BLUE:"transparent",color:addMode===m?"#fff":"#6b7a90"}}>{l}</button>
            ))}
          </div>

          {/* Form nuevo profesor */}
          {addMode==="nuevo" && (
            <div className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>Nombre completo del profesor</label>
                <input className="input" value={addProf.nombre}
                  onChange={e=>setAddProf(p=>({...p,nombre:e.target.value}))}
                  placeholder="Ej. Juan Pérez García" autoComplete="off"/>
                {sugerencias.length>0 && (
                  <div style={{marginTop:8,background:"#fff8f2",border:"1.5px solid #E87722",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:OR,fontWeight:700,marginBottom:8}}>⚠️ PROFESORES SIMILARES — ¿Ya existe?</div>
                    {sugerencias.map(p=>(
                      <div key={p.id} className="card-tap"
                        onClick={()=>{setAddProfSel(p);setAddMode("curso")}}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderTop:"1px solid #fde8d0",cursor:"pointer"}}>
                        <Avatar name={p.nombre} fac={p.facultad} size={30}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div>
                          <div style={{fontSize:11,color:"#8a99b0"}}>{(p.cursos||[]).join(", ")}</div>
                        </div>
                        <span style={{fontSize:11,color:OR,fontWeight:700,flexShrink:0}}>Agregar curso →</span>
                      </div>
                    ))}
                    <div style={{fontSize:11,color:"#8a99b0",marginTop:8}}>Si no es ninguno, continúa con el nuevo profesor.</div>
                  </div>
                )}
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>Facultad del profesor</label>
                <select className="input" value={addProf.facultad} onChange={e=>setAddProf(p=>({...p,facultad:e.target.value}))}>
                  {FACULTADES_FORM.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>Curso que enseña</label>
                <input className="input" value={addProf.curso}
                  onChange={e=>setAddProf(p=>({...p,curso:e.target.value}))}
                  placeholder="Ej. Cálculo III" autoComplete="off"/>
                {cursosExistentes.length>0 && (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:11,color:"#8a99b0",marginBottom:6,fontWeight:700}}>CURSOS YA REGISTRADOS EN ESTA FACULTAD</div>
                    <div className="chip-scroll" style={{paddingBottom:2}}>
                      {cursosExistentes.map(c=>(
                        <span key={c} onClick={()=>setAddProf(p=>({...p,curso:c}))}
                          style={{background:addProf.curso===c?(FAC_COLOR[addProf.facultad]||BLUE):(FAC_BG[addProf.facultad]||BLUE_L),color:addProf.curso===c?"#fff":(FAC_COLOR[addProf.facultad]||BLUE_D),padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,border:"1px solid transparent"}}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>
                  Descripción <span style={{fontWeight:400,color:"#a0adb8"}}>(opcional)</span>
                </label>
                <input className="input" value={addProf.bio} onChange={e=>setAddProf(p=>({...p,bio:e.target.value}))} placeholder="Ej. Doctor con 10 años de experiencia."/>
              </div>

              {addProf.nombre && (
                <div style={{background:"#f7f9fc",borderRadius:12,padding:"12px 14px",border:"1px dashed #d0dcea"}}>
                  <div style={{fontSize:11,color:"#8a99b0",marginBottom:6,fontWeight:700}}>VISTA PREVIA</div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <Avatar name={addProf.nombre} fac={addProf.facultad} size={38}/>
                    <div><div style={{fontSize:13,fontWeight:700}}>{addProf.nombre}</div><div style={{fontSize:11,color:"#8a99b0"}}>{addProf.facultad}{addProf.curso&&` · ${addProf.curso}`}</div></div>
                  </div>
                </div>
              )}

              <button className="btn btn-blue" onClick={submitAddProf} style={{width:"100%",padding:15,fontSize:15}}>
                Agregar profesor ✓
              </button>
            </div>
          )}

          {/* Form agregar curso */}
          {addMode==="curso" && (
            <div className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>Buscar profesor existente</label>
                <input className="input" placeholder="Escribe el nombre del profesor..." autoComplete="off"
                  value={addProfSel?addProfSel.nombre:addProf.nombre}
                  onChange={e=>{setAddProf(p=>({...p,nombre:e.target.value}));setAddProfSel(null);}}/>
                {!addProfSel && addProf.nombre.length>=2 && (
                  <div style={{marginTop:6,border:"1.5px solid #d8e3ef",borderRadius:12,overflow:"hidden",background:"#fff",boxShadow:"0 4px 16px rgba(0,0,0,.1)"}}>
                    {profesores.filter(p=>similarity(p.nombre,addProf.nombre)>0.3)
                      .sort((a,b)=>similarity(b.nombre,addProf.nombre)-similarity(a.nombre,addProf.nombre))
                      .slice(0,5).map((p,i)=>(
                      <div key={p.id} onClick={()=>setAddProfSel(p)} className="card-tap"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderTop:i>0?"1px solid #edf1f7":"none",cursor:"pointer"}}>
                        <Avatar name={p.nombre} fac={p.facultad} size={32}/>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div><div style={{fontSize:11,color:"#8a99b0"}}>{(p.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {addProfSel && (
                <>
                  <div style={{background:FAC_BG[addProfSel.facultad]||BLUE_L,borderRadius:12,padding:"14px",border:`1.5px solid ${FAC_COLOR[addProfSel.facultad]||BLUE}25`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <Avatar name={addProfSel.nombre} fac={addProfSel.facultad} size={40}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700}}>{addProfSel.nombre}</div>
                        <div style={{fontSize:12,color:"#6b7a90"}}>{(addProfSel.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}</div>
                      </div>
                      <button className="btn btn-ghost" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>{setAddProfSel(null);setAddProf(p=>({...p,nombre:""}));}}>✕</button>
                    </div>
                    <div style={{fontSize:11,color:"#6b7a90",marginBottom:6,fontWeight:700}}>CURSOS ACTUALES</div>
                    <div className="chip-scroll" style={{paddingBottom:2}}>
                      {(addProfSel.cursos||[]).map(c=>(
                        <span key={c} style={{background:"#fff",padding:"4px 11px",borderRadius:20,fontSize:12,color:FAC_COLOR[addProfSel.facultad]||BLUE_D,fontWeight:600,border:`1px solid ${FAC_COLOR[addProfSel.facultad]||BLUE}25`,whiteSpace:"nowrap",flexShrink:0}}>📚 {c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:13,fontWeight:700,color:"#3a4a60",display:"block",marginBottom:7}}>Nuevo curso a agregar</label>
                    <input className="input" value={addCurso} onChange={e=>setAddCurso(e.target.value)} placeholder="Ej. Cálculo III" autoComplete="off"/>
                  </div>
                  <button className="btn btn-orange" onClick={submitAgregarCurso} style={{width:"100%",padding:15,fontSize:15}}>
                    Agregar curso a {addProfSel.nombre.split(" ")[0]}
                  </button>
                </>
              )}
              {!addProfSel && <div style={{textAlign:"center",padding:"20px 0",color:"#aaa",fontSize:13}}>Busca y selecciona un profesor</div>}
            </div>
          )}
        </div>

        <BottomNav page={page} setPage={p=>navigate(p)}/>
        {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ─── PAGE: PERFIL ───────────────────────────────────
  // ════════════════════════════════════════════════════
  if(page==="perfil" && selProf) return (
    <div style={{minHeight:"100vh",background:"#eef2f9",paddingBottom:80}}>
      <style>{css}</style>

      {/* Sticky topbar con back */}
      <Topbar
        title={selProf.nombre.split(" ").slice(0,2).join(" ")}
        onBack={()=>navigate("home")}
        action={
          <button onClick={()=>{const url=window.location.href;window.open(`https://wa.me/?text=${encodeURIComponent(`¿Conoces a ${selProf.nombre}? Mira sus reseñas en ProfesoresUCSUR 👇\n${url}`)}`, "_blank");}}
            style={{background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:10,color:"#fff",fontSize:18,padding:"6px 10px",cursor:"pointer",fontWeight:700}}>
            📲
          </button>
        }
      />

      {/* Hero del profe */}
      <div className="prof-hero">
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <Avatar name={selProf.nombre} fac={selProf.facultad} size={62}/>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:4,lineHeight:1.2}}>{selProf.nombre}</h2>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
              <span className="pill" style={{background:"rgba(255,255,255,.2)",color:"rgba(255,255,255,.9)",fontSize:10}}>
                {FAC_EMOJI[selProf.facultad]||""} {(selProf.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")}
              </span>
              {(selProf.cursos||[]).map(c=>(
                <span key={c} className="pill" style={{background:"rgba(255,255,255,.15)",color:"rgba(255,255,255,.8)",fontSize:10}}>📚 {c}</span>
              ))}
            </div>
            {selProf.bio && <p style={{fontSize:12,color:"rgba(255,255,255,.65)",lineHeight:1.5}}>{selProf.bio}</p>}
          </div>
        </div>

        {/* Rating grande */}
        <div style={{background:"rgba(255,255,255,.15)",borderRadius:12,padding:"12px 16px",marginTop:14,display:"flex",alignItems:"center",gap:16,border:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{flex:1}}>
            {CRIT.map(c=><CritBar key={c} label={CRIT_LABEL[c]} icon={CRIT_ICON[c]} value={critAvg[c]}/>)}
          </div>
          <div style={{flexShrink:0,textAlign:"center"}}>
            <div style={{color:"#fff",fontSize:38,fontWeight:800,lineHeight:1}}>★</div>
            <div style={{color:"#fff",fontSize:30,fontWeight:800,lineHeight:1}}>{globalRating>0?globalRating.toFixed(1):"—"}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginTop:3}}>{allR.length} reseñas</div>
            {globalRating>0 && <div style={{fontSize:11,color:OR,fontWeight:700,marginTop:2}}>{ratingLabel(globalRating)}</div>}
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>
        {/* CTA calificar */}
        <div style={{background:OR,borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:`0 3px 12px ${OR}50`}}
          onClick={()=>formRef.current?.scrollIntoView({behavior:"smooth"})}>
          <span style={{fontSize:24}}>✍️</span>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:14}}>¿Tuviste a {selProf.nombre.split(" ")[0]}?</div>
            <div style={{color:"rgba(255,255,255,.8)",fontSize:12}}>Deja tu reseña anónima · 100% privado</div>
          </div>
          <div style={{background:"rgba(255,255,255,.25)",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:800,fontSize:12}}>
            Calificar ↓
          </div>
        </div>

        {/* ─── Formulario reseña ─── */}
        <div ref={formRef} className="card" style={{padding:18,marginBottom:14,border:`2px solid ${OR}25`}}>
          <div style={{fontWeight:800,color:BLUE_D,fontSize:15,marginBottom:2}}>✍️ Reseña anónima</div>
          <div style={{fontSize:11,color:"#8a99b0",marginBottom:14}}>🔒 Sin nombre, sin cuenta, 100% privado</div>

          {/* Criterios 2x2 */}
          <div style={{fontSize:11,fontWeight:700,color:"#8a99b0",marginBottom:8,letterSpacing:.5}}>CRITERIOS (todos obligatorios)</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {CRIT.map(c=>(
              <div key={c} className={`crit-box${form[c]>0?" active":""}`}>
                <div style={{fontSize:11,color:"#6b7a90",marginBottom:6,fontWeight:600}}>{CRIT_ICON[c]} {CRIT_LABEL[c]}</div>
                <Stars value={form[c]} onChange={v=>setForm(prev=>({...prev,[c]:v}))} size={28} gap={3}/>
                {form[c]>0 && <div style={{fontSize:10,color:ratingColor(form[c]),fontWeight:700,marginTop:4}}>{ratingLabel(form[c])}</div>}
              </div>
            ))}
          </div>

          {/* Datos alumno */}
          <div style={{fontSize:11,fontWeight:700,color:"#8a99b0",marginBottom:8,letterSpacing:.5}}>TU INFORMACIÓN <span style={{fontWeight:400}}>(opcional)</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            <select className="input" value={form.facultadAlumno}
              onChange={e=>setForm(prev=>({...prev,facultadAlumno:e.target.value,carrera:""}))}>
              <option value="">🏫 Tu facultad (opcional)</option>
              {FACULTADES_FORM.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
            <select className="input" value={form.carrera}
              onChange={e=>setForm(prev=>({...prev,carrera:e.target.value}))}
              disabled={!form.facultadAlumno||carrerasForm.length===0}>
              <option value="">{form.facultadAlumno?"🎓 Tu carrera (opcional)":"Primero elige tu facultad"}</option>
              {carrerasForm.map(c=><option key={c} value={c}>{c}</option>)}
            </select>

            {/* Ciclo */}
            <div>
              <div style={{fontSize:12,color:"#6b7a90",fontWeight:600,marginBottom:7}}>📅 Tu ciclo actual</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <button key={n} onClick={()=>setForm(prev=>({...prev,ciclo:prev.ciclo===String(n)?"":String(n)}))}
                    style={{padding:"7px 14px",borderRadius:20,border:"1.5px solid",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:form.ciclo===String(n)?BLUE:"transparent",color:form.ciclo===String(n)?"#fff":"#8a99b0",borderColor:form.ciclo===String(n)?BLUE:"#d8e3ef",touchAction:"manipulation"}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Texto */}
          <div style={{fontSize:11,fontWeight:700,color:"#8a99b0",marginBottom:8,letterSpacing:.5}}>TU OPINIÓN (obligatorio)</div>
          <textarea className="textarea" value={form.texto}
            onChange={e=>setForm(prev=>({...prev,texto:e.target.value}))}
            placeholder="Cuéntales a otros alumnos cómo es este profesor: sus clases, su trato, los exámenes..."/>

          {formErr && <div style={{color:"#DC2626",fontSize:12,marginTop:10,background:"#fef2f2",padding:"9px 14px",borderRadius:10,border:"1px solid #fecaca"}}>{formErr}</div>}

          <button className="btn-cta" onClick={submitResena} style={{marginTop:14,width:"100%"}}>
            🔒 Publicar reseña anónima
          </button>
        </div>

        {/* Reseñas */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:15,fontWeight:800,color:BLUE_D}}>Reseñas ({allR.length})</span>
          {allR.length>0 && <span style={{fontSize:11,color:"#8a99b0"}}>Más recientes primero</span>}
        </div>

        {allR.length===0 && (
          <div className="card" style={{padding:36,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>📝</div>
            <div style={{color:"#aaa",fontSize:14,marginBottom:12}}>¡Sé el primero en dejar una reseña!</div>
            <button className="btn-cta" style={{fontSize:13,padding:"11px 20px"}} onClick={()=>formRef.current?.scrollIntoView({behavior:"smooth"})}>
              ✍️ Dejar la primera reseña
            </button>
          </div>
        )}

        {allR.map((r,idx)=>{
          const rAvg = avg(CRIT.map(c=>r.criterios[c]));
          const voto = votados[r.id];
          const yaVoto = !!voto;
          return(
            <div key={r.id} className="card fade-in" style={{padding:"14px 16px",marginBottom:10,animationDelay:`${idx*.04}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"#edf1f7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🎓</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1a2540"}}>
                      Anónimo
                      {r.facultadAlumno && <span style={{fontWeight:400,color:"#8a99b0",fontSize:11}}> · {(r.facultadAlumno||"").replace("Ciencias de la ","").replace("Ciencias ","")}</span>}
                    </div>
                    <div style={{fontSize:10,color:"#a0adb8",display:"flex",gap:5,flexWrap:"wrap"}}>
                      <span>🕐 {formatFecha(r.createdAt)}</span>
                      {r.carrera && <span>· 🎓 {r.carrera}</span>}
                      {r.ciclo && <span>· Ciclo {r.ciclo}</span>}
                    </div>
                  </div>
                </div>
                <span style={{background:`${ratingColor(rAvg)}15`,color:ratingColor(rAvg),fontWeight:800,fontSize:14,padding:"3px 10px",borderRadius:10,flexShrink:0}}>★ {rAvg.toFixed(1)}</span>
              </div>

              {/* Mini criterios */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                {CRIT.map(c=>(
                  <span key={c} style={{background:"#f3f6fb",borderRadius:8,padding:"3px 8px",fontSize:11,color:"#5a6a80"}}>
                    {CRIT_ICON[c]} <strong style={{color:ratingColor(r.criterios[c])}}>{r.criterios[c]}</strong>
                  </span>
                ))}
              </div>

              <p style={{fontSize:14,color:"#2d3a50",lineHeight:1.7}}>{r.texto}</p>
              <Divider/>

              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#8a99b0"}}>¿Útil?</span>
                <button style={{background:voto==="util"?"#deeaf8":"#f3f6fb",border:`1.5px solid ${voto==="util"?BLUE:"#e2eaf5"}`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:yaVoto?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:4,fontWeight:700,color:voto==="util"?BLUE:"#6b7a90",opacity:yaVoto&&voto!=="util"?.45:1,fontFamily:"inherit",touchAction:"manipulation"}}
                  onClick={()=>toggleUtil(selProf.id,r.id,"util")} disabled={yaVoto}>
                  👍 {r.util||0}{voto==="util"&&" ✓"}
                </button>
                <button style={{background:voto==="noUtil"?"#fef2f2":"#f3f6fb",border:`1.5px solid ${voto==="noUtil"?"#DC2626":"#e2eaf5"}`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:yaVoto?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:4,fontWeight:700,color:voto==="noUtil"?"#DC2626":"#6b7a90",opacity:yaVoto&&voto!=="noUtil"?.45:1,fontFamily:"inherit",touchAction:"manipulation"}}
                  onClick={()=>toggleUtil(selProf.id,r.id,"noUtil")} disabled={yaVoto}>
                  👎 {r.noUtil||0}{voto==="noUtil"&&" ✓"}
                </button>
                <button style={{marginLeft:"auto",background:"none",border:`1.5px solid ${reportes.some(x=>x.resId===r.id)?"#fecaca":"#e2eaf5"}`,borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer",color:reportes.some(x=>x.resId===r.id)?"#f87171":"#DC2626",fontFamily:"inherit",fontWeight:600,opacity:reportes.some(x=>x.resId===r.id)?.5:1,touchAction:"manipulation"}}
                  onClick={()=>reportarResena(selProf.id,r.id,r.texto,selProf.nombre)}
                  disabled={reportes.some(x=>x.resId===r.id)}>
                  🚨 {reportes.some(x=>x.resId===r.id)?"Reportada":"Reportar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );

  // ════════════════════════════════════════════════════
  // ─── PAGE: ADMIN ────────────────────────────────────
  // ════════════════════════════════════════════════════
  if(page==="admin") return (
    <div style={{minHeight:"100vh",background:"#eef2f9",paddingBottom:80}}>
      <style>{css}</style>
      <Topbar/>

      {!adminUser ? (
        <div style={{maxWidth:400,margin:"48px auto",padding:"0 16px"}}>
          <div className="card" style={{padding:28,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:10}}>🔐</div>
            <h2 style={{fontSize:18,fontWeight:800,color:BLUE_D,marginBottom:4}}>Panel de administrador</h2>
            <p style={{fontSize:13,color:"#8a99b0",marginBottom:20}}>Acceso restringido</p>
            <input className="input" type="email" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="Correo electrónico" style={{marginBottom:10}}/>
            <input className="input" type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
              onKeyDown={async e=>{if(e.key==="Enter"){setAdminLoading(true);try{await signInWithEmailAndPassword(auth,adminEmail,adminPass);setAdminEmail("");setAdminPass("");}catch(e){showToast("❌ Correo o contraseña incorrectos.");}finally{setAdminLoading(false);}}}}
              placeholder="Contraseña" style={{marginBottom:14}}/>
            <button className="btn btn-blue" style={{width:"100%",padding:14}} disabled={adminLoading}
              onClick={async()=>{setAdminLoading(true);try{await signInWithEmailAndPassword(auth,adminEmail,adminPass);setAdminEmail("");setAdminPass("");}catch(e){showToast("❌ Correo o contraseña incorrectos.");}finally{setAdminLoading(false);}}}>
              {adminLoading?"Iniciando sesión...":"Ingresar →"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{padding:"20px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div className="section-title">⚙️ Admin</div>
              <div style={{fontSize:11,color:"#8a99b0"}}>{adminUser.email}</div>
            </div>
            <button className="btn btn-ghost" style={{fontSize:12,padding:"8px 14px"}}
              onClick={async()=>{await signOut(auth);navigate("home");}}>
              Cerrar sesión
            </button>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
            {[{label:"Profesores",n:profesores.length,icon:"👨‍🏫",color:BLUE},
              {label:"Reseñas",n:todasResenas.length,icon:"💬",color:OR},
              {label:"Reportes",n:reportes.length,icon:"🚨",color:"#DC2626"}].map(s=>(
              <div key={s.label} className="card" style={{padding:"12px 14px",borderLeft:`3px solid ${s.color}`}}>
                <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.n}</div>
                <div style={{fontSize:10,color:"#8a99b0"}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Reportes */}
          {reportes.length>0 && (
            <>
              <div style={{fontSize:14,fontWeight:800,color:"#DC2626",marginBottom:10}}>🚨 Reseñas reportadas ({reportes.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
                {reportes.map(rep=>{
                  const prof = profesores.find(p=>p.id===rep.profId);
                  const resena = (resenas[rep.profId]||[]).find(r=>r.id===rep.resId);
                  return(
                    <div key={rep.id} className="card" style={{padding:"14px 16px",border:"1.5px solid #fecaca"}}>
                      <div style={{fontSize:12,color:"#DC2626",fontWeight:700,marginBottom:6}}>🚨 {prof?.nombre||"Profesor eliminado"}</div>
                      <p style={{fontSize:13,color:"#2d3a50",lineHeight:1.5,marginBottom:8}}>{rep.texto}</p>
                      {rep.fecha && <div style={{fontSize:11,color:"#a0adb8",marginBottom:10}}>🕐 {formatFecha(rep.fecha)}</div>}
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn btn-red" style={{flex:1,fontSize:12,padding:"8px"}}
                          onClick={async()=>{try{if(resena&&prof)await eliminarResena(prof,resena);await deleteDoc(doc(db,"reportes",rep.id));showToast("🗑️ Reseña eliminada.");}catch(e){showToast("❌ Error al eliminar.");}}}>
                          🗑️ Eliminar
                        </button>
                        <button className="btn btn-ghost" style={{flex:1,fontSize:12,padding:"8px"}}
                          onClick={async()=>{await deleteDoc(doc(db,"reportes",rep.id));showToast("✅ Reporte descartado.");}}>
                          Ignorar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Profesores */}
          <div style={{fontSize:14,fontWeight:800,color:BLUE_D,marginBottom:10}}>Profesores registrados</div>
          <div className="card" style={{padding:"4px 0",marginBottom:18}}>
            {profesores.map((p,i)=>(
              <div key={p.id} style={{borderTop:i>0?"1px solid #edf1f7":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px"}}>
                  <Avatar name={p.nombre} fac={p.facultad} size={36}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700}}>{p.nombre}</div>
                    <div style={{fontSize:11,color:"#8a99b0",marginBottom:5}}>{(p.facultad||"").replace("Ciencias de la ","").replace("Ciencias ","")} · {p.totalReseñas||0} reseñas</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(p.cursos||[]).map(c=>(
                        <span key={c} style={{background:"#f3f6fb",padding:"3px 8px",borderRadius:20,fontSize:11,color:"#5a6a80",display:"inline-flex",alignItems:"center",gap:3}}>
                          📚 {c}
                          <span onClick={()=>eliminarCurso(p,c)} style={{cursor:"pointer",color:"#DC2626",fontWeight:700,fontSize:12}}>✕</span>
                        </span>
                      ))}
                      <span onClick={()=>{setEditCursoProf(p.id);setEditCursoVal("");}}
                        style={{background:BLUE_L,padding:"3px 10px",borderRadius:20,fontSize:11,color:BLUE,cursor:"pointer",fontWeight:700}}>+ Curso</span>
                    </div>
                    {editCursoProf===p.id && (
                      <div style={{display:"flex",gap:6,marginTop:8}}>
                        <input className="input" value={editCursoVal} onChange={e=>setEditCursoVal(e.target.value)}
                          placeholder="Nombre del curso..." style={{fontSize:12,padding:"7px 10px"}}
                          onKeyDown={e=>{if(e.key==="Enter")adminAgregarCurso(p);}}/>
                        <button className="btn btn-green" style={{fontSize:12,padding:"7px 12px",flexShrink:0}} onClick={()=>adminAgregarCurso(p)}>✓</button>
                        <button className="btn btn-ghost" style={{fontSize:12,padding:"7px 12px",flexShrink:0}} onClick={()=>setEditCursoProf(null)}>✕</button>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,alignItems:"flex-end"}}>
                    <RatingChip r={p.rating}/>
                    <button className="btn btn-red" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>eliminarProfesor(p)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reseñas recientes */}
          <div style={{fontSize:14,fontWeight:800,color:BLUE_D,marginBottom:10}}>Reseñas recientes ({todasResenas.length})</div>
          {todasResenas.length===0 && <div style={{textAlign:"center",color:"#aaa",fontSize:13,padding:"16px 0"}}>Cargando reseñas...</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {todasResenas.map(r=>{
              const rAvg = avg(CRIT.map(c=>r.criterios[c]));
              const prof = profesores.find(p=>p.id===r.profId);
              return(
                <div key={r.id} className="card" style={{padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
                  <Avatar name={r.profNombre||"?"} fac={r.profFac||""} size={32}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700}}>{r.profNombre}</span>
                      <span style={{background:`${ratingColor(rAvg)}15`,color:ratingColor(rAvg),fontWeight:700,fontSize:12,padding:"2px 8px",borderRadius:8}}>★ {rAvg.toFixed(1)}</span>
                      {r.ciclo && <span style={{fontSize:10,color:"#8a99b0"}}>Ciclo {r.ciclo}</span>}
                    </div>
                    <p style={{fontSize:12,color:"#2d3a50",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>{r.texto}</p>
                    <div style={{fontSize:10,color:"#a0adb8"}}>🕐 {formatFecha(r.createdAt)}</div>
                  </div>
                  <button className="btn btn-red" style={{fontSize:11,padding:"5px 10px",flexShrink:0}} onClick={()=>eliminarResena(prof||r.profId,r)}>🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav page={page} setPage={p=>navigate(p)}/>
      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );

  return null;
}