import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase.js";
import { B, BD, OR, CRIT, SEDES, FACULTADES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { formatFecha, avg, ratingColor, normalizeText, capitalizeName } from "../utils/helpers.js";

export const Admin = ({
  adminUser,
  adminEmail, setAdminEmail,
  adminPass, setAdminPass,
  adminLoading, setAdminLoading,
  profesores,
  todasResenas,
  reportes,
  noticias,
  feedbacks,
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
  dividirCursoGlobal,
  fusionarProfesores
}) => {
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
  const [ordenProfAdmin, setOrdenProfAdmin] = useState("rating_desc");

  // Filtros Reseñas
  const [busquedaResena, setBusquedaResena] = useState("");
  const [facFiltroResena, setFacFiltroResena] = useState("Todas");
  const [ordenResena, setOrdenResena] = useState("recientes");
  const [cursoFiltroResena, setCursoFiltroResena] = useState("");

  // Fusión de cursos
  const [fusionarCursoMalo, setFusionarCursoMalo] = useState("");
  const [fusionarCursoBueno, setFusionarCursoBueno] = useState("");

  // División de cursos
  const [dividirCursoSel, setDividirCursoSel] = useState("");
  const [dividirCursosNuevos, setDividirCursosNuevos] = useState("");

  const pendingReportes = reportes.filter(r => r.estado === "pendiente");
  const archivedReportes = reportes.filter(r => r.estado !== "pendiente");
  const pendingFeedbacks = feedbacks?.filter(f => f.estado !== "archivado") || [];
  const archivedFeedbacks = feedbacks?.filter(f => f.estado === "archivado") || [];

  const allCursosAdmin = [...new Set(profesores.flatMap(p => p.cursos || []))].sort();

  const filteredProfesores = profesores
    .filter(p => normalizeText(p.nombre).includes(normalizeText(busquedaAdmin)) || p.cursos?.some(c => normalizeText(c).includes(normalizeText(busquedaAdmin))))
    .filter(p => facFiltroAdmin.length === 0 || p.facultades?.some(f => facFiltroAdmin.includes(f)))
    .filter(p => sedeFiltroAdmin.length === 0 || sedeFiltroAdmin.includes(p.sede || "Sin Sede"))
    .filter(p => cursoFiltroAdmin.length === 0 || p.cursos?.some(c => cursoFiltroAdmin.includes(c)))
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
      // Archive ALL pending reports that target this same review
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
      // Archive ALL pending reports that target this same review
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
          { id: "noticias", label: "📰 Noticias" },
          { id: "mantenimiento", label: "🛠️ Mantenimiento" },
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
              { label: "Reseñas totales", n: todasResenas.length, icon: "💬", color: OR }, 
              { label: "Noticias", n: noticias?.length || 0, icon: "📰", color: "#059669" },
              { label: "Feedbacks", n: feedbacks?.length || 0, icon: "💡", color: "#EAB308" },
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
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600 }}>
                Mostrando {filteredProfesores.length} profesores
              </div>
              {(busquedaAdmin || facFiltroAdmin.length > 0 || sedeFiltroAdmin.length > 0 || cursoFiltroAdmin.length > 0 || ordenProfAdmin !== "rating_desc") && (
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => {
                  setBusquedaAdmin("");
                  setFacFiltroAdmin([]);
                  setSedeFiltroAdmin([]);
                  setCursoFiltroAdmin([]);
                  setOrdenProfAdmin("rating_desc");
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
                          <div style={{ marginTop: 4, marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {Object.entries(p.recomendacionesFacultad).map(([fac, votos]) => (
                              <span key={fac} style={{ background: "#fef3c7", border: "1px solid #f59e0b", color: "#b45309", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                ⚠️ Sugerido para: {fac} <span style={{ background: "#f59e0b", color: "#fff", padding: "2px 6px", borderRadius: 10, fontSize: 10 }}>{votos}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(p.cursos || []).map(c => (
                        <span key={c} style={{ background: "#f3f6fb", padding: "4px 10px", borderRadius: 20, fontSize: 12, color: "#5a6a80", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                          📚 {c}
                          <span onClick={() => eliminarCurso(p, c)} style={{ cursor: "pointer", color: "#DC2626", fontWeight: 800, fontSize: 14, lineHeight: 1, padding: "0 2px" }} title="Eliminar curso">✕</span>
                        </span>
                      ))}
                      <span onClick={() => { setEditCursoProf(p.id); setEditCursoVal(""); }}
                        style={{ background: "var(--light-blue)", padding: "4px 12px", borderRadius: 20, fontSize: 12, color: B, cursor: "pointer", fontWeight: 700 }}>+ Agregar Curso</span>
                    </div>
                    {editCursoProf === p.id && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <input className="input" value={editCursoVal} onChange={e => setEditCursoVal(e.target.value)} placeholder="Nombre del curso..." style={{ fontSize: 13, padding: "8px 12px" }} onKeyDown={e => { if (e.key === "Enter") adminAgregarCurso(p); }} />
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
                    <p style={{ fontSize: 14, color: "#2d3a50", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: 6 }}>{r.texto}</p>
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
                        <p style={{ fontSize: 14, color: "#2d3a50", lineHeight: 1.6, background: "#fff", padding: "12px 16px", borderRadius: 12, border: "1px solid #fecaca" }}>{rep.texto}</p>
                        {rep.fecha && <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8, fontWeight: 500 }}>🕐 {formatFecha(rep.fecha)}</div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-red" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => handleEliminarReporte(rep, resena, prof)}>🗑️ Eliminar Reseña</button>
                        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px", background: "#fff" }} onClick={() => handleIgnorarReporte(rep)}>✅ Ignorar Reporte</button>
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
                    <p style={{ fontSize: 15, color: "#2d3a50", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap", background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>{f.mensaje}</p>
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

      {/* MANTENIMIENTO TAB */}
      {activeTab === "mantenimiento" && (
        <div className="fade-in">
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>🔗 Fusionar Cursos Globalmente</h4>
            <p style={{ color: "var(--text-light)", fontSize: 14, marginBottom: 24 }}>Reemplaza una versión incorrecta de un curso por la correcta en <b>todos</b> los profesores a la vez (ej. cambiar "bioquimica" por "Bioquímica").</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input 
                list="cursos-incorrectos-list"
                className="input" 
                placeholder="Selecciona el curso INCORRECTO..." 
                value={fusionarCursoMalo} 
                onChange={e => setFusionarCursoMalo(e.target.value)} 
                style={{ flex: 1, minWidth: 200, padding: "12px 16px" }} 
              />
              <datalist id="cursos-incorrectos-list">
                {[...new Set(profesores.flatMap(p => p.cursos || []))].sort().map(c => <option key={`malo-${c}`} value={c} />)}
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
                {[...new Set(profesores.flatMap(p => p.cursos || []))].sort().map(c => <option key={`bueno-${c}`} value={c} />)}
              </datalist>
              
              <button className="btn btn-blue" disabled={!fusionarCursoMalo || !fusionarCursoBueno.trim()} onClick={async () => {
                const malo = fusionarCursoMalo;
                const bueno = capitalizeName(fusionarCursoBueno.trim());
                const ok = await fusionarCursosGlobal(malo, bueno);
                if (ok) { setFusionarCursoMalo(""); setFusionarCursoBueno(""); }
              }} style={{ padding: "12px 24px" }}>Fusionar</button>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>✂️ Dividir Curso</h4>
            <p style={{ color: "var(--text-light)", fontSize: 14, marginBottom: 24 }}>Separa un curso mal escrito en <b>varios cursos correctos</b> (ej. "Matematica I y Matematica II" → "Matemática 1" + "Matemática 2").</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select className="input" value={dividirCursoSel} onChange={e => setDividirCursoSel(e.target.value)} style={{ padding: "12px 16px" }}>
                <option value="">Selecciona el curso a dividir...</option>
                {[...new Set(profesores.flatMap(p => p.cursos || []))].sort().map(c => <option key={`div-${c}`} value={c}>{c}</option>)}
              </select>
              <input className="input" placeholder='Cursos correctos separados por coma (ej: Matemática 1, Matemática 2)' value={dividirCursosNuevos} onChange={e => setDividirCursosNuevos(e.target.value)} style={{ padding: "12px 16px" }} />
              {dividirCursosNuevos.trim() && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {dividirCursosNuevos.split(",").map(c => c.trim()).filter(Boolean).map((c, i) => (
                    <span key={i} style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>📚 {capitalizeName(c)}</span>
                  ))}
                </div>
              )}
              <button className="btn btn-blue" disabled={!dividirCursoSel || !dividirCursosNuevos.trim()} onClick={async () => {
                const malo = dividirCursoSel;
                const nuevos = dividirCursosNuevos.split(",").map(c => capitalizeName(c.trim())).filter(Boolean);
                if (nuevos.length < 2) { showToast("⚠️ Escribe al menos 2 cursos separados por coma."); return; }
                const ok = await dividirCursoGlobal(malo, nuevos);
                if (ok) { setDividirCursoSel(""); setDividirCursosNuevos(""); }
              }} style={{ padding: "12px 24px", alignSelf: "flex-start" }}>Dividir</button>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>🛠️ Análisis de Base de Datos</h4>
            <p style={{ color: "var(--text-light)", fontSize: 14, marginBottom: 24 }}>Aquí puedes detectar si hay profesores duplicados por diferencias de tildes o mayúsculas, y cursos duplicados en un mismo profesor.</p>
            
            {(() => {
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

              const courseDuplicates = [];
              profesores.forEach(p => {
                const cMap = {};
                (p.cursos || []).forEach(c => {
                  const nc = normalizeText(c);
                  if (!cMap[nc]) cMap[nc] = [];
                  cMap[nc].push(c);
                });
                Object.values(cMap).forEach(arr => {
                  if (arr.length > 1) {
                    courseDuplicates.push({ prof: p, courses: arr });
                  }
                });
              });

              const globalCourseDuplicates = [];
              const globalCMap = {};
              profesores.forEach(p => {
                (p.cursos || []).forEach(c => {
                  const nc = normalizeText(c).replace(/\s+/g, ' '); // quitar multiples espacios
                  if (!globalCMap[nc]) globalCMap[nc] = new Set();
                  globalCMap[nc].add(c);
                });
              });
              Object.values(globalCMap).forEach(set => {
                if (set.size > 1) {
                  globalCourseDuplicates.push(Array.from(set));
                }
              });

              const uppercaseProfs = profesores.filter(p => p.nombre && p.nombre.trim().length > 0 && p.nombre.toUpperCase() === p.nombre && /[A-Z]/.test(p.nombre));

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>👨‍🏫 Profesores duplicados ({profDuplicates.length})</h5>
                    {profDuplicates.length === 0 ? (
                      <div style={{ padding: 12, background: "var(--ghost-bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>No se encontraron profesores duplicados.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {profDuplicates.map((d, i) => (
                          <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>🌍 Cursos duplicados GLOBALMENTE ({globalCourseDuplicates.length})</h5>
                    {globalCourseDuplicates.length === 0 ? (
                      <div style={{ padding: 12, background: "var(--ghost-bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>No hay variaciones de escritura del mismo curso.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {globalCourseDuplicates.map((arr, i) => (
                          <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12 }}>
                            <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 8, fontWeight: 600 }}>Variaciones encontradas:</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {arr.map((c, j) => (
                                <span key={j} style={{ background: "#f3f6fb", color: "#1e40af", padding: "4px 10px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={() => { setFusionarCursoMalo(c); window.scrollTo(0,0); }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>📚 Cursos duplicados ({courseDuplicates.length})</h5>
                    {courseDuplicates.length === 0 ? (
                      <div style={{ padding: 12, background: "var(--ghost-bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>No se encontraron cursos duplicados en los profesores.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {courseDuplicates.map((d, i) => (
                          <div key={i} style={{ padding: 16, border: "1px solid var(--border-color)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>{d.prof.nombre}</div>
                              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Duplicados: {d.courses.join(" / ")}</div>
                            </div>
                            <button className="btn btn-red" onClick={() => eliminarCurso(d.prof, d.courses[1])} style={{ padding: "6px 12px", fontSize: 12 }}>
                              Borrar "{d.courses[1]}"
                            </button>
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
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nombre}</div>
                            </div>
                            <button className="btn btn-blue" onClick={() => {
                              const capitalized = p.nombre.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                              editarProfesor(p.id, capitalized, p.bio || "", p.sede || "", p.alerta || "");
                            }} style={{ padding: "6px 12px", fontSize: 12 }}>
                              Corregir a Título
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
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
};
