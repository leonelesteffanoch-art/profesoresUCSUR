import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase.js";
import { B, BD, OR, CRIT, SEDES, FACULTADES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { formatFecha, avg, ratingColor } from "../utils/helpers.js";

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
  responderFeedback,
  editarProfesor,
  editCursoProf, setEditCursoProf,
  editCursoVal, setEditCursoVal
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiContenido, setNotiContenido] = useState("");
  const [notiImagen, setNotiImagen] = useState("");

  const [replyFeedbackId, setReplyFeedbackId] = useState(null);
  const [replyFeedbackText, setReplyFeedbackText] = useState("");

  const [editProfDetailsId, setEditProfDetailsId] = useState(null);
  const [editProfDetailsNombre, setEditProfDetailsNombre] = useState("");
  const [editProfDetailsBio, setEditProfDetailsBio] = useState("");
  const [editProfDetailsSede, setEditProfDetailsSede] = useState("");

  // Filtros Profesores
  const [busquedaAdmin, setBusquedaAdmin] = useState("");
  const [facFiltroAdmin, setFacFiltroAdmin] = useState("Todas");
  const [sedeFiltroAdmin, setSedeFiltroAdmin] = useState("Todas");
  const [ordenProfAdmin, setOrdenProfAdmin] = useState("rating_desc");

  // Filtros Reseñas
  const [busquedaResena, setBusquedaResena] = useState("");
  const [facFiltroResena, setFacFiltroResena] = useState("Todas");
  const [ordenResena, setOrdenResena] = useState("recientes");

  const filteredProfesores = profesores
    .filter(p => p.nombre?.toLowerCase().includes(busquedaAdmin.toLowerCase()) || p.cursos?.some(c => c.toLowerCase().includes(busquedaAdmin.toLowerCase())))
    .filter(p => facFiltroAdmin === "Todas" || p.facultad === facFiltroAdmin)
    .filter(p => sedeFiltroAdmin === "Todas" || (p.sede && p.sede === sedeFiltroAdmin) || (!p.sede && sedeFiltroAdmin === "Sin Sede"))
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
      showToast("⚠️ Completa el título y el contenido.");
      return;
    }
    await crearNoticia(notiTitulo, notiContenido, notiImagen);
    setNotiTitulo("");
    setNotiContenido("");
    setNotiImagen("");
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
      await deleteDoc(doc(db, "reportes", rep.id));
      showToast("🗑️ Reseña eliminada.");
    } catch (e) {
      showToast("❌ Error al eliminar.");
    }
  };

  const handleIgnorarReporte = async (rep) => {
    try {
      await deleteDoc(doc(db, "reportes", rep.id));
      showToast("✅ Reporte descartado.");
    } catch (e) {
      showToast("❌ Error al descartar.");
    }
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
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 32, paddingBottom: 8 }} className="hide-scrollbar">
        {[
          { id: "dashboard", label: "📊 Resumen" },
          { id: "profesores", label: "👨‍🏫 Profesores" },
          { id: "resenas", label: "💬 Reseñas" },
          { id: "reportes", label: `🚨 Reportes (${reportes.length})`, alert: reportes.length > 0 },
          { id: "feedbacks", label: `💡 Sugerencias (${feedbacks?.length || 0})`, alert: (feedbacks || []).some(f => !f.respuesta) },
          { id: "noticias", label: "📰 Noticias" }
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
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={facFiltroAdmin} onChange={e => setFacFiltroAdmin(e.target.value)}>
                <option value="Todas">Todas las facultades</option>
                {FACULTADES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={sedeFiltroAdmin} onChange={e => setSedeFiltroAdmin(e.target.value)}>
                <option value="Todas">Todas las sedes</option>
                <option value="Sin Sede">Sin sede asignada</option>
                {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer" }} value={ordenProfAdmin} onChange={e => setOrdenProfAdmin(e.target.value)}>
                <option value="rating_desc">⭐ Mejor calificación</option>
                <option value="rating_asc">📉 Peor calificación</option>
                <option value="resenas_desc">💬 Más reseñas</option>
                <option value="nombre_asc">🔤 Orden alfabético (A-Z)</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600, marginTop: 4 }}>
              Mostrando {filteredProfesores.length} profesores
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
                        <div style={{ display: "flex", gap: 8 }}>
                          <select className="input" style={{ fontSize: 13, padding: "8px 12px", width: "100%" }} value={editProfDetailsSede} onChange={e => setEditProfDetailsSede(e.target.value)}>
                            <option value="">Sin Sede</option>
                            {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-green" style={{ fontSize: 12, padding: "6px 12px" }} onClick={async () => {
                            if (!editProfDetailsNombre.trim()) { showToast("⚠️ Escribe un nombre."); return; }
                            await editarProfesor(p.id, editProfDetailsNombre, editProfDetailsBio, editProfDetailsSede);
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
                            setEditProfDetailsSede(p.sede || "");
                          }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} title="Editar nombre y bio">✏️</button>
                        </div>
                        {p.bio && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{p.bio}</div>}
                        <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 8, fontWeight: 500 }}>{p.facultad} {p.sede && `· Sede ${p.sede}`} · {p.totalReseñas || 0} reseñas</div>
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
            <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600, marginTop: 4 }}>
              Mostrando {filteredResenas.length} reseñas
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
          {reportes.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>No hay reseñas reportadas.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {reportes.map(rep => {
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
          {(!feedbacks || feedbacks.length === 0) ? (
             <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
               <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
               <div style={{ fontSize: 16, fontWeight: 700 }}>El buzón de sugerencias está vacío.</div>
             </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {feedbacks.map(f => (
                <div key={f.id} className="card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, borderLeft: f.respuesta ? "4px solid #cbd5e1" : "4px solid #fef08a", opacity: f.respuesta ? 0.7 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, color: "#2d3a50", lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap" }}>{f.mensaje}</p>
                    {f.contacto && <div style={{ fontSize: 13, color: "var(--text-dark)", fontWeight: 600, marginBottom: 4 }}>Contacto: {f.contacto}</div>}
                    <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500, marginBottom: f.respuesta ? 8 : 0 }}>🕐 {formatFecha(f.createdAt)}</div>
                    {f.respuesta && (
                      <div style={{ background: "#fef8c4", padding: 12, borderRadius: 8, marginTop: 8, borderLeft: "3px solid #eab308" }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {!f.respuesta && replyFeedbackId !== f.id && <button className="btn btn-blue" style={{ fontSize: 13, padding: "6px 12px", flexShrink: 0 }} onClick={() => { setReplyFeedbackId(f.id); setReplyFeedbackText(`> "${f.mensaje}"\n\n`); }}>💬 Responder</button>}
                    <button className="btn btn-red" style={{ fontSize: 13, padding: "6px 12px", flexShrink: 0 }} onClick={() => eliminarFeedback(f.id)}>🗑️ {f.respuesta ? "Eliminar" : "Descartar"}</button>
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

    </div>
  );
};
