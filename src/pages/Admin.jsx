import { useState, useMemo } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase.js";
import { B, BD, OR, CRIT, SEDES, FACULTADES, FAC_COLOR, FAC_EMOJI } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { formatFecha, avg, ratingColor, normalizeText, capitalizeName, formatCourseName, normalizeCourseKey, scoreCourseQuality, similarity } from "../utils/helpers.js";

// Extrae el número o número romano de un curso (si tiene) para nunca agrupar "Cálculo I" con "Cálculo II"
const extractCourseNumber = (course) => {
  const key = normalizeCourseKey(course);
  const nums = key.match(/\b([1-9]|10)\b/g);
  return nums ? nums.join("-") : "";
};

export default function Admin({
  adminUser,
  adminEmail, setAdminEmail,
  adminPass, setAdminPass,
  adminLoading, setAdminLoading,
  profesores,
  todasResenas,
  cargarTodasLasResenas,
  reportes,
  noticias,
  feedbacks,
  solicitudes,
  navigate,
  showToast,
  eliminarResena,
  eliminarProfesor,
  eliminarCurso,
  adminAgregarCurso,
  crearNoticia,
  eliminarNoticia,
  eliminarFeedback,
  destruirFeedback,
  responderFeedback,
  editarProfesor,
  editCursoProf, setEditCursoProf,
  editCursoVal, setEditCursoVal,
  fusionarCursosGlobal,
  autoUnificarCursosGlobal,
  eliminarCursoGlobal,
  dividirCursoGlobal,
  fusionarProfesores,
  aplicarSugerenciaFacultad,
  rechazarSugerenciaFacultad,
  limpiarTodasSugerencias
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [maintSubTab, setMaintSubTab] = useState("asistente");
  const [feedbackSubTab, setFeedbackSubTab] = useState("pending");

  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiContenido, setNotiContenido] = useState("");
  const [notiImagen, setNotiImagen] = useState("");
  const [notiLink, setNotiLink] = useState("");

  const [replyFeedbackId, setReplyFeedbackId] = useState(null);
  const [replyFeedbackText, setReplyFeedbackText] = useState("");

  const [editProfDetailsId, setEditProfDetailsId] = useState(null);
  const [editProfDetailsNombre, setEditProfDetailsNombre] = useState("");
  const [editProfDetailsBio, setEditProfDetailsBio] = useState("");
  const [editProfDetailsSedes, setEditProfDetailsSedes] = useState([]);
  const [editProfDetailsAlerta, setEditProfDetailsAlerta] = useState("");
  const [editProfDetailsFacultades, setEditProfDetailsFacultades] = useState([]);

  // Filtros Profesores
  const [busquedaAdmin, setBusquedaAdmin] = useState("");
  const [facFiltroAdmin, setFacFiltroAdmin] = useState("Todas");
  const [sedeFiltroAdmin, setSedeFiltroAdmin] = useState("Todas");
  const [quickFilterProf, setQuickFilterProf] = useState("todos"); // todos | sugerencias | alertas | sin_resenas
  const [ordenProfAdmin, setOrdenProfAdmin] = useState("rating_desc");

  // Filtros Reseñas
  const [busquedaResena, setBusquedaResena] = useState("");
  const [facFiltroResena, setFacFiltroResena] = useState("Todas");
  const [ordenResena, setOrdenResena] = useState("recientes");

  // Fusión y división de cursos
  const [fusionarCursoMalo, setFusionarCursoMalo] = useState("");
  const [fusionarCursoBueno, setFusionarCursoBueno] = useState("");
  const [dividirCursoSel, setDividirCursoSel] = useState("");
  const [dividirCursosNuevos, setDividirCursosNuevos] = useState("");

  // Catálogo Maestro de Cursos en Mantenimiento
  const [busquedaCatalogoCurso, setBusquedaCatalogoCurso] = useState("");
  const [renombrandoCurso, setRenombrandoCurso] = useState(null);
  const [nuevoNombreCurso, setNuevoNombreCurso] = useState("");

  const pendingReportes = reportes.filter(r => r.estado === "pendiente");
  const archivedReportes = reportes.filter(r => r.estado !== "pendiente");
  const pendingFeedbacks = feedbacks?.filter(f => f.estado !== "archivado") || [];
  const archivedFeedbacks = feedbacks?.filter(f => f.estado === "archivado") || [];
  const unrepliedFeedbacksCount = pendingFeedbacks.filter(f => !f.respuesta).length;
  const profsWithSugerenciasCount = profesores.filter(p => p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0).length;

  const allCursosAdmin = useMemo(() => {
    return [...new Set(profesores.flatMap(p => p.cursos || []))].sort((a, b) => a.localeCompare(b));
  }, [profesores]);

  const conteoCursos = useMemo(() => {
    const map = {};
    profesores.forEach(p => {
      (p.cursos || []).forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return map;
  }, [profesores]);

  // Diagnóstico inteligente pre-calculado para mostrar contadores en tiempo real
  const diagnostico = useMemo(() => {
    const keyMap = {};
    allCursosAdmin.forEach(c => {
      const k = normalizeCourseKey(c);
      if (!k) return;
      if (!keyMap[k]) keyMap[k] = [];
      keyMap[k].push(c);
    });

    const autoReemplazos = {};
    const autoCambiosLista = [];

    Object.values(keyMap).forEach(variantes => {
      const candidatos = [...variantes].sort((a, b) => {
        const diffScore = scoreCourseQuality(b) - scoreCourseQuality(a);
        if (diffScore !== 0) return diffScore;
        return (conteoCursos[b] || 0) - (conteoCursos[a] || 0);
      });
      const mejorExistente = candidatos[0];
      const formateado = formatCourseName(mejorExistente);
      const ganador = scoreCourseQuality(formateado) > scoreCourseQuality(mejorExistente) ? formateado : mejorExistente;

      variantes.forEach(v => {
        if (v !== ganador) {
          autoReemplazos[v] = ganador;
          autoCambiosLista.push({ de: v, a: ganador, profes: conteoCursos[v] || 0 });
        }
      });
    });

    const exactDuplicateGroups = Object.values(keyMap).filter(arr => arr.length > 1);
    const fuzzySimilarGroups = [];
    const keys = Object.keys(keyMap);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const repA = keyMap[keys[i]][0];
        const repB = keyMap[keys[j]][0];
        if (extractCourseNumber(repA) !== extractCourseNumber(repB)) continue;
        const sim = similarity(keys[i], keys[j]);
        if (sim >= 0.84 && sim < 1) {
          fuzzySimilarGroups.push([...keyMap[keys[i]], ...keyMap[keys[j]]]);
        }
      }
    }

    const profDuplicates = [];
    const normProfs = profesores.map(p => ({ ...p, normName: normalizeText(p.nombre) }));
    const getWordSet = name => new Set(name.split(" ").filter(w => w.length > 2));
    for (let i = 0; i < normProfs.length; i++) {
      for (let j = i + 1; j < normProfs.length; j++) {
        const set1 = getWordSet(normProfs[i].normName);
        const set2 = getWordSet(normProfs[j].normName);
        let common = 0;
        set1.forEach(w => { if (set2.has(w)) common++; });
        if (normProfs[i].normName === normProfs[j].normName || (common >= 2 && (common === set1.size || common === set2.size))) {
          profDuplicates.push({ p1: normProfs[i], p2: normProfs[j] });
        }
      }
    }

    const courseDuplicatesInProf = [];
    profesores.forEach(p => {
      const cMap = {};
      (p.cursos || []).forEach(c => {
        const nc = normalizeCourseKey(c);
        if (!cMap[nc]) cMap[nc] = [];
        cMap[nc].push(c);
      });
      Object.values(cMap).forEach(arr => {
        if (arr.length > 1) {
          courseDuplicatesInProf.push({ prof: p, courses: arr });
        }
      });
    });

    const uppercaseProfs = profesores.filter(p => p.nombre && p.nombre.trim().length > 0 && p.nombre.toUpperCase() === p.nombre && /[A-Z]/.test(p.nombre));
    const totalIssues = autoCambiosLista.length + fuzzySimilarGroups.length + profDuplicates.length + uppercaseProfs.length;

    return {
      autoReemplazos,
      autoCambiosLista,
      exactDuplicateGroups,
      fuzzySimilarGroups,
      profDuplicates,
      courseDuplicatesInProf,
      uppercaseProfs,
      totalIssues
    };
  }, [allCursosAdmin, conteoCursos, profesores]);

  const filteredProfesores = profesores
    .filter(p => normalizeText(p.nombre).includes(normalizeText(busquedaAdmin)) || p.cursos?.some(c => normalizeText(c).includes(normalizeText(busquedaAdmin))))
    .filter(p => facFiltroAdmin === "Todas" || p.facultades?.includes(facFiltroAdmin))
    .filter(p => sedeFiltroAdmin === "Todas" || (sedeFiltroAdmin === "Sin Sede" ? (!p.sedes || p.sedes.length === 0) : p.sedes?.includes(sedeFiltroAdmin)))
    .filter(p => {
      if (quickFilterProf === "sugerencias") return p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0;
      if (quickFilterProf === "alertas") return !!p.alerta;
      if (quickFilterProf === "sin_resenas") return (p.totalReseñas || 0) === 0;
      return true;
    })
    .sort((a, b) => {
      if (ordenProfAdmin === "rating_desc") return (b.rating || 0) - (a.rating || 0);
      if (ordenProfAdmin === "rating_asc") return (a.rating || 0) - (b.rating || 0);
      if (ordenProfAdmin === "resenas_desc") return (b.totalReseñas || 0) - (a.totalReseñas || 0);
      if (ordenProfAdmin === "nombre_asc") return a.nombre.localeCompare(b.nombre);
      return 0;
    });

  const filteredResenas = todasResenas
    .filter(r => r.texto?.toLowerCase().includes(busquedaResena.toLowerCase()) || r.profNombre?.toLowerCase().includes(busquedaResena.toLowerCase()))
    .filter(r => facFiltroResena === "Todas" || r.profFac === facFiltroResena)
    .sort((a, b) => {
      if (ordenResena === "recientes") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (ordenResena === "antiguas") return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      const avgA = avg(CRIT.map(c => a.criterios[c]));
      const avgB = avg(CRIT.map(c => b.criterios[c]));
      if (ordenResena === "rating_desc") return avgB - avgA;
      if (ordenResena === "rating_asc") return avgA - avgB;
      return 0;
    });

  const handleCrearNoticia = async () => {
    if (!notiTitulo.trim() || !notiContenido.trim()) {
      alert("Título y contenido son obligatorios.");
      return;
    }
    await crearNoticia(notiTitulo, notiContenido, notiImagen, notiLink);
    setNotiTitulo("");
    setNotiContenido("");
    setNotiImagen("");
    setNotiLink("");
  };

  const handleLogin = async () => {
    setAdminLoading(true);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      setAdminEmail("");
      setAdminPass("");
    } catch (e) {
      showToast("❌ Correo o contraseña incorrectos.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEliminarReporte = async (rep, resena, prof) => {
    try {
      if (resena && prof) await eliminarResena(prof, resena);
      const relatedReports = reportes.filter(r => r.resId === rep.resId && r.estado === "pendiente");
      for (const r of relatedReports) {
        await updateDoc(doc(db, "reportes", r.id), { estado: "borrada" });
      }
      if (relatedReports.length === 0) await updateDoc(doc(db, "reportes", rep.id), { estado: "borrada" });
      showToast("🗑️ Reseña eliminada (Reporte archivado).");
    } catch (e) {
      showToast("❌ Error al eliminar.");
    }
  };

  const handleIgnorarReporte = async (rep) => {
    try {
      const relatedReports = reportes.filter(r => r.resId === rep.resId && r.estado === "pendiente");
      for (const r of relatedReports) {
        await updateDoc(doc(db, "reportes", r.id), { estado: "ignorada" });
      }
      if (relatedReports.length === 0) await updateDoc(doc(db, "reportes", rep.id), { estado: "ignorada" });
      showToast("✅ Reporte descartado (Archivado).");
    } catch (e) {
      showToast("❌ Error al descartar.");
    }
  };

  const destruirReporte = async (id) => {
    try {
      await deleteDoc(doc(db, "reportes", id));
      showToast("🗑️ Reporte eliminado permanentemente.");
    } catch (e) { showToast("❌ Error al eliminar."); }
  };

  if (!adminUser) {
    return (
      <div style={{ maxWidth: 420, margin: "72px auto", padding: "0 16px" }}>
        <div className="card fade-in" style={{ padding: "40px 32px", textAlign: "center", boxShadow: "var(--shadow-lg)", borderTop: `5px solid ${B}` }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--light-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 18px" }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>Centro de Administración</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 28, fontWeight: 500 }}>Inicia sesión con tu cuenta de administrador UCSUR</p>
          <input className="input" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Correo electrónico" style={{ marginBottom: 12, padding: "14px 16px" }} />
          <input className="input" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
            placeholder="Contraseña" style={{ marginBottom: 18, padding: "14px 16px" }} />
          <button className="btn btn-blue" style={{ width: "100%", padding: 15, fontSize: 15 }} disabled={adminLoading} onClick={handleLogin}>
            {adminLoading ? "Verificando acceso..." : "Ingresar al Panel →"}
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Centro de Control", section: "GENERAL" },
    { id: "mantenimiento", icon: "🪄", label: "Cursos y Limpieza", badge: diagnostico.totalIssues, badgeColor: OR, section: "GENERAL" },
    { id: "profesores", icon: "👨‍🏫", label: "Profesores", badge: profsWithSugerenciasCount, badgeColor: "#F59E0B", section: "GESTIÓN" },
    { id: "resenas", icon: "💬", label: "Reseñas", section: "GESTIÓN" },
    { id: "solicitudes", icon: "🗳️", label: "Secciones Pedidas", badge: solicitudes?.length || 0, badgeColor: B, section: "GESTIÓN" },
    { id: "noticias", icon: "📰", label: "Noticias", section: "GESTIÓN" },
    { id: "reportes", icon: "🚨", label: "Reportes", badge: pendingReportes.length, badgeColor: "#EF4444", section: "MODERACIÓN" },
    { id: "feedbacks", icon: "💡", label: "Buzón Sugerencias", badge: unrepliedFeedbacksCount, badgeColor: "#EAB308", section: "MODERACIÓN" },
    { id: "archivo", icon: "🗃️", label: "Historial", section: "MODERACIÓN" }
  ];

  const totalResenasGlobal = profesores.reduce((sum, p) => sum + (p.totalReseñas || 0), 0);

  return (
    <div className="admin-shell">
      {/* SIDEBAR EN ESCRITORIO */}
      <aside className="card admin-sidebar">
        <div style={{ padding: "8px 10px 16px", borderBottom: "1px solid var(--border-color)", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${B}, ${BD})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
              ⚙️
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>Admin UCSUR</div>
              <div style={{ fontSize: 11, color: "var(--text-light)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminUser.email}</div>
            </div>
          </div>
        </div>

        {["GENERAL", "GESTIÓN", "MODERACIÓN"].map(sec => (
          <div key={sec} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-light)", padding: "6px 12px 4px", letterSpacing: 0.8 }}>{sec}</div>
            {navItems.filter(item => item.section === sec).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`admin-nav-btn${activeTab === item.id ? " active" : ""}`}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge > 0 && (
                  <span style={{
                    background: activeTab === item.id ? "#fff" : item.badgeColor,
                    color: activeTab === item.id ? B : "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 999
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: 12.5, padding: "10px" }}
            onClick={async () => { await signOut(auth); navigate("home"); }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ minWidth: 0 }}>
        {/* Barra superior compacta en Móvil */}
        <div className="admin-mobile-tabs custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="tab"
              style={{
                background: activeTab === item.id ? B : "var(--card-bg)",
                color: activeTab === item.id ? "#fff" : "var(--text-muted)",
                border: `1px solid ${activeTab === item.id ? B : "var(--border-color)"}`,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                flexShrink: 0
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: activeTab === item.id ? "#fff" : item.badgeColor,
                  color: activeTab === item.id ? B : "#fff",
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: 999
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 📊 TAB 1: DASHBOARD INTERACTIVO ("CENTRO DE CONTROL") */}
        {activeTab === "dashboard" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Banner de Bienvenida y Estado de Salud */}
            <div className="card" style={{ padding: "24px 26px", background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, color: "#fff", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  Panel de Control v2 · Tiempo Real
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>¡Hola, Administrador! 👋</h2>
                <p style={{ fontSize: 13.5, opacity: 0.88, maxWidth: 520, lineHeight: 1.5 }}>
                  Desde aquí puedes limpiar cursos duplicados en 1 clic, moderar reseñas y gestionar toda la comunidad de ProfesoresUCSUR.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => { setActiveTab("mantenimiento"); setMaintSubTab("asistente"); }}
                  className="btn"
                  style={{ background: OR, color: "#fff", fontWeight: 800, padding: "11px 18px", boxShadow: "0 6px 20px rgba(0,0,0,0.2)" }}
                >
                  🪄 Ir al Limpiador de Cursos ({diagnostico.autoCambiosLista.length})
                </button>
              </div>
            </div>

            {/* Tarjetas KPI Interactivas (Clic para ir a la sección) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
              {[
                { label: "Profesores", n: profesores.length, sub: `${profesores.filter(p => (p.totalReseñas || 0) === 0).length} sin reseñas`, icon: "👨‍🏫", color: B, tab: "profesores" },
                { label: "Cursos Únicos", n: allCursosAdmin.length, sub: diagnostico.autoCambiosLista.length > 0 ? `⚠️ ${diagnostico.autoCambiosLista.length} por unificar` : "✨ Catálogo limpio", icon: "📚", color: "#8B5CF6", tab: "mantenimiento" },
                { label: "Reseñas Totales", n: totalResenasGlobal, sub: todasResenas.length ? `${todasResenas.length} cargadas` : "Clic para inspeccionar", icon: "💬", color: "#059669", tab: "resenas" },
                { label: "Reportes Pendientes", n: pendingReportes.length, sub: pendingReportes.length > 0 ? "Requieren revisión" : "Todo en orden", icon: "🚨", color: "#DC2626", tab: "reportes" },
                { label: "Sugerencias Facultad", n: profsWithSugerenciasCount, sub: "Enviadas por alumnos", icon: "💡", color: "#F59E0B", tab: "profesores", action: () => { setActiveTab("profesores"); setQuickFilterProf("sugerencias"); } },
                { label: "Buzón sin responder", n: unrepliedFeedbacksCount, sub: `${pendingFeedbacks.length} activas en total`, icon: "🗣️", color: "#EAB308", tab: "feedbacks" }
              ].map(s => (
                <div
                  key={s.label}
                  onClick={() => s.action ? s.action() : setActiveTab(s.tab)}
                  className="card card-hover"
                  style={{ padding: "18px 20px", borderLeft: `5px solid ${s.color}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>Ver →</span>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.1 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dark)", fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Acciones Rápidas de Salud + Distribución por Facultad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
              {/* Tarjeta de Diagnóstico Rápido */}
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🩺</span> Diagnóstico Rápido de Base de Datos
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    {
                      label: "Cursos con variaciones o tildes faltantes",
                      count: diagnostico.autoCambiosLista.length,
                      okText: "0 variaciones pendientes",
                      go: () => { setActiveTab("mantenimiento"); setMaintSubTab("asistente"); }
                    },
                    {
                      label: "Cursos con nombres parecidos (posibles typos)",
                      count: diagnostico.fuzzySimilarGroups.length,
                      okText: "Sin typos detectados",
                      go: () => { setActiveTab("mantenimiento"); setMaintSubTab("asistente"); }
                    },
                    {
                      label: "Profesores posiblemente duplicados",
                      count: diagnostico.profDuplicates.length,
                      okText: "Sin profesores duplicados",
                      go: () => { setActiveTab("mantenimiento"); setMaintSubTab("profes_dup"); }
                    },
                    {
                      label: "Sugerencias de facultad por aprobar",
                      count: profsWithSugerenciasCount,
                      okText: "Al día",
                      go: () => { setActiveTab("profesores"); setQuickFilterProf("sugerencias"); }
                    }
                  ].map((item, idx) => (
                    <div key={idx} onClick={item.go} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "var(--ghost-bg)", borderRadius: 12, cursor: "pointer", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{item.label}</span>
                      {item.count > 0 ? (
                        <span style={{ background: `${OR}20`, color: OR, fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 999, flexShrink: 0 }}>
                          {item.count} →
                        </span>
                      ) : (
                        <span style={{ color: "#10b981", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>✓ {item.okText}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribución por Facultad */}
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🏫</span> Profesores por Facultad
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {FACULTADES.filter(f => f !== "Todas").map(f => {
                    const count = profesores.filter(p => p.facultades?.includes(f)).length;
                    const pct = profesores.length ? Math.round((count / profesores.length) * 100) : 0;
                    const c = FAC_COLOR[f] || B;
                    return (
                      <div key={f} onClick={() => { setActiveTab("profesores"); setFacFiltroAdmin(f); setQuickFilterProf("todos"); }} style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>
                          <span style={{ color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{FAC_EMOJI[f] || ""} {f}</span>
                          <span style={{ color: c, flexShrink: 0 }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: "var(--ghost-bg)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 999 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🪄 TAB 2: CURSOS Y LIMPIEZA (ORGANIZADO EN SUB-PESTAÑAS CLARAS) */}
        {activeTab === "mantenimiento" && (
          <div className="fade-in">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>🪄 Centro Inteligente de Cursos y Limpieza</h2>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Mantén el catálogo de cursos limpio, unifica duplicados en 1 clic sin perder relaciones con ningún profesor y edita cualquier curso.
              </p>
            </div>

            {/* Sub-navegación de Mantenimiento */}
            <div className="custom-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 22, paddingBottom: 4 }}>
              {[
                { id: "asistente", label: `🪄 Asistente 1-Clic (${diagnostico.autoCambiosLista.length + diagnostico.fuzzySimilarGroups.length})` },
                { id: "catalogo", label: `📚 Catálogo Maestro (${allCursosAdmin.length})` },
                { id: "manual", label: "🔗 Fusión / División Manual" },
                { id: "profes_dup", label: `👨‍🏫 Profes Duplicados (${diagnostico.profDuplicates.length + diagnostico.uppercaseProfs.length})` }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setMaintSubTab(st.id)}
                  className="tab"
                  style={{
                    background: maintSubTab === st.id ? "var(--text-dark)" : "var(--card-bg)",
                    color: maintSubTab === st.id ? "var(--bg-main)" : "var(--text-muted)",
                    border: "1px solid var(--border-color)",
                    whiteSpace: "nowrap"
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB A: ASISTENTE 1-CLIC */}
            {maintSubTab === "asistente" && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div className="card" style={{ padding: 24, border: `2px solid ${OR}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${OR}20`, color: OR, padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
                        ⚡ UNIFICACIÓN AUTOMÁTICA SEGURA
                      </div>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                        Auto-Unificar Variaciones y Tildes ({diagnostico.autoCambiosLista.length})
                      </h4>
                      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                        Unifica cursos que son exactamente el mismo pero varían en tildes (`Bioquimica` → `Bioquímica`) o números (`Calculo 1` / `Calculo Ii` → `Cálculo I`). Conserva todos los profesores y sus reseñas.
                      </p>
                    </div>
                    <button
                      className="btn btn-orange"
                      disabled={diagnostico.autoCambiosLista.length === 0 && diagnostico.courseDuplicatesInProf.length === 0}
                      onClick={() => {
                        const mapFinal = { ...diagnostico.autoReemplazos };
                        diagnostico.courseDuplicatesInProf.forEach(d => {
                          const best = [...d.courses].sort((a, b) => scoreCourseQuality(b) - scoreCourseQuality(a))[0];
                          d.courses.forEach(c => { if (c !== best) mapFinal[c] = best; });
                        });
                        autoUnificarCursosGlobal(
                          mapFinal,
                          `¿Aplicar ${diagnostico.autoCambiosLista.length} unificaciones automáticas de cursos en toda la base de datos?`
                        );
                      }}
                      style={{ padding: "13px 22px", fontSize: 14, flexShrink: 0 }}
                    >
                      🪄 Unificar Todo en 1 Clic ({diagnostico.autoCambiosLista.length})
                    </button>
                  </div>

                  {diagnostico.autoCambiosLista.length === 0 && diagnostico.courseDuplicatesInProf.length === 0 ? (
                    <div style={{ padding: "16px", background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13.5, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>✨</span> ¡Excelente! Todos los cursos tienen formato estandarizado, tildes y números romanos limpios.
                    </div>
                  ) : (
                    <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }} className="custom-scrollbar">
                      {diagnostico.autoCambiosLista.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ color: "#ef4444", textDecoration: "line-through", fontWeight: 600 }}>{item.de}</span>
                            <span style={{ color: "var(--text-light)" }}>→</span>
                            <span style={{ color: "#10b981", fontWeight: 800 }}>{item.a}</span>
                            <span style={{ fontSize: 11.5, color: "var(--text-light)", fontWeight: 600 }}>({item.profes} profe{item.profes === 1 ? "" : "s"})</span>
                          </div>
                          <button
                            className="btn btn-blue"
                            style={{ padding: "5px 12px", fontSize: 11.5 }}
                            onClick={() => fusionarCursosGlobal(item.de, item.a, true)}
                          >
                            Unificar este
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grupos de cursos parecidos o con typos */}
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
                    🔍 Cursos Duplicados o Muy Similares ({diagnostico.exactDuplicateGroups.length + diagnostico.fuzzySimilarGroups.length})
                  </h4>
                  <p style={{ color: "var(--text-light)", fontSize: 13, marginBottom: 18 }}>
                    Toca <b>"✅ Dejar este"</b> en el nombre que prefieras y todas las demás variantes del grupo se fusionarán hacia él automáticamente.
                  </p>

                  {diagnostico.exactDuplicateGroups.length === 0 && diagnostico.fuzzySimilarGroups.length === 0 ? (
                    <div style={{ padding: 16, background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13, color: "var(--text-muted)" }}>
                      No se detectaron grupos de cursos duplicados ni posibles errores de tipeo.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        ...diagnostico.exactDuplicateGroups.map(g => ({ group: g, tipo: "exacto" })),
                        ...diagnostico.fuzzySimilarGroups.map(g => ({ group: g, tipo: "similar" }))
                      ].map(({ group, tipo }, i) => (
                        <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 14, background: "var(--ghost-bg)" }}>
                          <div style={{ fontSize: 11.5, color: tipo === "exacto" ? "#ef4444" : OR, marginBottom: 10, fontWeight: 800, textTransform: "uppercase" }}>
                            {tipo === "exacto" ? "⚡ Mismo curso con distinta escritura:" : "🤔 Cursos muy parecidos (posible typo):"}
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {group.map((c, j) => (
                              <div key={j} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--border-color)", padding: "7px 12px", borderRadius: 12 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-dark)" }}>📚 {c}</span>
                                <span style={{ fontSize: 11.5, color: "var(--text-light)", fontWeight: 700 }}>({conteoCursos[c] || 0})</span>
                                <button
                                  className="btn btn-green"
                                  style={{ padding: "4px 10px", fontSize: 11.5, borderRadius: 8 }}
                                  onClick={() => {
                                    const map = {};
                                    group.forEach(other => { if (other !== c) map[other] = c; });
                                    autoUnificarCursosGlobal(map, `¿Unificar [${group.filter(x => x !== c).join(", ")}] hacia "${c}"?`);
                                  }}
                                >
                                  ✅ Dejar este
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB B: CATÁLOGO MAESTRO */}
            {maintSubTab === "catalogo" && (
              <div className="card fade-in" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>📚 Catálogo Maestro de Cursos ({allCursosAdmin.length})</h4>
                    <p style={{ color: "var(--text-light)", fontSize: 13, marginTop: 2 }}>
                      Renombra cualquier curso (si lo renombras al nombre de otro existente, ambos se fusionan automáticamente) o elimínalo.
                    </p>
                  </div>
                  <input
                    className="input"
                    placeholder="🔍 Buscar curso en el catálogo..."
                    value={busquedaCatalogoCurso}
                    onChange={e => setBusquedaCatalogoCurso(e.target.value)}
                    style={{ maxWidth: 280, padding: "10px 14px", fontSize: 13.5 }}
                  />
                </div>

                <div className="custom-scrollbar" style={{ maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                  {allCursosAdmin
                    .filter(c => normalizeText(c).includes(normalizeText(busquedaCatalogoCurso)))
                    .map(c => (
                      <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", background: "var(--ghost-bg)", borderRadius: 12, flexWrap: "wrap" }}>
                        {renombrandoCurso === c ? (
                          <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              className="input"
                              value={nuevoNombreCurso}
                              onChange={e => setNuevoNombreCurso(e.target.value)}
                              style={{ flex: 1, minWidth: 180, padding: "8px 12px", fontSize: 13.5 }}
                              autoFocus
                              onKeyDown={async e => {
                                if (e.key === "Enter" && nuevoNombreCurso.trim()) {
                                  const ok = await fusionarCursosGlobal(c, nuevoNombreCurso.trim(), true);
                                  if (ok) setRenombrandoCurso(null);
                                }
                              }}
                            />
                            <button className="btn btn-green" style={{ padding: "7px 14px", fontSize: 12 }} onClick={async () => {
                              if (!nuevoNombreCurso.trim()) return;
                              const ok = await fusionarCursosGlobal(c, nuevoNombreCurso.trim(), true);
                              if (ok) setRenombrandoCurso(null);
                            }}>Guardar</button>
                            <button className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setRenombrandoCurso(null)}>Cancelar</button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>📚 {c}</span>
                              <span style={{ fontSize: 11.5, background: "var(--card-bg)", padding: "2px 9px", borderRadius: 999, color: "var(--text-light)", fontWeight: 700, border: "1px solid var(--border-color)" }}>
                                {conteoCursos[c] || 0} profe{(conteoCursos[c] || 0) === 1 ? "" : "s"}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-ghost" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => { setRenombrandoCurso(c); setNuevoNombreCurso(c); }}>
                                ✏️ Renombrar
                              </button>
                              <button className="btn btn-ghost" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => { setDividirCursoSel(c); setMaintSubTab("manual"); }}>
                                ✂️ Dividir
                              </button>
                              <button className="btn btn-red" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => eliminarCursoGlobal(c)} title="Eliminar de todos los profesores">
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SUB-TAB C: FUSIÓN Y DIVISIÓN MANUAL */}
            {maintSubTab === "manual" && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>🔗 Fusionar dos Cursos Manualmente</h4>
                  <p style={{ color: "var(--text-light)", fontSize: 13.5, marginBottom: 20 }}>
                    Reemplaza el primer curso por el segundo en <b>todos</b> los profesores y solicitudes a la vez.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <input 
                      list="cursos-incorrectos-list"
                      className="input" 
                      placeholder="Curso a reemplazar..." 
                      value={fusionarCursoMalo} 
                      onChange={e => setFusionarCursoMalo(e.target.value)} 
                      style={{ flex: 1, minWidth: 200, padding: "12px 16px" }} 
                    />
                    <datalist id="cursos-incorrectos-list">
                      {allCursosAdmin.map(c => <option key={`malo-${c}`} value={c} />)}
                    </datalist>
                    <span style={{ color: "var(--text-muted)", fontSize: 18 }}>👉</span>
                    <input 
                      list="cursos-correctos-list"
                      className="input" 
                      placeholder="Curso destino correcto..." 
                      value={fusionarCursoBueno} 
                      onChange={e => setFusionarCursoBueno(e.target.value)} 
                      style={{ flex: 1, minWidth: 200, padding: "12px 16px" }} 
                    />
                    <datalist id="cursos-correctos-list">
                      {allCursosAdmin.map(c => <option key={`bueno-${c}`} value={c} />)}
                    </datalist>
                    <button className="btn btn-blue" disabled={!fusionarCursoMalo || !fusionarCursoBueno.trim()} onClick={async () => {
                      const ok = await fusionarCursosGlobal(fusionarCursoMalo, fusionarCursoBueno.trim());
                      if (ok) { setFusionarCursoMalo(""); setFusionarCursoBueno(""); }
                    }} style={{ padding: "12px 24px" }}>Fusionar Cursos</button>
                  </div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>✂️ Dividir Curso Compuesto</h4>
                  <p style={{ color: "var(--text-light)", fontSize: 13.5, marginBottom: 20 }}>
                    Si un alumno escribió dos cursos juntos en uno solo (ej. `"Matemática I y II"`), divídelo en sus cursos individuales separados por coma.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <select className="input" value={dividirCursoSel} onChange={e => setDividirCursoSel(e.target.value)} style={{ padding: "12px 16px" }}>
                      <option value="">Selecciona el curso a dividir...</option>
                      {allCursosAdmin.map(c => <option key={`div-${c}`} value={c}>{c}</option>)}
                    </select>
                    <input className="input" placeholder="Cursos separados por coma (ej: Matemática I, Matemática II)" value={dividirCursosNuevos} onChange={e => setDividirCursosNuevos(e.target.value)} style={{ padding: "12px 16px" }} />
                    {dividirCursosNuevos.trim() && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {dividirCursosNuevos.split(",").map(c => c.trim()).filter(Boolean).map((c, i) => (
                          <span key={i} style={{ background: "var(--light-blue)", color: "var(--primary-blue)", padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                            📚 {formatCourseName(c)}
                          </span>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-blue" disabled={!dividirCursoSel || !dividirCursosNuevos.trim()} onClick={async () => {
                      const nuevos = dividirCursosNuevos.split(",").map(c => formatCourseName(c.trim())).filter(Boolean);
                      if (nuevos.length < 2) { showToast("⚠️ Escribe al menos 2 cursos separados por coma."); return; }
                      const ok = await dividirCursoGlobal(dividirCursoSel, nuevos);
                      if (ok) { setDividirCursoSel(""); setDividirCursosNuevos(""); }
                    }} style={{ padding: "12px 24px", alignSelf: "flex-start" }}>Dividir Curso</button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB D: PROFESORES DUPLICADOS Y MAYÚSCULAS */}
            {maintSubTab === "profes_dup" && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
                    👨‍🏫 Posibles Profesores Duplicados ({diagnostico.profDuplicates.length})
                  </h4>
                  <p style={{ color: "var(--text-light)", fontSize: 13, marginBottom: 18 }}>
                    Al fusionar dos perfiles, todas las reseñas, cursos, sedes y facultades se combinan automáticamente en el perfil elegido.
                  </p>
                  {diagnostico.profDuplicates.length === 0 ? (
                    <div style={{ padding: 14, background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13, color: "var(--text-muted)" }}>
                      No se encontraron profesores duplicados.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {diagnostico.profDuplicates.map((d, i) => (
                        <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 14, background: "var(--ghost-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)" }}>
                              1️⃣ {d.p1.nombre} <span style={{ color: "var(--text-light)", fontWeight: 600, fontSize: 12 }}>({d.p1.totalReseñas || 0} reseñas · {(d.p1.cursos || []).join(", ")})</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", marginTop: 6 }}>
                              2️⃣ {d.p2.nombre} <span style={{ color: "var(--text-light)", fontWeight: 600, fontSize: 12 }}>({d.p2.totalReseñas || 0} reseñas · {(d.p2.cursos || []).join(", ")})</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button className="btn btn-blue" onClick={() => fusionarProfesores(d.p2, d.p1)} style={{ padding: "8px 14px", fontSize: 12 }}>
                              Dejar 1️⃣ (Absorber 2)
                            </button>
                            <button className="btn btn-ghost" onClick={() => fusionarProfesores(d.p1, d.p2)} style={{ padding: "8px 14px", fontSize: 12 }}>
                              Dejar 2️⃣ (Absorber 1)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 12 }}>
                    🔠 Nombres en Mayúsculas ({diagnostico.uppercaseProfs.length})
                  </h4>
                  {diagnostico.uppercaseProfs.length === 0 ? (
                    <div style={{ padding: 14, background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13, color: "var(--text-muted)" }}>
                      Todos los profesores tienen sus nombres correctamente capitalizados.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {diagnostico.uppercaseProfs.map((p, i) => (
                        <div key={i} style={{ padding: 14, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nombre} → <span style={{ color: "#10b981" }}>{capitalizeName(p.nombre)}</span></div>
                          <button className="btn btn-blue" onClick={() => editarProfesor(p.id, capitalizeName(p.nombre), p.bio || "", p.sede || "", p.alerta || "")} style={{ padding: "6px 14px", fontSize: 12 }}>
                            Corregir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 👨‍🏫 TAB 3: PROFESORES V2 */}
        {activeTab === "profesores" && (
          <div className="fade-in">
            <datalist id="admin-cursos-list">
              {allCursosAdmin.map(c => <option key={c} value={c} />)}
            </datalist>

            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                  👨‍🏫 Directorio de Profesores ({filteredProfesores.length})
                </h3>
                {/* Filtros rápidos tipo chip */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "sugerencias", label: `💡 Con sugerencias (${profsWithSugerenciasCount})` },
                    { id: "alertas", label: "⚠️ Con alerta" },
                    { id: "sin_resenas", label: "🆕 Sin reseñas" }
                  ].map(qf => (
                    <button
                      key={qf.id}
                      onClick={() => setQuickFilterProf(qf.id)}
                      className="pill"
                      style={{
                        cursor: "pointer",
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid var(--border-color)",
                        background: quickFilterProf === qf.id ? B : "var(--ghost-bg)",
                        color: quickFilterProf === qf.id ? "#fff" : "var(--text-muted)"
                      }}
                    >
                      {qf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                <input className="input" value={busquedaAdmin} onChange={e => setBusquedaAdmin(e.target.value)} placeholder="🔍 Buscar profe o curso..." style={{ padding: "10px 14px", fontSize: 13 }} />
                <select className="input" value={facFiltroAdmin} onChange={e => setFacFiltroAdmin(e.target.value)} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }}>
                  <option value="Todas">🏫 Todas las facultades</option>
                  {FACULTADES.filter(f => f !== "Todas").map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select className="input" value={sedeFiltroAdmin} onChange={e => setSedeFiltroAdmin(e.target.value)} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }}>
                  <option value="Todas">📍 Todas las sedes</option>
                  {SEDES.map(s => <option key={s} value={s}>Sede {s}</option>)}
                  <option value="Sin Sede">Sin sede</option>
                </select>
                <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={ordenProfAdmin} onChange={e => setOrdenProfAdmin(e.target.value)}>
                  <option value="rating_desc">⭐ Mejor calificación</option>
                  <option value="rating_asc">📉 Peor calificación</option>
                  <option value="resenas_desc">💬 Más reseñas</option>
                  <option value="nombre_asc">🔤 A - Z</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ padding: "6px 0" }}>
              {filteredProfesores.map((p, i) => (
                <div key={p.id} style={{ borderTop: i > 0 ? "1px solid var(--border-color)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", flexWrap: "wrap" }}>
                    <Avatar name={p.nombre} fac={p.facultad} size={48} />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      {editProfDetailsId === p.id ? (
                        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--ghost-bg)", padding: 16, borderRadius: 14, marginBottom: 10, border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: B, textTransform: "uppercase" }}>✏️ Editando Perfil de Profesor</div>
                          <input className="input" value={editProfDetailsNombre} onChange={e => setEditProfDetailsNombre(e.target.value)} placeholder="Nombre completo" style={{ fontSize: 14, fontWeight: 700, padding: "9px 12px" }} />
                          <textarea className="textarea" value={editProfDetailsBio} onChange={e => setEditProfDetailsBio(e.target.value)} placeholder="Biografía o descripción" style={{ fontSize: 13, padding: "9px 12px", minHeight: 60 }} />
                          <input className="input" value={editProfDetailsAlerta} onChange={e => setEditProfDetailsAlerta(e.target.value)} placeholder="⚠️ Alerta pública (dejar vacío si no aplica)" style={{ fontSize: 13, padding: "9px 12px", border: "1px solid #fecaca" }} />
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Sedes:</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {SEDES.map(s => {
                                const isSel = editProfDetailsSedes.includes(s);
                                return (
                                  <button key={s} className="pill" onClick={() => {
                                    if (isSel) setEditProfDetailsSedes(editProfDetailsSedes.filter(x => x !== s));
                                    else setEditProfDetailsSedes([...editProfDetailsSedes, s]);
                                  }} style={{ background: isSel ? B : "var(--card-bg)", color: isSel ? "#fff" : "var(--text-muted)", border: `1px solid ${B}`, padding: "4px 10px", fontSize: 11.5, cursor: "pointer" }}>
                                    📍 {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>Facultades:</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {FACULTADES.filter(f => f !== "Todas").map(f => {
                                const isSel = editProfDetailsFacultades.includes(f);
                                return (
                                  <button key={f} className="pill" onClick={() => {
                                    if (isSel) {
                                      const newF = editProfDetailsFacultades.filter(x => x !== f);
                                      if (newF.length > 0) setEditProfDetailsFacultades(newF);
                                    } else setEditProfDetailsFacultades([...editProfDetailsFacultades, f]);
                                  }} style={{ background: isSel ? B : "var(--card-bg)", color: isSel ? "#fff" : "var(--text-muted)", border: `1px solid ${B}`, padding: "4px 10px", fontSize: 11.5, cursor: "pointer" }}>
                                    {f}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button className="btn btn-green" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={async () => {
                              if (!editProfDetailsNombre.trim()) { showToast("⚠️ Escribe un nombre."); return; }
                              await editarProfesor(p.id, editProfDetailsNombre, editProfDetailsBio, "", editProfDetailsAlerta, editProfDetailsFacultades, editProfDetailsSedes);
                              setEditProfDetailsId(null);
                            }}>💾 Guardar cambios</button>
                            <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={() => setEditProfDetailsId(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 15.5, fontWeight: 800, color: "var(--text-dark)" }}>{p.nombre}</span>
                            <button onClick={() => {
                              setEditProfDetailsId(p.id);
                              setEditProfDetailsNombre(p.nombre);
                              setEditProfDetailsBio(p.bio || "");
                              setEditProfDetailsSedes(p.sedes || [p.sede].filter(Boolean));
                              setEditProfDetailsAlerta(p.alerta || "");
                              setEditProfDetailsFacultades(p.facultades || [p.facultad]);
                            }} className="pill" style={{ background: "var(--ghost-bg)", color: "var(--text-muted)", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11 }}>
                              ✏️ Editar
                            </button>
                          </div>
                          {p.alerta && <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 8, margin: "6px 0", display: "inline-block" }}>⚠️ {p.alerta}</div>}
                          <div style={{ fontSize: 12, color: "var(--text-light)", margin: "4px 0 8px", fontWeight: 600 }}>
                            {(p.facultades || [p.facultad]).join(", ")} {(p.sedes && p.sedes.length > 0) ? `· 📍 ${p.sedes.join(", ")}` : ""} · 💬 {p.totalReseñas || 0} reseñas
                          </div>

                          {p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0 && (
                            <div style={{ margin: "8px 0 10px", padding: 12, background: "rgba(245, 158, 11, 0.1)", borderRadius: 12, border: "1px solid rgba(245, 158, 11, 0.35)" }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: "#d97706", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>💡 Sugerencias de Facultad de Alumnos</span>
                                {Object.keys(p.recomendacionesFacultad).length > 1 && (
                                  <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => limpiarTodasSugerencias(p.id)}>
                                    Limpiar todas
                                  </button>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {Object.entries(p.recomendacionesFacultad).map(([fac, votos]) => (
                                  <div key={fac} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border-color)", flexWrap: "wrap", gap: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                                      {fac} <span style={{ background: "#f59e0b", color: "#fff", padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 800 }}>{votos} voto{votos === 1 ? "" : "s"}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <button className="btn btn-green" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => aplicarSugerenciaFacultad(p, fac)}>
                                        ✅ Aprobar
                                      </button>
                                      <button className="btn btn-red" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => rechazarSugerenciaFacultad(p.id, fac)}>
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {(p.cursos || []).map(c => (
                          <span key={c} style={{ background: "var(--ghost-bg)", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, border: "1px solid var(--border-color)" }}>
                            📚 {c}
                            <span onClick={() => eliminarCurso(p, c)} style={{ cursor: "pointer", color: "#ef4444", fontWeight: 800, fontSize: 13, lineHeight: 1, padding: "0 2px" }} title="Quitar curso">✕</span>
                          </span>
                        ))}
                        <button onClick={() => { setEditCursoProf(p.id); setEditCursoVal(""); }}
                          style={{ background: "var(--light-blue)", border: "none", padding: "4px 12px", borderRadius: 20, fontSize: 12, color: "var(--primary-blue)", cursor: "pointer", fontWeight: 800 }}>
                          + Curso
                        </button>
                      </div>

                      {editCursoProf === p.id && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <input list="admin-cursos-list" className="input" value={editCursoVal} onChange={e => setEditCursoVal(e.target.value)} placeholder="Nombre del curso..." style={{ fontSize: 13, padding: "8px 12px", flex: 1, minWidth: 160 }} onKeyDown={e => { if (e.key === "Enter") adminAgregarCurso(p); }} autoFocus />
                          <button className="btn btn-green" style={{ fontSize: 12.5, padding: "8px 14px" }} onClick={() => adminAgregarCurso(p)}>Guardar</button>
                          <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "8px 14px" }} onClick={() => setEditCursoProf(null)}>Cancelar</button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                      <RatingChip r={p.rating} />
                      <button className="btn btn-red" style={{ fontSize: 11.5, padding: "5px 11px" }} onClick={() => eliminarProfesor(p)}>🗑️ Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProfesores.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-light)", fontWeight: 600, fontSize: 14 }}>
                  No se encontraron profesores con esos filtros.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💬 TAB 4: RESEÑAS */}
        {activeTab === "resenas" && (
          <div className="fade-in">
            {todasResenas.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📥</div>
                <h4 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>Explorador Global de Reseñas</h4>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.5 }}>
                  Carga todas las reseñas de la plataforma en paralelo cuando necesites buscarlas, filtrarlas o auditarlas.
                </p>
                <button className="btn btn-blue" onClick={cargarTodasLasResenas} style={{ padding: "13px 26px", fontSize: 15, fontWeight: 800 }}>
                  ⚡ Cargar todas las reseñas ({totalResenasGlobal})
                </button>
              </div>
            ) : (
              <>
                <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    <input className="input" value={busquedaResena} onChange={e => setBusquedaResena(e.target.value)} placeholder="🔍 Buscar en comentario o profe..." style={{ padding: "10px 14px", fontSize: 13 }} />
                    <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={facFiltroResena} onChange={e => setFacFiltroResena(e.target.value)}>
                      <option value="Todas">Todas las facultades</option>
                      {FACULTADES.filter(f => f !== "Todas").map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={ordenResena} onChange={e => setOrdenResena(e.target.value)}>
                      <option value="recientes">🕒 Más recientes</option>
                      <option value="antiguas">⏳ Más antiguas</option>
                      <option value="rating_desc">⭐ Mejor calificación</option>
                      <option value="rating_asc">📉 Peor calificación</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredResenas.map(r => {
                    const rAvg = avg(CRIT.map(c => r.criterios[c]));
                    const prof = profesores.find(p => p.id === r.profId);
                    return (
                      <div key={r.id} className="card" style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <Avatar name={r.profNombre || "?"} fac={r.profFac || ""} size={42} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>{r.profNombre}</span>
                            <span style={{ background: `${ratingColor(rAvg)}18`, color: ratingColor(rAvg), fontWeight: 800, fontSize: 12.5, padding: "3px 9px", borderRadius: 8 }}>★ {rAvg.toFixed(1)}</span>
                            <span style={{ fontSize: 11.5, color: "var(--text-light)", fontWeight: 600 }}>🕐 {formatFecha(r.createdAt)}</span>
                          </div>
                          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 4 }}>{r.texto}</p>
                        </div>
                        <button className="btn btn-red" style={{ fontSize: 13, padding: "8px 12px", flexShrink: 0 }} onClick={() => eliminarResena(prof || r.profId, r)}>🗑️</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* 🚨 TAB 5: REPORTES */}
        {activeTab === "reportes" && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>
              🚨 Moderación de Reportes ({pendingReportes.length})
            </h2>
            {pendingReportes.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-light)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>¡Todo limpio! No hay reportes pendientes</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingReportes.map(rep => {
                  const prof = profesores.find(p => p.id === rep.profId);
                  const resena = (todasResenas || []).find(r => r.id === rep.resId);
                  return (
                    <div key={rep.id} className="card" style={{ padding: "20px", borderLeft: "5px solid #ef4444" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 800, marginBottom: 8 }}>
                            🚨 Reseña reportada en: {prof?.nombre || rep.profNombre || "Profesor"}
                          </div>
                          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, background: "var(--ghost-bg)", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                            "{rep.texto}"
                          </p>
                          {rep.fecha && <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 8, fontWeight: 600 }}>🕐 {formatFecha(rep.fecha)}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button className="btn btn-red" style={{ fontSize: 12.5, padding: "9px 16px" }} onClick={() => handleEliminarReporte(rep, resena, prof)}>
                            🗑️ Borrar Reseña
                          </button>
                          <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "9px 16px" }} onClick={() => handleIgnorarReporte(rep)}>
                            ✅ Descartar Reporte
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 💡 TAB 6: SUGERENCIAS / FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)" }}>💡 Buzón de la Comunidad</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tab" onClick={() => setFeedbackSubTab("pending")} style={{ background: feedbackSubTab === "pending" ? B : "var(--card-bg)", color: feedbackSubTab === "pending" ? "#fff" : "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                  Activas ({pendingFeedbacks.length})
                </button>
                <button className="tab" onClick={() => setFeedbackSubTab("archived")} style={{ background: feedbackSubTab === "archived" ? B : "var(--card-bg)", color: feedbackSubTab === "archived" ? "#fff" : "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                  Archivadas ({archivedFeedbacks.length})
                </button>
              </div>
            </div>

            {((feedbackSubTab === "archived" ? archivedFeedbacks : pendingFeedbacks) || []).length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-light)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>No hay mensajes en esta bandeja.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(feedbackSubTab === "archived" ? archivedFeedbacks : pendingFeedbacks).map(f => (
                  <div key={f.id} className="card" style={{ padding: "18px 22px", borderLeft: f.respuesta ? "4px solid #10b981" : "4px solid #eab308" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                        <p style={{ fontSize: 14.5, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap", background: "var(--ghost-bg)", padding: "12px 16px", borderRadius: 12 }}>
                          {f.mensaje}
                        </p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--text-light)", fontWeight: 600 }}>
                          <span>🕐 {formatFecha(f.createdAt)}</span>
                          {f.contacto && <span style={{ color: "var(--primary-blue)" }}>📩 Contacto: {f.contacto}</span>}
                        </div>
                        {f.respuesta && (
                          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: 12, borderRadius: 10, marginTop: 12, borderLeft: "3px solid #10b981" }}>
                            <div style={{ fontSize: 11.5, fontWeight: 800, color: "#10b981", marginBottom: 4 }}>✅ Respuesta Pública:</div>
                            <div style={{ fontSize: 13.5, color: "var(--text-dark)", whiteSpace: "pre-wrap" }}>{f.respuesta}</div>
                          </div>
                        )}
                        {replyFeedbackId === f.id && !f.respuesta && (
                          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            <textarea className="textarea" placeholder="Escribe tu respuesta pública..." value={replyFeedbackText} onChange={e => setReplyFeedbackText(e.target.value)} style={{ fontSize: 13.5, padding: 12, minHeight: 70 }} />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-green" style={{ fontSize: 12, padding: "7px 14px" }} onClick={async () => {
                                if (!replyFeedbackText.trim()) return;
                                await responderFeedback(f.id, replyFeedbackText);
                                setReplyFeedbackId(null);
                              }}>Publicar respuesta</button>
                              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => setReplyFeedbackId(null)}>Cancelar</button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!f.respuesta && replyFeedbackId !== f.id && (
                          <button className="btn btn-blue" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={() => { setReplyFeedbackId(f.id); setReplyFeedbackText(""); }}>
                            💬 Responder
                          </button>
                        )}
                        {feedbackSubTab !== "archived" ? (
                          <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={() => eliminarFeedback(f.id)}>📦 Archivar</button>
                        ) : (
                          <button className="btn btn-red" style={{ fontSize: 12.5, padding: "7px 14px" }} onClick={() => destruirFeedback(f.id)}>🗑️ Destruir</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🗳️ TAB 7: SOLICITUDES */}
        {activeTab === "solicitudes" && (
          <div className="fade-in">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>
              🗳️ Solicitudes de Secciones ({solicitudes?.length || 0})
            </h2>
            {(!solicitudes || solicitudes.length === 0) ? (
              <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-light)" }}>No hay solicitudes activas.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[...solicitudes].sort((a, b) => b.votos - a.votos).map(sol => (
                  <div key={sol.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span className="pill" style={{ background: "var(--light-blue)", color: "var(--primary-blue)", fontWeight: 800 }}>📍 Sede {sol.sede}</span>
                          <span style={{ fontSize: 12, color: "var(--text-light)" }}>Último voto: {formatFecha(sol.ultimoVoto || sol.createdAt)}</span>
                        </div>
                        <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)" }}>📚 {sol.curso}</h4>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: OR }}>🔥 {sol.votos} votos</span>
                        <button
                          className="btn btn-green"
                          style={{ padding: "7px 14px", fontSize: 12.5 }}
                          onClick={async () => {
                            if (window.confirm("¿Marcar como resuelta / eliminar esta solicitud?")) {
                              try {
                                await deleteDoc(doc(db, "solicitudes", sol.id));
                                showToast("✅ Solicitud resuelta.");
                              } catch (e) { showToast("❌ Error al eliminar."); }
                            }
                          }}
                        >
                          ✅ Resuelta
                        </button>
                      </div>
                    </div>
                    {sol.contactos && sol.contactos.length > 0 && (
                      <div style={{ background: "var(--ghost-bg)", padding: 12, borderRadius: 10, borderLeft: `3px solid ${B}` }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", marginBottom: 6 }}>ALUMNOS INTERESADOS ({sol.contactos.length}):</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {sol.contactos.map((c, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "var(--text-dark)", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                              <span><strong>{c.nombre || "Estudiante"}</strong> {c.correo ? `· ${c.correo}` : ""}</span>
                              <span style={{ color: "var(--text-light)" }}>{formatFecha(c.fecha)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📰 TAB 8: NOTICIAS */}
        {activeTab === "noticias" && (
          <div className="fade-in">
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14 }}>📢 Publicar Nueva Noticia</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input" placeholder="Título de la noticia" value={notiTitulo} onChange={e => setNotiTitulo(e.target.value)} />
                <textarea className="textarea" placeholder="Contenido de la noticia..." value={notiContenido} onChange={e => setNotiContenido(e.target.value)} style={{ minHeight: 100 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <input className="input" placeholder="URL de imagen (Opcional)" value={notiImagen} onChange={e => setNotiImagen(e.target.value)} />
                  <input className="input" placeholder="Link de WhatsApp / Externo (Opcional)" value={notiLink} onChange={e => setNotiLink(e.target.value)} />
                </div>
                <button className="btn btn-blue" onClick={handleCrearNoticia} style={{ alignSelf: "flex-start", padding: "11px 22px" }}>
                  🚀 Publicar en Inicio
                </button>
              </div>
            </div>

            {noticias?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14 }}>Noticias Activas ({noticias.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {noticias.map(n => (
                    <div key={n.id} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>{n.titulo}</div>
                        <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 6 }}>🗓️ {formatFecha(n.createdAt)}</div>
                        <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{n.contenido}</div>
                      </div>
                      <button className="btn btn-red" onClick={() => eliminarNoticia(n.id)} style={{ padding: "6px 12px", fontSize: 12.5, flexShrink: 0 }}>🗑️</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🗃️ TAB 9: HISTORIAL */}
        {activeTab === "archivo" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14 }}>🚨 Reportes Archivados ({archivedReportes.length})</h4>
              {archivedReportes.length === 0 ? (
                <div style={{ color: "var(--text-light)", fontSize: 13.5 }}>No hay reportes en el historial.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {archivedReportes.map(rep => (
                    <div key={rep.id} style={{ padding: 14, background: "var(--ghost-bg)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: rep.estado === "borrada" ? "#ef4444" : "#10b981", marginBottom: 4 }}>
                          {rep.estado === "borrada" ? "🗑️ RESEÑA BORRADA" : "✅ REPORTE DESCARTADO"}
                        </div>
                        <div style={{ fontSize: 13.5, color: "var(--text-dark)" }}>{rep.texto}</div>
                      </div>
                      <button className="btn btn-red" style={{ fontSize: 11.5, padding: "6px 12px", flexShrink: 0 }} onClick={() => destruirReporte(rep.id)}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14 }}>💡 Sugerencias Archivadas ({archivedFeedbacks.length})</h4>
              {archivedFeedbacks.length === 0 ? (
                <div style={{ color: "var(--text-light)", fontSize: 13.5 }}>No hay sugerencias archivadas.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {archivedFeedbacks.map(f => (
                    <div key={f.id} style={{ padding: 14, background: "var(--ghost-bg)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 13.5, color: "var(--text-dark)" }}>{f.mensaje}</div>
                      <button className="btn btn-red" style={{ fontSize: 11.5, padding: "6px 12px", flexShrink: 0 }} onClick={() => destruirFeedback(f.id)}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
