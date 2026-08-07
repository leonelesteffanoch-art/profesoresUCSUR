import { FACULTADES, FAC_COLOR, FAC_BG, FAC_EMOJI, B, BD, BL } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { AnimatedCounter } from "../components/UI/AnimatedCounter.jsx";
import { SkeletonCard } from "../components/UI/SkeletonCard.jsx";
import { formatFecha } from "../utils/helpers.js";

export const Home = ({
  fraseInicio,
  busqueda,
  setBusqueda,
  profesores,
  facFiltro,
  setFacFiltro,
  sortBy,
  setSortBy,
  loading,
  navigate,
  noticias
}) => {
  const filtered = profesores
    .filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.cursos?.some(c => c.toLowerCase().includes(busqueda.toLowerCase())))
    .filter(p => facFiltro === "Todas" || p.facultad === facFiltro)
    .sort((a, b) => sortBy === "rating" ? (b.rating || 0) - (a.rating || 0) : (b.totalReseñas || 0) - (a.totalReseñas || 0));

  const totalResenas = profesores.reduce((t, p) => t + (p.totalReseñas || 0), 0);

  return (
    <>
      {/* Hero */}
      <div style={{ background: `linear-gradient(150deg, ${BD} 0%, ${B} 55%, #2176c7 100%)`, padding: "52px 20px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(232,119,34,.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.13)", borderRadius: 20, padding: "5px 16px", marginBottom: 18, border: "1px solid rgba(255,255,255,.15)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.9)", fontWeight: 600 }}>🔒 100% anónimo · sin registro</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 10, lineHeight: 1.25, letterSpacing: "-.5px" }}>¿Qué profesor te tocó este ciclo?</h1>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, marginBottom: 26, fontWeight: 500 }}>{fraseInicio}</p>
          <div style={{ display: "flex", gap: 10, background: "rgba(255,255,255,.15)", borderRadius: 16, padding: 8, border: "1px solid rgba(255,255,255,.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <input className="input" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="🔍 Buscar por nombre o curso..." aria-label="Buscar por nombre o curso" style={{ flex: 1, border: "none", background: "rgba(255,255,255,.98)", fontSize: 15, padding: "14px 18px" }} />
          </div>
          {/* Animated Stats bar */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {[
              { n: profesores.length, l: "profesores", i: "👨‍🏫" }, 
              { n: totalResenas, l: "reseñas", i: "💬" }, 
              { n: FACULTADES.length - 1, l: "facultades", i: "🏫" }
            ].map(s => (
              <div key={s.l} style={{ background: "rgba(255,255,255,.12)", borderRadius: 12, padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", border: "1px solid rgba(255,255,255,.08)" }}>
                <span style={{ fontSize: 18 }}>{s.i}</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
                  <AnimatedCounter end={s.n} duration={1200} />
                </span>
                <span style={{ color: "rgba(255,255,255,.65)", fontSize: 13, fontWeight: 500 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed de Noticias */}
      {noticias && noticias.length > 0 && (
        <div style={{ maxWidth: 780, margin: "24px auto 0", padding: "0 16px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📢</span> Novedades de la plataforma
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {noticias.map(n => (
              <div key={n.id} className="card fade-in" style={{ padding: "16px 20px", borderLeft: `4px solid ${B}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>{n.titulo}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 8, fontWeight: 500 }}>🗓️ {formatFecha(n.createdAt)}</div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{n.contenido}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNER de "¿No encuentras a tu profe?" */}
      <div style={{ maxWidth: 780, margin: "16px auto 0", padding: "0 16px" }}>
        <div className="add-banner" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>👨‍🏫</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>¿No encuentras a tu profesor?</div>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 500 }}>Agrégalo en segundos para que todos puedan calificarlo.</div>
          </div>
          <button className="btn-cta" style={{ fontSize: 14, padding: "12px 20px" }} onClick={() => navigate("agregar")}>
            ➕ Agregar profe
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "20px auto 0", padding: "0 16px 64px" }}>
        {/* Filtros */}
        <div className="card" style={{ padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {FACULTADES.map(f => (
              <button key={f} onClick={() => setFacFiltro(f)}
                aria-pressed={facFiltro === f}
                style={{ 
                  padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 700, 
                  border: "1.5px solid", transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                  background: facFiltro === f ? (FAC_COLOR[f] || B) : "transparent", 
                  color: facFiltro === f ? "#fff" : (FAC_COLOR[f] || "var(--text-muted)"), 
                  borderColor: facFiltro === f ? (FAC_COLOR[f] || B) : (FAC_BG[f] || "var(--border-color)") 
                }}>
                {f === "Todas" ? "Todas" : `${FAC_EMOJI[f] || ""} ${f}`}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <select className="input" style={{ width: "auto", padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-dark)", cursor: "pointer" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rating">⭐ Mejor calificados</option>
              <option value="resenas">💬 Más reseñas</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && <SkeletonCard count={4} />}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ padding: 64, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <div style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 24, fontWeight: 500 }}>No se encontraron profesores con esos filtros.</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => { setBusqueda(""); setFacFiltro("Todas"); }}>Limpiar filtros</button>
                <button className="btn btn-orange" onClick={() => navigate("agregar")}>➕ Agregar profe nuevo</button>
              </div>
            </div>
          )}
          {filtered.map((p, i) => (
            <div key={p.id} className="card card-hover fade-in" onClick={() => navigate("perfil", p)}
              style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, borderLeft: `5px solid ${FAC_COLOR[p.facultad] || B}`, animationDelay: `${i * .04}s`, cursor: "pointer" }}>
              <Avatar name={p.nombre} fac={p.facultad} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-dark)", marginBottom: 6 }}>{p.nombre}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="pill" style={{ background: FAC_BG[p.facultad] || BL, color: FAC_COLOR[p.facultad] || BD }}>{FAC_EMOJI[p.facultad] || ""} {p.facultad}</span>
                  {(p.cursos || []).map(c => <span key={c} className="pill" style={{ background: "var(--border-color)", color: "var(--text-muted)" }}>📚 {c}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <RatingChip r={p.rating} />
                <div style={{ marginTop: 6 }}><Stars value={p.rating} size={14} gap={1} /></div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4, fontWeight: 600 }}>{p.totalReseñas || 0} reseñas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
