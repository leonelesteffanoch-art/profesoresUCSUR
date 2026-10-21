import { useState, useMemo } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase.js";
import { B, BD, OR, CRIT, SEDES, FACULTADES } from "../constants.js";
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
  const [facFiltroAdmin, setFacFiltroAdmin] = useState([]);
  const [sedeFiltroAdmin, setSedeFiltroAdmin] = useState([]);
  const [cursoFiltroAdmin, setCursoFiltroAdmin] = useState([]);
  const [filtroSugerenciasAdmin, setFiltroSugerenciasAdmin] = useState(false);
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

  const allCursosAdmin = useMemo(() => {
    return [...new Set(profesores.flatMap(p => p.cursos || []))].sort((a, b) => a.localeCompare(b));
  }, [profesores]);

  // Conteo de cuántos profesores dictan cada curso
  const conteoCursos = useMemo(() => {
    const map = {};
    profesores.forEach(p => {
      (p.cursos || []).forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return map;
  }, [profesores]);

  const filteredProfesores = profesores
    .filter(p => normalizeText(p.nombre).includes(normalizeText(busquedaAdmin)) || p.cursos?.some(c => normalizeText(c).includes(normalizeText(busquedaAdmin))))
    .filter(p => facFiltroAdmin.length === 0 || p.facultades?.some(f => facFiltroAdmin.includes(f)))
    .filter(p => sedeFiltroAdmin.length === 0 || sedeFiltroAdmin.includes(p.sede || "Sin Sede"))
    .filter(p => cursoFiltroAdmin.length === 0 || p.cursos?.some(c => cursoFiltroAdmin.includes(c)))
    .filter(p => !filtroSugerenciasAdmin || (p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0))
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
      <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
        <div className="card fade-in" style={{ padding: 36, textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: BD, marginBottom: 6 }}>Panel de admin</h2>
          <p style={{ fontSize: 14, color: "var(--text-light)", marginBottom: 28, fontWeight: 500 }}>Acceso restringido</p>
          <input className="input" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Correo electrónico" style={{ marginBottom: 12, padding: "14px 16px" }} />
          <input className="input" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
            placeholder="Contraseña" style={{ marginBottom: 16, padding: "14px 16px" }} />
          <button className="btn btn-blue" style={{ width: "100%", padding: 16, fontSize: 15 }} disabled={adminLoading} onClick={handleLogin}>
            {adminLoading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "28px 16px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: BD }}>⚙️ Panel de administrador</h2>
          <p style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 500, marginTop: 4 }}>Sesión: {adminUser.email}</p>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "10px 16px" }} onClick={async () => { await signOut(auth); navigate("home"); }}>
          Cerrar sesión
        </button>
      </div>

      {/* TABS NAVEGACIÓN */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 32, paddingBottom: 12 }}>
        {[
          { id: "dashboard", label: "📊 Resumen" },
          { id: "profesores", label: "👨‍🏫 Profesores" },
          { id: "resenas", label: "💬 Reseñas" },
          { id: "reportes", label: `🚨 Reportes (${pendingReportes.length})`, alert: pendingReportes.length > 0 },
          { id: "feedbacks", label: `💡 Sugerencias (${pendingFeedbacks.length})`, alert: pendingFeedbacks.some(f => !f.respuesta) },
          { id: "solicitudes", label: `🗳️ Solicitudes (${solicitudes?.length || 0})` },
          { id: "noticias", label: "📰 Noticias" },
          { id: "mantenimiento", label: "🛠️ Cursos y Mantenimiento" },
          { id: "archivo", label: "🗃️ Historial" }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="tab" style={{ 
            background: activeTab === t.id ? B : "transparent",
            color: activeTab === t.id ? "#fff" : "var(--text-muted)",
            fontWeight: activeTab === t.id ? 800 : 600,
            whiteSpace: "nowrap",
            boxShadow: activeTab === t.id ? "0 4px 12px rgba(21,96,170,.2)" : "none",
            position: "relative"
          }}>
            {t.label}
            {t.alert && <span style={{ position: "absolute", top: -2, right: -2, background: "#EF4444", width: 10, height: 10, borderRadius: "50%", border: "2px solid var(--bg-main)" }} />}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
            {[
              { label: "Profesores", n: profesores.length, icon: "👨‍🏫", color: B }, 
              { label: "Cursos únicos", n: allCursosAdmin.length, icon: "📚", color: "#8B5CF6" },
              { label: "Reseñas cargadas", n: todasResenas.length, icon: "💬", color: OR }, 
              { label: "Noticias", n: noticias?.length || 0, icon: "📰", color: "#059669" },
              { label: "Sugerencias Fac.", n: profesores.filter(p => p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0).length, icon: "💡", color: "#F59E0B" },
              { label: "Feedbacks", n: feedbacks?.length || 0, icon: "🗣️", color: "#EAB308" },
              { label: "Reportes", n: reportes.length, icon: "🚨", color: "#DC2626" }
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "20px 24px", borderLeft: `5px solid ${s.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFESORES TAB */}
      {activeTab === "profesores" && (
        <div className="fade-in">
          <datalist id="admin-cursos-list">
            {allCursosAdmin.map(c => <option key={c} value={c} />)}
          </datalist>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, background: "var(--card-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>Filtros de Profesores</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <input className="input" value={busquedaAdmin} onChange={e => setBusquedaAdmin(e.target.value)} placeholder="Buscar profe o curso..." style={{ padding: "10px 14px", fontSize: 13 }} />
              <details className="input" style={{ padding: 0, margin: 0, cursor: "pointer" }}>
                <summary style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, userSelect: "none" }}>
                  Facultades: {facFiltroAdmin.length === 0 ? "Todas" : facFiltroAdmin.length}
                </summary>
                <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                  {FACULTADES.filter(f => f !== "Todas").map(f => (
                    <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={facFiltroAdmin.includes(f)} onChange={e => {
                        if (e.target.checked) setFacFiltroAdmin([...facFiltroAdmin, f]);
                        else setFacFiltroAdmin(facFiltroAdmin.filter(x => x !== f));
                      }} /> {f}
                    </label>
                  ))}
                </div>
              </details>
              <details className="input" style={{ padding: 0, margin: 0, cursor: "pointer" }}>
                <summary style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, userSelect: "none" }}>
                  Sedes: {sedeFiltroAdmin.length === 0 ? "Todas" : sedeFiltroAdmin.length}
                </summary>
                <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                  {["Sin Sede", ...SEDES].map(s => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={sedeFiltroAdmin.includes(s)} onChange={e => {
                        if (e.target.checked) setSedeFiltroAdmin([...sedeFiltroAdmin, s]);
                        else setSedeFiltroAdmin(sedeFiltroAdmin.filter(x => x !== s));
                      }} /> {s}
                    </label>
                  ))}
                </div>
              </details>
              <details className="input" style={{ padding: 0, margin: 0, cursor: "pointer" }}>
                <summary style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, userSelect: "none" }}>
                  Cursos: {cursoFiltroAdmin.length === 0 ? "Todos" : cursoFiltroAdmin.length}
                </summary>
                <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
                  {allCursosAdmin.map(c => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={cursoFiltroAdmin.includes(c)} onChange={e => {
                        if (e.target.checked) setCursoFiltroAdmin([...cursoFiltroAdmin, c]);
                        else setCursoFiltroAdmin(cursoFiltroAdmin.filter(x => x !== c));
                      }} /> {c}
                    </label>
                  ))}
                </div>
              </details>
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={ordenProfAdmin} onChange={e => setOrdenProfAdmin(e.target.value)}>
                <option value="rating_desc">⭐ Mejor calificación</option>
                <option value="rating_asc">📉 Peor calificación</option>
                <option value="resenas_desc">💬 Más reseñas</option>
                <option value="nombre_asc">🔤 Orden alfabético (A-Z)</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--card-bg)", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border-color)", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={filtroSugerenciasAdmin} onChange={e => setFiltroSugerenciasAdmin(e.target.checked)} />
                Solo con sugerencias
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600 }}>
                Mostrando {filteredProfesores.length} profesores
              </div>
              {(busquedaAdmin || facFiltroAdmin.length > 0 || sedeFiltroAdmin.length > 0 || cursoFiltroAdmin.length > 0 || ordenProfAdmin !== "rating_desc" || filtroSugerenciasAdmin) && (
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => {
                  setBusquedaAdmin("");
                  setFacFiltroAdmin([]);
                  setSedeFiltroAdmin([]);
                  setCursoFiltroAdmin([]);
                  setOrdenProfAdmin("rating_desc");
                  setFiltroSugerenciasAdmin(false);
                }}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: "8px 0" }}>
            {filteredProfesores.map((p, i) => (
              <div key={p.id} style={{ borderTop: i > 0 ? "1px solid var(--border-color)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", flexWrap: "wrap" }}>
                  <Avatar name={p.nombre} fac={p.facultad} size={48} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {editProfDetailsId === p.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                        <input className="input" value={editProfDetailsNombre} onChange={e => setEditProfDetailsNombre(e.target.value)} placeholder="Nombre del profesor" style={{ fontSize: 15, fontWeight: 800, padding: "8px 12px" }} />
                        <textarea className="textarea" value={editProfDetailsBio} onChange={e => setEditProfDetailsBio(e.target.value)} placeholder="Biografía / Descripción" style={{ fontSize: 13, padding: "8px 12px", minHeight: 60 }} />
                        <input className="input" value={editProfDetailsAlerta} onChange={e => setEditProfDetailsAlerta(e.target.value)} placeholder="⚠️ Alerta (Ej: Bajo investigación por reseñas falsas)" style={{ fontSize: 13, padding: "8px 12px", border: "1px solid #fecaca", background: "#fef2f2" }} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          <span style={{ width: "100%", fontSize: 12, fontWeight: 700, color: "var(--text-light)" }}>Sedes del profesor:</span>
                          {SEDES.map(s => {
                            const isSel = editProfDetailsSedes.includes(s);
                            const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };
                            const c = sedeColors[s] || B;
                            return (
                              <button key={s} className="pill" onClick={() => {
                                if (isSel) {
                                  const newS = editProfDetailsSedes.filter(x => x !== s);
                                  if (newS.length > 0) setEditProfDetailsSedes(newS);
                                  else setEditProfDetailsSedes([]);
                                } else setEditProfDetailsSedes([...editProfDetailsSedes, s]);
                              }} style={{ background: isSel ? c : "transparent", color: isSel ? "#fff" : "var(--text-muted)", border: `1px solid ${c}`, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          <span style={{ width: "100%", fontSize: 12, fontWeight: 700, color: "var(--text-light)" }}>Facultades del profesor:</span>
                          {FACULTADES.filter(f => f !== "Todas").map(f => {
                            const isSel = editProfDetailsFacultades.includes(f);
                            return (
                              <button key={f} className="pill" onClick={() => {
                                if (isSel) {
                                  const newF = editProfDetailsFacultades.filter(x => x !== f);
                                  if (newF.length > 0) setEditProfDetailsFacultades(newF);
                                } else setEditProfDetailsFacultades([...editProfDetailsFacultades, f]);
                              }} style={{ background: isSel ? B : "transparent", color: isSel ? "#fff" : "var(--text-muted)", border: `1px solid ${B}`, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                {f}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-green" style={{ fontSize: 12, padding: "6px 12px" }} onClick={async () => {
                            if (!editProfDetailsNombre.trim()) { showToast("⚠️ Escribe un nombre."); return; }
                            await editarProfesor(p.id, editProfDetailsNombre, editProfDetailsBio, "", editProfDetailsAlerta, editProfDetailsFacultades, editProfDetailsSedes);
                            setEditProfDetailsId(null);
                          }}>Guardar</button>
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setEditProfDetailsId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 800 }}>{p.nombre}</div>
                          <button onClick={() => {
                            setEditProfDetailsId(p.id);
                            setEditProfDetailsNombre(p.nombre);
                            setEditProfDetailsBio(p.bio || "");
                            setEditProfDetailsSedes(p.sedes || [p.sede].filter(Boolean));
                            setEditProfDetailsAlerta(p.alerta || "");
                            setEditProfDetailsFacultades(p.facultades || [p.facultad]);
                          }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} title="Editar profe">✏️</button>
                        </div>
                        {p.alerta && <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", background: "#fef2f2", padding: "4px 8px", borderRadius: 6, marginBottom: 4, display: "inline-block" }}>⚠️ {p.alerta}</div>}
                        {p.bio && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{p.bio}</div>}
                        <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 8, fontWeight: 500 }}>
                          {(p.facultades || [p.facultad]).join(", ")} {p.sede && `· Sede ${p.sede}`} · {p.totalReseñas || 0} reseñas
                        </div>
                        {p.recomendacionesFacultad && Object.keys(p.recomendacionesFacultad).length > 0 && (
                          <div style={{ marginTop: 8, padding: 12, background: "#fef3c7", borderRadius: 12, border: "1px solid #fcd34d" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>💡 Sugerencias de Facultad</span>
                              {Object.keys(p.recomendacionesFacultad).length > 1 && (
                                <button className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 11, color: "#b45309" }} onClick={() => limpiarTodasSugerencias(p.id)}>
                                  Limpiar todas
                                </button>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {Object.entries(p.recomendacionesFacultad).map(([fac, votos]) => (
                                <div key={fac} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card-bg)", padding: "6px 12px", borderRadius: 8, border: "1px solid #fde68a", flexWrap: "wrap", gap: 8 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "#b45309", display: "flex", alignItems: "center", gap: 6 }}>
                                    {fac} <span style={{ background: "#f59e0b", color: "#fff", padding: "2px 6px", borderRadius: 10, fontSize: 10, fontWeight: 800 }}>{votos} votos</span>
                                  </div>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button className="btn" style={{ padding: "4px 10px", fontSize: 11, background: "#10b981", color: "#fff", borderRadius: 6, border: "none", fontWeight: 700 }} onClick={() => aplicarSugerenciaFacultad(p, fac)}>
                                      ✅ Aplicar
                                    </button>
                                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11, color: "#ef4444", borderRadius: 6, fontWeight: 700, background: "#fee2e2" }} onClick={() => rechazarSugerenciaFacultad(p.id, fac)}>
                                      ❌ Rechazar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(p.cursos || []).map(c => (
                        <span key={c} style={{ background: "var(--ghost-bg)", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, border: "1px solid var(--border-color)" }}>
                          📚 {c}
                          <span onClick={() => eliminarCurso(p, c)} style={{ cursor: "pointer", color: "#DC2626", fontWeight: 800, fontSize: 14, lineHeight: 1, padding: "0 2px" }} title="Eliminar curso">✕</span>
                        </span>
                      ))}
                      <span onClick={() => { setEditCursoProf(p.id); setEditCursoVal(""); }}
                        style={{ background: "var(--light-blue)", padding: "4px 12px", borderRadius: 20, fontSize: 12, color: B, cursor: "pointer", fontWeight: 700 }}>+ Agregar Curso</span>
                    </div>
                    {editCursoProf === p.id && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <input list="admin-cursos-list" className="input" value={editCursoVal} onChange={e => setEditCursoVal(e.target.value)} placeholder="Nombre del curso..." style={{ fontSize: 13, padding: "8px 12px" }} onKeyDown={e => { if (e.key === "Enter") adminAgregarCurso(p); }} />
                        <button className="btn btn-green" style={{ fontSize: 13, padding: "8px 16px", flexShrink: 0 }} onClick={() => adminAgregarCurso(p)}>Guardar</button>
                        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px", flexShrink: 0 }} onClick={() => setEditCursoProf(null)}>Cancelar</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignItems: "flex-end" }}>
                    <RatingChip r={p.rating} />
                    <button className="btn btn-red" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => eliminarProfesor(p)}>🗑️ Eliminar profe</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProfesores.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-light)", fontWeight: 500, fontSize: 14 }}>
                No se encontraron profesores con esos filtros.
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESEÑAS TAB */}
      {activeTab === "resenas" && (
        <div className="fade-in">
          {todasResenas.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📥</div>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>Cargar Reseñas</h4>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                Para optimizar el rendimiento y no saturar la base de datos, las reseñas de los profesores se cargan a petición en paralelo.
              </p>
              <button className="btn btn-blue" onClick={cargarTodasLasResenas} style={{ padding: "12px 24px", fontSize: 15, fontWeight: 700 }}>
                ⚡ Cargar todas las reseñas
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, background: "var(--card-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>Filtros de Reseñas</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <input className="input" value={busquedaResena} onChange={e => setBusquedaResena(e.target.value)} placeholder="Buscar en texto o profe..." style={{ padding: "10px 14px", fontSize: 13 }} />
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={facFiltroResena} onChange={e => setFacFiltroResena(e.target.value)}>
                <option value="Todas">Todas las facultades</option>
                {FACULTADES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={ordenResena} onChange={e => setOrdenResena(e.target.value)}>
                <option value="recientes">🕒 Más recientes</option>
                <option value="antiguas">⏳ Más antiguas</option>
                <option value="rating_desc">⭐ Mejores calificaciones (5★)</option>
                <option value="rating_asc">📉 Peores calificaciones (1★)</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600 }}>
                Mostrando {filteredResenas.length} reseñas
              </div>
              {(busquedaResena || facFiltroResena !== "Todas" || ordenResena !== "recientes") && (
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => {
                  setBusquedaResena("");
                  setFacFiltroResena("Todas");
                  setOrdenResena("recientes");
                }}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredResenas.map(r => {
              const rAvg = avg(CRIT.map(c => r.criterios[c]));
              const prof = profesores.find(p => p.id === r.profId);
              return (
                <div key={r.id} className="card" style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <Avatar name={r.profNombre || "?"} fac={r.profFac || ""} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>{r.profNombre}</span>
                      <span style={{ background: `${ratingColor(rAvg)}18`, color: ratingColor(rAvg), fontWeight: 800, fontSize: 13, padding: "4px 10px", borderRadius: 10 }}>★ {rAvg.toFixed(1)}</span>
                      {r.facultadAlumno && <span style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>🏫 {r.facultadAlumno.replace("Ciencias de la ", "").replace("Ciencias ", "")}</span>}
                      {r.carrera && <span style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>🎓 {r.carrera}</span>}
                      {r.ciclo && <span style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>Ciclo {r.ciclo}</span>}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: 6 }}>{r.texto}</p>
                    <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>🕐 {formatFecha(r.createdAt)}</div>
                  </div>
                  <button className="btn btn-red" style={{ fontSize: 14, padding: "8px 16px", flexShrink: 0 }} onClick={() => eliminarResena(prof || r.profId, r)}>🗑️</button>
                </div>
              );
            })}
            {filteredResenas.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-light)", fontWeight: 500, fontSize: 14 }}>
                No se encontraron reseñas con esos filtros.
              </div>
            )}
          </div>
            </>
          )}
        </div>
      )}

      {/* REPORTES TAB */}
      {activeTab === "reportes" && (
        <div className="fade-in">
          {pendingReportes.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>No hay reseñas reportadas.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {pendingReportes.map(rep => {
                const prof = profesores.find(p => p.id === rep.profId);
                const resena = (todasResenas || []).find(r => r.id === rep.resId);
                return (
                  <div key={rep.id} className="card" style={{ padding: "18px 22px", border: "1.5px solid #fecaca", background: "#fef2f2" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#DC2626", fontWeight: 800, marginBottom: 6 }}>🚨 Reporte en {prof?.nombre || "Profesor eliminado"}</div>
                        <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6, background: "var(--card-bg)", padding: "12px 16px", borderRadius: 12, border: "1px solid #fecaca" }}>{rep.texto}</p>
                        {rep.fecha && <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8, fontWeight: 500 }}>🕐 {formatFecha(rep.fecha)}</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-red" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => handleEliminarReporte(rep, resena, prof)}>🗑️ Eliminar Reseña</button>
                        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px", background: "var(--ghost-bg)" }} onClick={() => handleIgnorarReporte(rep)}>✅ Ignorar Reporte</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FEEDBACKS TAB */}
      {activeTab === "feedbacks" && (
        <div className="fade-in">
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button className="btn" onClick={() => setBusquedaAdmin("pending")} style={{ background: busquedaAdmin !== "archived" ? B : "var(--card-bg)", color: busquedaAdmin !== "archived" ? "#fff" : "var(--text-dark)", border: "1px solid", borderColor: busquedaAdmin !== "archived" ? B : "var(--border-color)", padding: "8px 16px", fontSize: 13, borderRadius: 20 }}>
              Nuevas ({pendingFeedbacks.length})
            </button>
            <button className="btn" onClick={() => setBusquedaAdmin("archived")} style={{ background: busquedaAdmin === "archived" ? B : "var(--card-bg)", color: busquedaAdmin === "archived" ? "#fff" : "var(--text-dark)", border: "1px solid", borderColor: busquedaAdmin === "archived" ? B : "var(--border-color)", padding: "8px 16px", fontSize: 13, borderRadius: 20 }}>
              Historial ({archivedFeedbacks.length})
            </button>
          </div>
          {((busquedaAdmin === "archived" ? archivedFeedbacks : pendingFeedbacks) || []).length === 0 ? (
             <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
               <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
               <div style={{ fontSize: 16, fontWeight: 700 }}>El buzón está vacío en esta sección.</div>
             </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {(busquedaAdmin === "archived" ? archivedFeedbacks : pendingFeedbacks).map(f => (
                <div key={f.id} className="card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, borderLeft: f.respuesta ? "4px solid #cbd5e1" : "4px solid #fef08a", opacity: f.respuesta ? 0.7 : 1, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                    <p style={{ fontSize: 15, color: "var(--text-dark)", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap", background: "var(--ghost-bg)", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-color)" }}>{f.mensaje}</p>
                    {f.contacto && <div style={{ fontSize: 13, color: "var(--text-dark)", fontWeight: 600, marginBottom: 4 }}>Contacto: {f.contacto}</div>}
                    <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500, marginBottom: f.respuesta ? 8 : 0 }}>🕐 {formatFecha(f.createdAt)}</div>
                    {f.respuesta && (
                      <div style={{ background: "#fef8c4", padding: 12, borderRadius: 8, marginTop: 12, borderLeft: "3px solid #eab308" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#a16207", marginBottom: 4 }}>Tu respuesta (Pública):</div>
                        <div style={{ fontSize: 14, color: "#713f12", whiteSpace: "pre-wrap" }}>{f.respuesta}</div>
                      </div>
                    )}
                    
                    {replyFeedbackId === f.id && !f.respuesta && (
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <textarea className="textarea" placeholder="Escribe tu respuesta pública..." value={replyFeedbackText} onChange={e => setReplyFeedbackText(e.target.value)} style={{ fontSize: 13, padding: 12, minHeight: 60 }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-green" style={{ fontSize: 12, padding: "6px 12px" }} onClick={async () => {
                            if (!replyFeedbackText.trim()) return;
                            await responderFeedback(f.id, replyFeedbackText);
                            setReplyFeedbackId(null);
                          }}>Publicar</button>
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setReplyFeedbackId(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignSelf: "flex-end" }}>
                    {!f.respuesta && replyFeedbackId !== f.id && <button className="btn btn-blue" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => { setReplyFeedbackId(f.id); setReplyFeedbackText(`> "${f.mensaje}"\n\n`); }}>💬 Responder</button>}
                    {busquedaAdmin !== "archived" ? (
                      <button className="btn btn-red" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => eliminarFeedback(f.id)}>📦 Archivar</button>
                    ) : (
                      <button className="btn btn-red" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => destruirFeedback(f.id)}>🗑️ Destruir</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SOLICITUDES TAB */}
      {activeTab === "solicitudes" && (
        <div className="fade-in">
          <div style={{ background: "var(--card-bg)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>Solicitudes de Apertura de Cursos</h3>
            
            {(!solicitudes || solicitudes.length === 0) ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>No hay solicitudes de cursos.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {solicitudes.sort((a, b) => b.votos - a.votos).map(sol => (
                  <div key={sol.id} style={{ padding: 20, border: "1px solid var(--border-color)", borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, background: "var(--ghost-bg)", padding: "4px 8px", borderRadius: 6, color: "var(--text-muted)", textTransform: "uppercase" }}>{sol.sede}</span>
                          <span style={{ fontSize: 12, color: "var(--text-light)" }}>Último voto: {formatFecha(sol.ultimoVoto || sol.createdAt)}</span>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>{sol.curso}</h4>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, color: OR }}>{sol.votos} votos</span>
                        <button 
                          className="btn btn-red" 
                          onClick={async () => {
                            if (window.confirm("¿Seguro que deseas eliminar/marcar como resuelta esta solicitud?")) {
                              try {
                                await deleteDoc(doc(db, "solicitudes", sol.id));
                                showToast("✅ Solicitud resuelta/eliminada.");
                              } catch (e) { showToast("❌ Error al eliminar."); }
                            }
                          }}
                          style={{ padding: "6px 12px", fontSize: 13, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
                        >
                          ✅ Resuelta / Eliminar
                        </button>
                      </div>
                    </div>
                    
                    {sol.contactos && sol.contactos.length > 0 && (
                      <div style={{ background: "var(--ghost-bg)", padding: 12, borderRadius: 8, borderLeft: `2px solid ${BD}` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>CONTACTOS:</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {sol.contactos.map((c, i) => (
                            <div key={i} style={{ fontSize: 12, color: "var(--text-dark)", display: "flex", justifyContent: "space-between" }}>
                              <span><span style={{ fontWeight: 600 }}>{c.nombre || "Estudiante"}</span> {c.correo ? `(${c.correo})` : ""}</span>
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
        </div>
      )}

      {/* NOTICIAS TAB */}
      {activeTab === "noticias" && (
        <div className="fade-in">
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Publicar nueva noticia</h4>
            <input className="input" placeholder="Título de la noticia" value={notiTitulo} onChange={e => setNotiTitulo(e.target.value)} style={{ marginBottom: 12, padding: "12px 16px" }} />
            <textarea className="textarea" placeholder="Contenido de la noticia (puedes escribir varios párrafos)..." value={notiContenido} onChange={e => setNotiContenido(e.target.value)} style={{ padding: "12px 16px", minHeight: 100, marginBottom: 12 }} />
            <input className="input" placeholder="URL de la imagen (Opcional)" value={notiImagen} onChange={e => setNotiImagen(e.target.value)} style={{ marginBottom: 12, padding: "12px 16px" }} />
            <input className="input" placeholder="Enlace externo / Link (Opcional)" value={notiLink} onChange={e => setNotiLink(e.target.value)} style={{ marginBottom: 12, padding: "12px 16px" }} />
            <button className="btn btn-blue" onClick={handleCrearNoticia} style={{ padding: "10px 20px" }}>📢 Publicar Noticia</button>
            
            {noticias?.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Noticias publicadas ({noticias.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {noticias.map(n => (
                    <div key={n.id} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>{n.titulo}</div>
                        <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 6 }}>{formatFecha(n.createdAt)}</div>
                        <div style={{ fontSize: 14, color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.contenido}</div>
                      </div>
                      <button className="btn btn-red" onClick={() => eliminarNoticia(n.id)} style={{ padding: "6px 12px", fontSize: 13, flexShrink: 0 }}>🗑️ Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANTENIMIENTO Y CURSOS TAB */}
      {activeTab === "mantenimiento" && (
        <div className="fade-in">
          {(() => {
            // 1. Agrupar cursos por clave canónica (detecta diferencias de tildes, mayúsculas, conectores y "I" vs "1")
            const keyMap = {};
            allCursosAdmin.forEach(c => {
              const k = normalizeCourseKey(c);
              if (!k) return;
              if (!keyMap[k]) keyMap[k] = [];
              keyMap[k].push(c);
            });

            // 2. Construir mapa automático de limpieza 1-Clic (reemplazos seguros)
            const autoReemplazos = {};
            const autoCambiosLista = [];

            Object.values(keyMap).forEach(variantes => {
              // Ordenar por calidad de escritura + frecuencia
              const candidatos = [...variantes].sort((a, b) => {
                const diffScore = scoreCourseQuality(b) - scoreCourseQuality(a);
                if (diffScore !== 0) return diffScore;
                return (conteoCursos[b] || 0) - (conteoCursos[a] || 0);
              });
              // También evaluar si formatCourseName mejora aún más al mejor candidato
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

            // 3. Agrupar cursos duplicados o muy similares (incluyendo typos con similarity >= 0.84 y mismo número de curso)
            const exactDuplicateGroups = Object.values(keyMap).filter(arr => arr.length > 1);
            const fuzzySimilarGroups = [];
            const keys = Object.keys(keyMap);
            for (let i = 0; i < keys.length; i++) {
              for (let j = i + 1; j < keys.length; j++) {
                const repA = keyMap[keys[i]][0];
                const repB = keyMap[keys[j]][0];
                const numA = extractCourseNumber(repA);
                const numB = extractCourseNumber(repB);
                // Nunca agrupar cursos con distinto número (ej. Cálculo I vs Cálculo II)
                if (numA !== numB) continue;
                const sim = similarity(keys[i], keys[j]);
                if (sim >= 0.84 && sim < 1) {
                  fuzzySimilarGroups.push([...keyMap[keys[i]], ...keyMap[keys[j]]]);
                }
              }
            }

            // 4. Profesores duplicados y cursos duplicados dentro de un mismo profesor
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

            const catalogoFiltrado = allCursosAdmin.filter(c => normalizeText(c).includes(normalizeText(busquedaCatalogoCurso)));

            return (
              <>
                {/* 🪄 MAGIA 1-CLIC: AUTO-LIMPIEZA INTELIGENTE */}
                <div className="card" style={{ padding: 24, marginBottom: 28, border: `2px solid ${OR}`, background: "var(--card-bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${OR}20`, color: OR, padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
                        🪄 ASISTENTE INTELIGENTE DE CURSOS
                      </div>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                        Auto-Unificar y Corregir Cursos en 1 Clic
                      </h4>
                      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                        Detecta automáticamente cursos repetidos por tildes (`Bioquimica` → `Bioquímica`), números romanos mal escritos (`Calculo Ii` o `Cálculo 2` → `Cálculo II`) y duplicados dentro de un mismo profesor.
                      </p>
                    </div>
                    <button
                      className="btn btn-orange"
                      disabled={autoCambiosLista.length === 0 && courseDuplicatesInProf.length === 0}
                      onClick={() => {
                        const mapFinal = { ...autoReemplazos };
                        courseDuplicatesInProf.forEach(d => {
                          const best = [...d.courses].sort((a, b) => scoreCourseQuality(b) - scoreCourseQuality(a))[0];
                          d.courses.forEach(c => { if (c !== best) mapFinal[c] = best; });
                        });
                        autoUnificarCursosGlobal(
                          mapFinal,
                          `¿Aplicar ${autoCambiosLista.length} correcciones automáticas de cursos en toda la base de datos en una sola operación?`
                        );
                      }}
                      style={{ padding: "12px 22px", fontSize: 14, flexShrink: 0 }}
                    >
                      🪄 Limpiar Todo ({autoCambiosLista.length})
                    </button>
                  </div>

                  {autoCambiosLista.length === 0 && courseDuplicatesInProf.length === 0 ? (
                    <div style={{ padding: "14px 16px", background: "var(--ghost-bg)", borderRadius: 12, fontSize: 13, color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>✨</span> ¡Todos los cursos tienen formato limpio, tildes correctas y números romanos estandarizados!
                    </div>
                  ) : (
                    <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }} className="custom-scrollbar">
                      {autoCambiosLista.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", background: "var(--ghost-bg)", borderRadius: 10, fontSize: 13, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ color: "#DC2626", textDecoration: "line-through", fontWeight: 600 }}>{item.de}</span>
                            <span style={{ color: "var(--text-light)" }}>→</span>
                            <span style={{ color: "#059669", fontWeight: 800 }}>{item.a}</span>
                            <span style={{ fontSize: 11, color: "var(--text-light)" }}>({item.profes} profe{item.profes === 1 ? "" : "s"})</span>
                          </div>
                          <button
                            className="btn btn-blue"
                            style={{ padding: "4px 10px", fontSize: 11 }}
                            onClick={() => fusionarCursosGlobal(item.de, item.a, true)}
                          >
                            Aplicar solo este
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🌍 DUPLICADOS DETECTADOS CON RESOLUCIÓN EN 1 CLIC */}
                <div className="card" style={{ padding: 24, marginBottom: 28 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
                    🔍 Grupos de Cursos Duplicados o Similares ({exactDuplicateGroups.length + fuzzySimilarGroups.length})
                  </h4>
                  <p style={{ color: "var(--text-light)", fontSize: 13, marginBottom: 20 }}>
                    Haz clic en <b>"✅ Dejar este"</b> sobre la versión correcta y todas las demás variaciones del grupo se fusionarán hacia ella al instante.
                  </p>

                  {exactDuplicateGroups.length === 0 && fuzzySimilarGroups.length === 0 ? (
                    <div style={{ padding: 14, background: "var(--ghost-bg)", borderRadius: 10, fontSize: 13, color: "var(--text-muted)" }}>
                      No se detectaron grupos de cursos duplicados ni variaciones sospechosas.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[...exactDuplicateGroups.map(g => ({ group: g, tipo: "exacto" })), ...fuzzySimilarGroups.map(g => ({ group: g, tipo: "similar" }))].map(({ group, tipo }, i) => (
                        <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, background: "var(--ghost-bg)" }}>
                          <div style={{ fontSize: 12, color: tipo === "exacto" ? "#DC2626" : OR, marginBottom: 10, fontWeight: 800, textTransform: "uppercase" }}>
                            {tipo === "exacto" ? "⚡ Mismo curso con distinta escritura:" : "🤔 Cursos muy parecidos (posible typo):"}
                          </div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {group.map((c, j) => (
                              <div key={j} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--border-color)", padding: "6px 12px", borderRadius: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>📚 {c}</span>
                                <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>({conteoCursos[c] || 0})</span>
                                <button
                                  className="btn btn-green"
                                  style={{ padding: "4px 8px", fontSize: 11, borderRadius: 8 }}
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

                {/* 🔗 FUSIÓN Y DIVISIÓN MANUAL */}
                <div className="card" style={{ padding: 24, marginBottom: 28 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>🔗 Fusionar dos Cursos Manualmente</h4>
                  <p style={{ color: "var(--text-light)", fontSize: 14, marginBottom: 20 }}>Reemplaza cualquier curso por otro en <b>todos</b> los profesores y solicitudes a la vez.</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <input 
                      list="cursos-incorrectos-list"
                      className="input" 
                      placeholder="Selecciona el curso a reemplazar..." 
                      value={fusionarCursoMalo} 
                      onChange={e => setFusionarCursoMalo(e.target.value)} 
                      style={{ flex: 1, minWidth: 200, padding: "12px 16px" }} 
                    />
                    <datalist id="cursos-incorrectos-list">
                      {allCursosAdmin.map(c => <option key={`malo-${c}`} value={c} />)}
                    </datalist>
                    <span style={{ color: "var(--text-muted)" }}>👉</span>
                    
                    <input 
                      list="cursos-correctos-list"
                      className="input" 
                      placeholder="Nombre correcto (ej: Bioquímica)" 
                      value={fusionarCursoBueno} 
                      onChange={e => setFusionarCursoBueno(e.target.value)} 
                      style={{ flex: 1, minWidth: 200, padding: "12px 16px" }} 
                    />
                    <datalist id="cursos-correctos-list">
                      {allCursosAdmin.map(c => <option key={`bueno-${c}`} value={c} />)}
                    </datalist>
                    
                    <button className="btn btn-blue" disabled={!fusionarCursoMalo || !fusionarCursoBueno.trim()} onClick={async () => {
                      const malo = fusionarCursoMalo;
                      const bueno = fusionarCursoBueno.trim();
                      const ok = await fusionarCursosGlobal(malo, bueno);
                      if (ok) { setFusionarCursoMalo(""); setFusionarCursoBueno(""); }
                    }} style={{ padding: "12px 24px" }}>Fusionar</button>
                  </div>
                </div>

                <div className="card" style={{ padding: 24, marginBottom: 28 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>✂️ Dividir Curso Compuesto</h4>
                  <p style={{ color: "var(--text-light)", fontSize: 14, marginBottom: 20 }}>Separa un curso donde pusieron varios juntos (ej. "Matematica I y II" → "Matemática I" + "Matemática II").</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <select className="input" value={dividirCursoSel} onChange={e => setDividirCursoSel(e.target.value)} style={{ padding: "12px 16px" }}>
                      <option value="">Selecciona el curso a dividir...</option>
                      {allCursosAdmin.map(c => <option key={`div-${c}`} value={c}>{c}</option>)}
                    </select>
                    <input className="input" placeholder='Cursos correctos separados por coma (ej: Matemática I, Matemática II)' value={dividirCursosNuevos} onChange={e => setDividirCursosNuevos(e.target.value)} style={{ padding: "12px 16px" }} />
                    {dividirCursosNuevos.trim() && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {dividirCursosNuevos.split(",").map(c => c.trim()).filter(Boolean).map((c, i) => (
                          <span key={i} style={{ background: "var(--light-blue)", color: "var(--primary-blue)", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>📚 {formatCourseName(c)}</span>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-blue" disabled={!dividirCursoSel || !dividirCursosNuevos.trim()} onClick={async () => {
                      const malo = dividirCursoSel;
                      const nuevos = dividirCursosNuevos.split(",").map(c => formatCourseName(c.trim())).filter(Boolean);
                      if (nuevos.length < 2) { showToast("⚠️ Escribe al menos 2 cursos separados por coma."); return; }
                      const ok = await dividirCursoGlobal(malo, nuevos);
                      if (ok) { setDividirCursoSel(""); setDividirCursosNuevos(""); }
                    }} style={{ padding: "12px 24px", alignSelf: "flex-start" }}>Dividir</button>
                  </div>
                </div>

                {/* 📚 CATÁLOGO MAESTRO DE CURSOS (RENOMBRAR / BORRAR EN 1 CLIC) */}
                <div className="card" style={{ padding: 24, marginBottom: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>📚 Catálogo Maestro de Cursos ({allCursosAdmin.length})</h4>
                      <p style={{ color: "var(--text-light)", fontSize: 13, marginTop: 2 }}>Edita el nombre de cualquier curso o elimínalo de todos los profesores directamente desde aquí.</p>
                    </div>
                    <input
                      className="input"
                      placeholder="🔍 Filtrar curso..."
                      value={busquedaCatalogoCurso}
                      onChange={e => setBusquedaCatalogoCurso(e.target.value)}
                      style={{ maxWidth: 260, padding: "10px 14px", fontSize: 13 }}
                    />
                  </div>

                  <div className="custom-scrollbar" style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                    {catalogoFiltrado.map(c => (
                      <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", background: "var(--ghost-bg)", borderRadius: 10, flexWrap: "wrap" }}>
                        {renombrandoCurso === c ? (
                          <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              className="input"
                              value={nuevoNombreCurso}
                              onChange={e => setNuevoNombreCurso(e.target.value)}
                              style={{ flex: 1, minWidth: 180, padding: "6px 12px", fontSize: 13 }}
                              autoFocus
                              onKeyDown={async e => {
                                if (e.key === "Enter" && nuevoNombreCurso.trim()) {
                                  const ok = await fusionarCursosGlobal(c, nuevoNombreCurso.trim(), true);
                                  if (ok) setRenombrandoCurso(null);
                                }
                              }}
                            />
                            <button className="btn btn-green" style={{ padding: "6px 12px", fontSize: 12 }} onClick={async () => {
                              if (!nuevoNombreCurso.trim()) return;
                              const ok = await fusionarCursosGlobal(c, nuevoNombreCurso.trim(), true);
                              if (ok) setRenombrandoCurso(null);
                            }}>Guardar</button>
                            <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setRenombrandoCurso(null)}>Cancelar</button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>📚 {c}</span>
                              <span style={{ fontSize: 11, background: "var(--card-bg)", padding: "2px 8px", borderRadius: 10, color: "var(--text-light)", fontWeight: 700, border: "1px solid var(--border-color)" }}>
                                {conteoCursos[c] || 0} profe{(conteoCursos[c] || 0) === 1 ? "" : "s"}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => { setRenombrandoCurso(c); setNuevoNombreCurso(c); }}>
                                ✏️ Renombrar
                              </button>
                              <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => { setDividirCursoSel(c); }}>
                                ✂️ Dividir
                              </button>
                              <button className="btn btn-red" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => eliminarCursoGlobal(c)} title="Eliminar este curso de todos los profesores">
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 👨‍🏫 OTROS DIAGNÓSTICOS (PROFESORES DUPLICADOS Y MAYÚSCULAS) */}
                <div className="card" style={{ padding: 24, marginBottom: 32 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>👨‍🏫 Diagnóstico de Profesores</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Profesores duplicados ({profDuplicates.length})</h5>
                      {profDuplicates.length === 0 ? (
                        <div style={{ padding: 12, background: "var(--ghost-bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>No se encontraron profesores duplicados.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {profDuplicates.map((d, i) => (
                            <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>1. {d.p1.nombre} <span style={{ color: "var(--text-light)", fontWeight: 400, fontSize: 12 }}>({d.p1.totalReseñas || 0} reseñas)</span></div>
                                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>2. {d.p2.nombre} <span style={{ color: "var(--text-light)", fontWeight: 400, fontSize: 12 }}>({d.p2.totalReseñas || 0} reseñas)</span></div>
                              </div>
                              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                                <button className="btn btn-blue" onClick={() => fusionarProfesores(d.p2, d.p1)} style={{ padding: "6px 12px", fontSize: 12 }}>Fusionar hacia el 1</button>
                                <button className="btn btn-blue" onClick={() => fusionarProfesores(d.p1, d.p2)} style={{ padding: "6px 12px", fontSize: 12 }}>Fusionar hacia el 2</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>🔠 Nombres en Mayúsculas ({uppercaseProfs.length})</h5>
                      {uppercaseProfs.length === 0 ? (
                        <div style={{ padding: 12, background: "var(--ghost-bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>No se encontraron profesores con nombres en mayúsculas.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {uppercaseProfs.map((p, i) => (
                            <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nombre}</div>
                              <button className="btn btn-blue" onClick={() => {
                               editarProfesor(p.id, capitalizeName(p.nombre), p.bio || "", p.sede || "", p.alerta || "");
                              }} style={{ padding: "6px 12px", fontSize: 12 }}>
                                Corregir a Título
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* HISTORIAL / ARCHIVO TAB */}
      {activeTab === "archivo" && (
        <div className="fade-in">
          <div style={{ marginBottom: 32 }}>
            <h5 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>🚨 Reportes Archivados ({archivedReportes.length})</h5>
            {archivedReportes.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-light)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14 }}>No hay reportes en el historial.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {archivedReportes.map(rep => {
                  return (
                    <div key={rep.id} className="card" style={{ padding: "16px 20px", border: "1.5px solid var(--border-color)", background: "var(--ghost-bg)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: rep.estado === "borrada" ? "#DC2626" : "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
                            {rep.estado === "borrada" ? "🗑️ Reseña Borrada" : "✅ Reporte Ignorado"}
                          </div>
                          <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.5 }}>{rep.texto}</p>
                          {rep.fecha && <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 6 }}>Archivado el {formatFecha(rep.fecha)}</div>}
                        </div>
                        <button className="btn btn-red" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => destruirReporte(rep.id)}>Destruir Permanente</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h5 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>💡 Sugerencias Archivadas ({archivedFeedbacks.length})</h5>
            {archivedFeedbacks.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-light)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14 }}>No hay sugerencias en el historial.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {archivedFeedbacks.map(f => (
                  <div key={f.id} className="card" style={{ padding: "16px 20px", border: "1.5px solid var(--border-color)", background: "var(--ghost-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{f.mensaje}</p>
                        {f.contacto && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Contacto: {f.contacto}</div>}
                        <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>Archivado el {formatFecha(f.createdAt)}</div>
                      </div>
                      <button className="btn btn-red" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => destruirFeedback(f.id)}>Destruir Permanente</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
