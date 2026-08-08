import { useState } from "react";
import { FACULTADES, FAC_COLOR, FAC_BG, FAC_EMOJI, B, BD, BL, SEDES } from "../constants.js";
import { Link } from "react-router-dom";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { AnimatedCounter } from "../components/UI/AnimatedCounter.jsx";
import { SkeletonCard } from "../components/UI/SkeletonCard.jsx";
import { formatFechaExacta, normalizeText } from "../utils/helpers.js";

export const Home = ({
  fraseInicio,
  busqueda,
  setBusqueda,
  profesores,
  facFiltro,
  setFacFiltro,
  sedeFiltro,
  setSedeFiltro,
  sortBy,
  setSortBy,
  loading,
  navigate,
  noticias,
  feedbacks
}) => {
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);

  const filtered = profesores
    .filter(p => normalizeText(p.nombre).includes(normalizeText(busqueda)) || p.cursos?.some(c => normalizeText(c).includes(normalizeText(busqueda))))
    .filter(p => facFiltro === "Todas" || p.facultades?.includes(facFiltro))
    .filter(p => sedeFiltro.length === 0 || p.sedes?.some(s => sedeFiltro.includes(s)))
    .sort((a, b) => {
      if (sortBy === "alfabetico") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "aleatorio") return (b._randomOrder || 0) - (a._randomOrder || 0);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return (b.totalReseñas || 0) - (a.totalReseñas || 0);
    });

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
          {/* El buscador se movió abajo a la barra flotante */}
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

      {/* 🔍 BARRA DE BÚSQUEDA FLOTANTE (STICKY) */}
      <div style={{ 
        position: "sticky", top: 64, zIndex: 90, 
        background: "var(--bg-main)", 
        borderBottom: "1px solid var(--border-color)", 
        padding: "16px 0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        transition: "background-color 0.3s ease"
      }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="search-bar-row">
              <input className="input search-input custom-search-input" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="🔍 Buscar profe o curso..." aria-label="Buscar" style={{ fontSize: 16, padding: "14px 18px", borderRadius: 16, fontWeight: 600, border: "2px solid var(--primary-blue)" }} />
              
              <select className="input search-select" style={{ padding: "12px 16px", borderRadius: 16, fontWeight: 700, cursor: "pointer" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="populares">🔥 Populares</option>
                <option value="rating">⭐ Mejor rating</option>
                <option value="alfabetico">🔤 Alfabético</option>
                <option value="aleatorio">🎲 Aleatorio</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", paddingBottom: 8, marginTop: 4 }}>
              {/* Botón Todas */}
              <button onClick={() => setSedeFiltro([])}
                aria-pressed={sedeFiltro.length === 0}
                style={{ 
                  padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 700, 
                  border: "1.5px solid", transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                  background: sedeFiltro.length === 0 ? "var(--text-dark)" : "transparent", 
                  color: sedeFiltro.length === 0 ? "var(--bg-main)" : "var(--text-dark)", 
                  borderColor: sedeFiltro.length === 0 ? "var(--text-dark)" : "var(--border-color)" 
                }}>
                🌍 Todas las Sedes
              </button>

              {SEDES.map(s => {
                const isSelected = sedeFiltro.includes(s);
                const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };
                const c = sedeColors[s] || B;
                
                return (
                  <button key={s} onClick={() => {
                      if (isSelected) setSedeFiltro(sedeFiltro.filter(x => x !== s));
                      else setSedeFiltro([...sedeFiltro, s]);
                    }}
                    aria-pressed={isSelected}
                    style={{ 
                      padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 700, 
                      border: "1.5px solid", transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                      background: isSelected ? c : "transparent", 
                      color: isSelected ? "#fff" : "var(--text-muted)", 
                      borderColor: isSelected ? c : "var(--border-color)" 
                    }}>
                    📍 {s}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: "var(--text-light)", fontStyle: "italic", marginTop: -4 }}>
              *Nota: No todos los profesores tienen una sede registrada.
            </div>
          </div>
        </div>
      </div>

      {/* Feed de Noticias (Slider) */}
      {noticias && noticias.length > 0 && (
        <div style={{ maxWidth: 780, margin: "24px auto 0", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <span>📢</span> Novedades de la plataforma
            </h3>
            
            {noticias.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: "4px 10px", fontSize: 14, background: "var(--border-color)", border: "none" }}
                  onClick={() => setCurrentNewsIdx(prev => (prev === 0 ? noticias.length - 1 : prev - 1))}
                >
                  ←
                </button>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", width: 40, justifyContent: "center" }}>
                  {currentNewsIdx + 1} / {noticias.length}
                </div>
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: "4px 10px", fontSize: 14, background: "var(--border-color)", border: "none" }}
                  onClick={() => setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1))}
                >
                  →
                </button>
              </div>
            )}
          </div>
          
          <div style={{ position: "relative" }}>
            {(() => {
              const n = noticias[currentNewsIdx];
              if (!n) return null;
              const isNew = n.createdAt && (new Date() - n.createdAt.toDate()) < 3 * 24 * 60 * 60 * 1000;
              return (
                <div key={n.id} className="card fade-in" style={{ borderLeft: `4px solid ${B}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {n.imagenUrl && (
                    <div style={{ width: "100%", height: 180, overflow: "hidden", flexShrink: 0 }}>
                      <img src={n.imagenUrl} alt={n.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", flex: 1 }}>{n.titulo}</div>
                      {isNew && <span style={{ background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10, letterSpacing: 0.5, flexShrink: 0 }}>NUEVO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 12, fontWeight: 500 }}>🗓️ {formatFechaExacta(n.createdAt)}</div>
                    <p className="custom-scrollbar" style={{ 
                      fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, 
                      whiteSpace: "pre-wrap", maxHeight: 150, overflowY: "auto", paddingRight: 4 
                    }}>{n.contenido}</p>
                  </div>
                </div>
              );
            })()}
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
        {/* Lista */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, alignItems: "flex-start" }}>
          {loading && <SkeletonCard count={4} />}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ padding: 64, textAlign: "center", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <div style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 24, fontWeight: 500 }}>No se encontraron profesores con esos filtros.</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => { setBusqueda(""); setFacFiltro("Todas"); }}>Limpiar filtros</button>
                <button className="btn btn-orange" onClick={() => navigate("agregar")}>➕ Agregar profe nuevo</button>
              </div>
            </div>
          )}
          {filtered.map((p, i) => (
            <Link key={p.id} to={`/profesor/${p.id}`} className="card card-hover fade-in" 
              style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, borderLeft: `5px solid ${FAC_COLOR[p.facultad] || B}`, animationDelay: `${i * .04}s`, textDecoration: "none" }}>
              <Avatar name={p.nombre} fac={p.facultad} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-dark)", marginBottom: 6 }}>{p.nombre}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {p.facultades?.map(f => (
                    <span key={f} className="pill" style={{ background: FAC_BG[f] || BL, color: FAC_COLOR[f] || BD }}>{FAC_EMOJI[f] || ""} {f}</span>
                  ))}
                </div>
                {(p.sedes || [p.sede].filter(Boolean)).map(s => <span key={s} className="pill" style={{ background: "var(--border-color)", color: "var(--text-muted)" }}>📍 Sede {s}</span>)}
                {(p.cursos || []).map(c => <span key={c} className="pill" style={{ background: "var(--border-color)", color: "var(--text-muted)" }}>📚 {c}</span>)}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <RatingChip r={p.rating} />
                <div style={{ marginTop: 6 }}><Stars value={p.rating} size={14} gap={1} /></div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4, fontWeight: 600 }}>{p.totalReseñas || 0} reseñas</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
