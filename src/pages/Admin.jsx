import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase.js";
import { B, BD, OR, CRIT } from "../constants.js";
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
  navigate,
  showToast,
  eliminarResena,
  eliminarProfesor,
  eliminarCurso,
  adminAgregarCurso,
  crearNoticia,
  eliminarNoticia,
  editCursoProf, setEditCursoProf,
  editCursoVal, setEditCursoVal
}) => {
  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiContenido, setNotiContenido] = useState("");

  const handleCrearNoticia = async () => {
    if (!notiTitulo.trim() || !notiContenido.trim()) {
      showToast("⚠️ Completa el título y el contenido.");
      return;
    }
    await crearNoticia(notiTitulo, notiContenido);
    setNotiTitulo("");
    setNotiContenido("");
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
        <div className="card" style={{ padding: 36, textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: BD }}>⚙️ Panel de administrador</h2>
          <p style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 500, marginTop: 4 }}>Sesión: {adminUser.email}</p>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 13, padding: "10px 16px" }} onClick={async () => { await signOut(auth); navigate("home"); }}>
          Cerrar sesión
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Profesores", n: profesores.length, icon: "👨‍🏫", color: B }, 
          { label: "Reseñas totales", n: todasResenas.length, icon: "💬", color: OR }, 
          { label: "Noticias", n: noticias?.length || 0, icon: "📰", color: "#059669" },
          { label: "Reportes", n: reportes.length, icon: "🚨", color: "#DC2626" }
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "20px 24px", borderLeft: `5px solid ${s.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: BD, marginBottom: 16 }}>📰 Gestión de Noticias</h3>
      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Publicar nueva noticia</h4>
        <input className="input" placeholder="Título de la noticia" value={notiTitulo} onChange={e => setNotiTitulo(e.target.value)} style={{ marginBottom: 12, padding: "12px 16px" }} />
        <textarea className="textarea" placeholder="Contenido de la noticia (puedes escribir varios párrafos)..." value={notiContenido} onChange={e => setNotiContenido(e.target.value)} style={{ padding: "12px 16px", minHeight: 100, marginBottom: 12 }} />
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

      {reportes.length > 0 && <>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#DC2626", marginBottom: 16 }}>🚨 Reseñas reportadas ({reportes.length})</h3>
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
      </>}

      <h3 style={{ fontSize: 18, fontWeight: 800, color: BD, marginBottom: 16 }}>Profesores registrados</h3>
      <div className="card" style={{ padding: "8px 0", marginBottom: 32 }}>
        {profesores.map((p, i) => (
          <div key={p.id} style={{ borderTop: i > 0 ? "1px solid var(--border-color)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", flexWrap: "wrap" }}>
              <Avatar name={p.nombre} fac={p.facultad} size={48} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 8, fontWeight: 500 }}>{p.facultad} · {p.totalReseñas || 0} reseñas</div>
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
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: BD, marginBottom: 16 }}>Reseñas recientes ({todasResenas.length})</h3>
      {todasResenas.length === 0 && <div style={{ textAlign: "center", color: "var(--text-light)", fontSize: 14, padding: "32px 0", fontWeight: 500 }}>Cargando reseñas...</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {todasResenas.map(r => {
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
                <p style={{ fontSize: 14, color: "#2d3a50", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }}>{r.texto}</p>
                <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>🕐 {formatFecha(r.createdAt)}</div>
              </div>
              <button className="btn btn-red" style={{ fontSize: 14, padding: "8px 16px", flexShrink: 0 }} onClick={() => eliminarResena(prof || r.profId, r)}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
