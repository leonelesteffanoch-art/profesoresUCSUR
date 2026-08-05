import { useState, useEffect, useRef } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, COL_RESENAS } from "./services/firebase.js";
import { FORM_EMPTY, ADD_EMPTY, FRASES_INICIO, CRIT } from "./constants.js";
import { calcRating } from "./utils/helpers.js";

import "./index.css";
import { Header } from "./components/Header.jsx";
import { Toast } from "./components/UI/Toast.jsx";
import { Home } from "./pages/Home.jsx";
import { Ranking } from "./pages/Ranking.jsx";
import { Agregar } from "./pages/Agregar.jsx";
import { Perfil } from "./pages/Perfil.jsx";
import { Admin } from "./pages/Admin.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const [profesores, setProfesores] = useState([]);
  const [resenas, setResenas] = useState({});
  const [carreras, setCarreras] = useState({});
  const [selProf, setSelProf] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [facFiltro, setFacFiltro] = useState("Todas");
  const [sortBy, setSortBy] = useState("rating");
  const [form, setForm] = useState(FORM_EMPTY);
  const [formErr, setFormErr] = useState("");
  const [addProf, setAddProf] = useState(ADD_EMPTY);
  const [addMode, setAddMode] = useState("nuevo");
  const [addProfSel, setAddProfSel] = useState(null);
  const [addCurso, setAddCurso] = useState("");
  const [toast, setToast] = useState(null);
  const [rankTab, setRankTab] = useState("top");
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [fraseInicio, setFraseInicio] = useState(FRASES_INICIO[0]);
  const [editCursoProf, setEditCursoProf] = useState(null);
  const [editCursoVal, setEditCursoVal] = useState("");
  const [todasResenas, setTodasResenas] = useState([]);
  
  // votados: { [resId]: "util" | "noUtil" } — persiste en localStorage
  const [votados, setVotados] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rmp_votes") || "{}"); }
    catch { return {}; }
  });
  
  const formRef = useRef();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profesores"), snap => {
      setProfesores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "carreras"), snap => {
      if (snap.exists()) setCarreras(snap.data());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selProf) return;
    const q = query(collection(db, "profesores", selProf.id, COL_RESENAS), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setResenas(prev => ({ ...prev, [selProf.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    });
    return () => unsub();
  }, [selProf]);

  useEffect(() => {
    if (!adminUser || profesores.length === 0) return;
    const unsubs = profesores.map(p => {
      const q = query(collection(db, "profesores", p.id, COL_RESENAS), orderBy("createdAt", "desc"));
      return onSnapshot(q, snap => {
        const rs = snap.docs.map(d => ({ id: d.id, profId: p.id, profNombre: p.nombre, profFac: p.facultad, ...d.data() }));
        setTodasResenas(prev => {
          const sinEste = prev.filter(r => r.profId !== p.id);
          return [...sinEste, ...rs].sort((a, b) => {
            const ta = a.createdAt?.toDate?.()?.getTime() || 0;
            const tb = b.createdAt?.toDate?.()?.getTime() || 0;
            return tb - ta;
          });
        });
        setResenas(prev => ({ ...prev, [p.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [adminUser, profesores.length]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reportes"), snap => {
      setReportes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setAdminUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (page === "home") setFraseInicio(FRASES_INICIO[Math.floor(Math.random() * FRASES_INICIO.length)]);
  }, [page]);

  const showToast = msg => setToast(msg);

  const navigate = (p, prof = null) => {
    setPage(p); setFormErr(""); setForm(FORM_EMPTY);
    setAddProf(ADD_EMPTY); setAddMode("nuevo"); setAddProfSel(null); setAddCurso("");
    if (prof) setSelProf(prof);
    window.scrollTo(0, 0);
  };

  const submitResena = async () => {
    if (!form.texto.trim() || CRIT.some(c => form[c] === 0)) {
      setFormErr("Completa todos los criterios y escribe un comentario.");
      return;
    }
    try {
      const r = {
        texto: form.texto,
        criterios: { claridad: form.claridad, puntualidad: form.puntualidad, trato: form.trato, examenes: form.examenes },
        facultadAlumno: form.facultadAlumno || "",
        carrera: form.carrera || "",
        ciclo: form.ciclo || "",
        util: 0, noUtil: 0, createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "profesores", selProf.id, COL_RESENAS), r);
      const allR = [r, ...(resenas[selProf.id] || [])];
      await updateDoc(doc(db, "profesores", selProf.id), { rating: calcRating(allR), totalReseñas: allR.length });
      setForm(FORM_EMPTY); setFormErr("");
      showToast("✅ ¡Reseña publicada de forma anónima!");
    } catch (e) { showToast("❌ Error al publicar. Verifica tu conexión."); }
  };

  const submitAddProf = async () => {
    if (!addProf.nombre.trim()) { showToast("⚠️ Escribe el nombre del profesor."); return; }
    if (!addProf.curso.trim()) { showToast("⚠️ Escribe al menos un curso."); return; }
    
    // Import helper dynamically just for this function to avoid circular deps or complex imports if needed
    const { similarity } = await import("./utils/helpers.js");
    
    const similar = profesores.find(p => similarity(p.nombre, addProf.nombre) > 0.85);
    if (similar) { 
      showToast(`⚠️ Ya existe "${similar.nombre}". ¿Quisiste agregar un curso?`); 
      setAddProfSel(similar); 
      setAddMode("curso"); 
      setAddCurso(addProf.curso); 
      return; 
    }
    try {
      await addDoc(collection(db, "profesores"), { 
        nombre: addProf.nombre.trim(), 
        facultad: addProf.facultad, 
        cursos: [addProf.curso.trim()], 
        bio: addProf.bio.trim() || "Profesor de la Universidad Científica del Sur.", 
        rating: 0, 
        totalReseñas: 0, 
        createdAt: serverTimestamp() 
      });
      showToast("✅ ¡Profesor agregado!");
      setTimeout(() => navigate("home"), 1200);
    } catch (e) { showToast("❌ Error al agregar. Verifica tu conexión."); }
  };

  const submitAgregarCurso = async () => {
    if (!addProfSel) return;
    if (!addCurso.trim()) { showToast("⚠️ Escribe el nombre del curso."); return; }
    if ((addProfSel.cursos || []).map(c => c.toLowerCase()).includes(addCurso.trim().toLowerCase())) { showToast("⚠️ Ese curso ya está registrado."); return; }
    try {
      await updateDoc(doc(db, "profesores", addProfSel.id), { cursos: [...(addProfSel.cursos || []), addCurso.trim()] });
      showToast(`✅ Curso "${addCurso.trim()}" agregado a ${addProfSel.nombre}`);
      setTimeout(() => navigate("home"), 1200);
    } catch (e) { showToast("❌ Error al agregar el curso."); }
  };

  const eliminarCurso = async (prof, curso) => {
    if (!window.confirm(`¿Eliminar el curso "${curso}" de ${prof.nombre}?`)) return;
    try {
      await updateDoc(doc(db, "profesores", prof.id), { cursos: (prof.cursos || []).filter(c => c !== curso) });
      showToast("✅ Curso eliminado.");
    } catch (e) { showToast("❌ Error al eliminar el curso."); }
  };

  const adminAgregarCurso = async (prof) => {
    if (!editCursoVal.trim()) { showToast("⚠️ Escribe el nombre del curso."); return; }
    if ((prof.cursos || []).map(c => c.toLowerCase()).includes(editCursoVal.trim().toLowerCase())) { showToast("⚠️ Ese curso ya existe."); return; }
    try {
      await updateDoc(doc(db, "profesores", prof.id), { cursos: [...(prof.cursos || []), editCursoVal.trim()] });
      setEditCursoProf(null); setEditCursoVal("");
      showToast("✅ Curso agregado.");
    } catch (e) { showToast("❌ Error al agregar el curso."); }
  };

  const toggleUtil = async (profId, resId, tipo) => {
    if (votados[resId]) return;
    const r = resenas[profId]?.find(x => x.id === resId); if (!r) return;
    try {
      await updateDoc(doc(db, "profesores", profId, COL_RESENAS, resId), { [tipo]: (r[tipo] || 0) + 1 });
      const nuevos = { ...votados, [resId]: tipo };
      setVotados(nuevos);
      localStorage.setItem("rmp_votes", JSON.stringify(nuevos));
    } catch (e) { showToast("❌ Error al registrar tu voto."); }
  };

  const eliminarProfesor = async (p) => {
    if (!window.confirm(`¿Eliminar a ${p.nombre} y todas sus reseñas?`)) return;
    try {
      const rSnap = await getDocs(collection(db, "profesores", p.id, COL_RESENAS));
      for (const r of rSnap.docs) await deleteDoc(doc(db, "profesores", p.id, COL_RESENAS, r.id));
      await deleteDoc(doc(db, "profesores", p.id));
      showToast(`🗑️ ${p.nombre} eliminado.`);
    } catch (e) { showToast("❌ Error al eliminar."); }
  };

  const eliminarResena = async (p, r) => {
    if (!window.confirm("¿Eliminar esta reseña?")) return;
    try {
      const profObj = typeof p === "string" ? profesores.find(x => x.id === p) : p;
      if (!profObj) return;
      await deleteDoc(doc(db, "profesores", profObj.id, COL_RESENAS, r.id));
      const remaining = (resenas[profObj.id] || []).filter(x => x.id !== r.id);
      const newRating = calcRating(remaining);
      await updateDoc(doc(db, "profesores", profObj.id), { rating: newRating, totalReseñas: remaining.length });
      setResenas(prev => ({ ...prev, [profObj.id]: remaining }));
      setTodasResenas(prev => prev.filter(x => x.id !== r.id));
      setProfesores(prev => prev.map(x => x.id === profObj.id ? { ...x, rating: newRating, totalReseñas: remaining.length } : x));
      showToast("🗑️ Reseña eliminada.");
    } catch (e) { showToast("❌ Error al eliminar."); }
  };

  const reportarResena = async (profId, resId, texto, profNombre) => {
    if (!window.confirm("¿Reportar esta reseña como inapropiada o falsa?")) return;
    if (reportes.some(r => r.resId === resId)) { showToast("⚠️ Esta reseña ya fue reportada."); return; }
    try {
      await addDoc(collection(db, "reportes"), { profId, resId, texto, profNombre, fecha: serverTimestamp(), estado: "pendiente" });
      showToast("⚠️ Reseña reportada. La revisaremos pronto.");
    } catch (e) { showToast("❌ Error al enviar el reporte. Verifica tu conexión."); }
  };

  const allR = selProf ? (resenas[selProf.id] || []) : [];
  const critAvg = CRIT.reduce((acc, c) => ({ ...acc, [c]: allR.length ? (allR.reduce((a, b) => a + b.criterios[c], 0) / allR.length) : 0 }), {});
  const globalRating = calcRating(allR);
  const carrerasForm = form.facultadAlumno ? (carreras[form.facultadAlumno] || []) : [];

  return (
    <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Header page={page} navigate={navigate} />
      
      {page === "home" && (
        <Home 
          fraseInicio={fraseInicio}
          busqueda={busqueda} setBusqueda={setBusqueda}
          profesores={profesores}
          facFiltro={facFiltro} setFacFiltro={setFacFiltro}
          sortBy={sortBy} setSortBy={setSortBy}
          loading={loading}
          navigate={navigate}
        />
      )}

      {page === "ranking" && (
        <Ranking 
          profesores={profesores}
          rankTab={rankTab} setRankTab={setRankTab}
          navigate={navigate}
        />
      )}

      {page === "agregar" && (
        <Agregar 
          profesores={profesores}
          addMode={addMode} setAddMode={setAddMode}
          addProf={addProf} setAddProf={setAddProf}
          addProfSel={addProfSel} setAddProfSel={setAddProfSel}
          addCurso={addCurso} setAddCurso={setAddCurso}
          submitAddProf={submitAddProf}
          submitAgregarCurso={submitAgregarCurso}
        />
      )}

      {page === "perfil" && selProf && (
        <Perfil 
          selProf={selProf}
          navigate={navigate}
          allR={allR}
          globalRating={globalRating}
          critAvg={critAvg}
          form={form} setForm={setForm}
          formErr={formErr}
          submitResena={submitResena}
          carrerasForm={carrerasForm}
          votados={votados} toggleUtil={toggleUtil}
          reportes={reportes} reportarResena={reportarResena}
          formRef={formRef}
        />
      )}

      {page === "admin" && (
        <Admin 
          adminUser={adminUser}
          adminEmail={adminEmail} setAdminEmail={setAdminEmail}
          adminPass={adminPass} setAdminPass={setAdminPass}
          adminLoading={adminLoading} setAdminLoading={setAdminLoading}
          profesores={profesores}
          todasResenas={todasResenas}
          reportes={reportes}
          navigate={navigate}
          showToast={showToast}
          eliminarResena={eliminarResena}
          eliminarProfesor={eliminarProfesor}
          eliminarCurso={eliminarCurso}
          adminAgregarCurso={adminAgregarCurso}
          editCursoProf={editCursoProf} setEditCursoProf={setEditCursoProf}
          editCursoVal={editCursoVal} setEditCursoVal={setEditCursoVal}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}