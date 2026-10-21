import { useState, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import { FACULTADES, FAC_COLOR, FAC_BG, FAC_EMOJI, B, BD, BL, OR, SEDES } from "../constants.js";
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
  feedbacks,
  solicitudes
}) => {
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);
  const [newsHovered, setNewsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [expandedNews, setExpandedNews] = useState(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = "Profesores UCSUR | Califica y descubre a tus profesores";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Descubre, califica y lee reseñas de los profesores de la Universidad Científica del Sur (UCSUR).");
  }, []);

  useEffect(() => {
    setVisibleCount(15);
  }, [busqueda, facFiltro, sedeFiltro, sortBy]);

  // Autoplay para noticias
  useEffect(() => {
    if (!noticias || noticias.length <= 1 || newsHovered) return;
    const interval = setInterval(() => {
      setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [noticias, newsHovered]);

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
  const profesoresNuevos = profesores.filter(p => (p.totalReseñas || 0) === 0);
  const activeFilterCount = (facFiltro !== "Todas" ? 1 : 0) + sedeFiltro.length;
  const isSearchEmpty = !busqueda && activeFilterCount === 0;

  const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };

  return (
    <>
      {/* Hero */}
      <div style={{ background: `linear-gradient(145deg, #093563 0%, ${BD} 40%, ${B} 85%, #1d70c4 100%)`, padding: "44px 16px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,119,34,.22) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "6px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,.18)" }}>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, letterSpacing: 0.2 }}>🔒 100% anónimo · Comunidad estudiantil UCSUR</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 800, marginBottom: 10, lineHeight: 1.2, letterSpacing: "-.6px" }}>
            ¿Qué profesor te tocó este ciclo?
          </h1>
          <p style={{ color: "rgba(255,255,255,.78)", fontSize: "clamp(14px, 2.5vw, 16px)", marginBottom: 24, fontWeight: 500 }}>
            {fraseInicio}
          </p>

          {/* Animated Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 10, maxWidth: 620, margin: "0 auto" }}>
            {[
              { n: profesores.length, l: "profesores", i: "👨‍🏫" }, 
              { n: totalResenas, l: "reseñas", i: "💬" }, 
              { n: FACULTADES.length - 1, l: "facultades", i: "🏫" },
              { n: solicitudes?.length || 0, l: "secciones pedidas", i: "🗳️", action: () => navigate("solicitudes") }
            ].map(s => (
              <div 
                key={s.l} 
                onClick={s.action}
                style={{ 
                  background: "rgba(255,255,255,.11)", 
                  backdropFilter: "blur(6px)",
                  borderRadius: 14, 
                  padding: "10px 12px", 
                  display: "flex", 
                  gap: 8, 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,.12)",
                  cursor: s.action ? "pointer" : "default",
                  transition: "transform 0.2s, background 0.2s"
                }}
                onMouseEnter={(e) => s.action && (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                onMouseLeave={(e) => s.action && (e.currentTarget.style.background = "rgba(255,255,255,.11)")}
              >
                <span style={{ fontSize: 18 }}>{s.i}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>
                    <AnimatedCounter end={s.n} duration={1100} />
                  </div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5, fontWeight: 600 }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA FLOTANTE COMPACTA E INTUITIVA */}
      <div style={{ 
        position: "sticky", top: 64, zIndex: 90, 
        background: "var(--card-bg)", 
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-color)", 
        padding: "12px 0",
        boxShadow: "var(--shadow-md)",
        transition: "all 0.25s ease"
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="search-bar-row">
              {/* Buscador con botón de limpiar rápido */}
              <div className="search-input" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 14, fontSize: 16, pointerEvents: "none", opacity: 0.7 }}>🔍</span>
                <input
                  className="input"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar profesor o curso (ej. Cálculo, Biología)..."
                  aria-label="Buscar"
                  style={{ fontSize: 15, padding: "12px 38px 12px 40px", borderRadius: 14, fontWeight: 600, border: "2px solid var(--primary-blue)" }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    aria-label="Limpiar búsqueda"
                    style={{ position: "absolute", right: 10, background: "var(--ghost-bg)", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botón de Filtros (Facultad y Sede) */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className="btn"
                style={{
                  padding: "11px 16px",
                  borderRadius: 14,
                  fontSize: 13.5,
                  fontWeight: 800,
                  background: showFilters || activeFilterCount > 0 ? "var(--light-blue)" : "var(--ghost-bg)",
                  color: showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--text-dark)",
                  border: `1.5px solid ${showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--border-color)"}`,
                  flexShrink: 0
                }}
              >
                <span>🎛️ Filtros</span>
                {activeFilterCount > 0 && (
                  <span style={{ background: "var(--primary-blue)", color: "#fff", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>
                    {activeFilterCount}
                  </span>
                )}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{showFilters ? "▲" : "▼"}</span>
              </button>

              {/* Ordenamiento */}
              <select
                className="input search-select"
                style={{ padding: "11px 14px", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="populares">🔥 Populares</option>
                <option value="rating">⭐ Mejor rating</option>
                <option value="alfabetico">🔤 A - Z</option>
                <option value="aleatorio">🎲 Aleatorio</option>
              </select>
            </div>

            {/* Chips de filtros activos cuando el panel está cerrado */}
            {!showFilters && activeFilterCount > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingTop: 2 }}>
                <span style={{ fontSize: 11.5, color: "var(--text-light)", fontWeight: 700 }}>Activos:</span>
                {facFiltro !== "Todas" && (
                  <span onClick={() => setFacFiltro("Todas")} className="pill" style={{ background: FAC_COLOR[facFiltro] || B, color: "#fff", cursor: "pointer", padding: "4px 10px", fontSize: 11.5 }}>
                    {FAC_EMOJI[facFiltro] || ""} {facFiltro} ✕
                  </span>
                )}
                {sedeFiltro.map(s => (
                  <span key={s} onClick={() => setSedeFiltro(sedeFiltro.filter(x => x !== s))} className="pill" style={{ background: sedeColors[s] || B, color: "#fff", cursor: "pointer", padding: "4px 10px", fontSize: 11.5 }}>
                    📍 Sede {s} ✕
                  </span>
                ))}
                <button onClick={() => { setFacFiltro("Todas"); setSedeFiltro([]); }} style={{ background: "none", border: "none", color: "var(--text-light)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Panel desplegable de Facultades y Sedes */}
            {showFilters && (
              <div className="fade-in" style={{ paddingTop: 6, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🏫 Facultad</div>
                  <div className="custom-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, alignItems: "center", WebkitOverflowScrolling: "touch" }}>
                    {FACULTADES.map(f => (
                      <button key={f} onClick={() => setFacFiltro(f)}
                        aria-pressed={facFiltro === f}
                        style={{ 
                          padding: "6px 13px", borderRadius: 20, fontSize: 12.5, cursor: "pointer", fontWeight: 700, 
                          border: "1.5px solid", transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                          background: facFiltro === f ? (FAC_COLOR[f] || B) : "transparent", 
                          color: facFiltro === f ? "#fff" : (FAC_COLOR[f] || "var(--text-muted)"), 
                          borderColor: facFiltro === f ? (FAC_COLOR[f] || B) : (FAC_BG[f] || "var(--border-color)") 
                        }}>
                        {f === "Todas" ? "Todas las Facultades" : `${FAC_EMOJI[f] || ""} ${f}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>📍 Sede (puedes elegir varias)</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setSedeFiltro([])}
                      aria-pressed={sedeFiltro.length === 0}
                      style={{ 
                        padding: "5px 12px", borderRadius: 20, fontSize: 12.5, cursor: "pointer", fontWeight: 700, 
                        border: "1.5px solid", transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                        background: sedeFiltro.length === 0 ? "var(--text-dark)" : "transparent", 
                        color: sedeFiltro.length === 0 ? "var(--bg-main)" : "var(--text-dark)", 
                        borderColor: sedeFiltro.length === 0 ? "var(--text-dark)" : "var(--border-color)" 
                      }}>
                      🌍 Todas
                    </button>

                    {SEDES.map(s => {
                      const isSelected = sedeFiltro.includes(s);
                      const c = sedeColors[s] || B;
                      return (
                        <button key={s} onClick={() => {
                            if (isSelected) setSedeFiltro(sedeFiltro.filter(x => x !== s));
                            else setSedeFiltro([...sedeFiltro, s]);
                          }}
                          aria-pressed={isSelected}
                          style={{ 
                            padding: "5px 12px", borderRadius: 20, fontSize: 12.5, cursor: "pointer", fontWeight: 700, 
                            border: "1.5px solid", transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                            background: isSelected ? c : "transparent", 
                            color: isSelected ? "#fff" : "var(--text-muted)", 
                            borderColor: isSelected ? c : "var(--border-color)" 
                          }}>
                          📍 Sede {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed de Noticias (Slider Automático) */}
      {noticias && noticias.length > 0 && (
        <div style={{ maxWidth: 840, margin: "24px auto 0", padding: "0 16px" }}
             onMouseEnter={() => setNewsHovered(true)}
             onMouseLeave={() => setNewsHovered(false)}
             onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
             onTouchEnd={e => {
               if (touchStartX === null) return;
               const touchEndX = e.changedTouches[0].clientX;
               const diff = touchStartX - touchEndX;
               if (diff > 50) setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1));
               else if (diff < -50) setCurrentNewsIdx(prev => (prev === 0 ? noticias.length - 1 : prev - 1));
               setTouchStartX(null);
             }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <span>📢</span> Novedades de la plataforma
            </h3>
            
            {noticias.length > 1 && (
              <div style={{ display: "flex", gap: 5 }}>
                {noticias.map((_, idx) => (
                  <div key={idx} onClick={() => setCurrentNewsIdx(idx)} style={{
                    width: currentNewsIdx === idx ? 18 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: currentNewsIdx === idx ? "var(--primary-blue)" : "var(--border-color)",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }} />
                ))}
              </div>
            )}
          </div>
          
          <div style={{ position: "relative" }}>
            {noticias.length > 1 && (
              <>
                <button className="btn btn-ghost desktop-only" onClick={() => setCurrentNewsIdx(prev => (prev === 0 ? noticias.length - 1 : prev - 1))}
                  style={{ position: "absolute", left: -48, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "var(--card-bg)", border: "1px solid var(--border-color)", width: 40, height: 40, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                  ←
                </button>
                <button className="btn btn-ghost desktop-only" onClick={() => setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1))}
                  style={{ position: "absolute", right: -48, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "var(--card-bg)", border: "1px solid var(--border-color)", width: 40, height: 40, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                  →
                </button>
              </>
            )}
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
                      {isNew && <span style={{ background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10, letterSpacing: 0.5, flexShrink: 0 }}>NUEVO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 12, fontWeight: 500 }}>🗓️ {formatFechaExacta(n.createdAt)}</div>
                    <p className="custom-scrollbar" style={{ 
                      fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, 
                      whiteSpace: "pre-wrap", maxHeight: 140, overflowY: "auto", paddingRight: 4 
                    }}>{n.contenido}</p>
                    <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {n.link && (
                        <a href={n.link.startsWith("http") ? n.link : `https://${n.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-blue" style={{ display: "inline-flex", alignItems: "center", fontSize: 13, padding: "8px 16px", textDecoration: "none" }}>📲 Únete al Canal de Difusión</a>
                      )}
                      <button onClick={() => setExpandedNews(n)} className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", fontSize: 13, padding: "8px 16px" }}>🔍 Leer completo</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* BANNER de "¿No encuentras a tu profe?" */}
      <div style={{ maxWidth: 840, margin: "18px auto 0", padding: "0 16px" }}>
        <div className="add-banner" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>👨‍🏫</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 3 }}>¿No encuentras a tu profesor?</div>
            <div style={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 500 }}>Agrégalo en segundos o súmale un curso para ayudar a toda la UCSUR.</div>
          </div>
          <button className="btn-cta" style={{ fontSize: 13.5, padding: "11px 20px", flexShrink: 0 }} onClick={() => navigate("agregar")}>
            ➕ Agregar profe
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 840, margin: "22px auto 0", padding: "0 16px 64px" }}>
        
        {/* Carrusel de Nuevos Profesores */}
        {isSearchEmpty && profesoresNuevos.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, margin: "0 0 14px 0" }}>
              <span>✨</span> Recién agregados <span style={{ color: "var(--text-light)", fontSize: 12.5, fontWeight: 600 }}>(¡Sé el primero en calificarlos!)</span>
            </h3>
            <div className="custom-scrollbar" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 14, scrollSnapType: "x mandatory" }}>
              {profesoresNuevos.map(p => (
                <Link key={p.id} to={`/profesor/${p.id}`} className="card card-hover fade-in" 
                  style={{ width: 270, flexShrink: 0, padding: "16px", display: "flex", flexDirection: "column", gap: 12, borderTop: `4px solid ${FAC_COLOR[p.facultad] || B}`, textDecoration: "none", scrollSnapAlign: "start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={p.nombre} fac={p.facultad} size={46} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.facultad}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(p.cursos || []).slice(0, 2).map(c => <span key={c} className="pill" style={{ background: "var(--ghost-bg)", color: "var(--text-muted)", fontSize: 11, padding: "4px 9px" }}>📚 {c}</span>)}
                    {(p.cursos || []).length > 2 && <span className="pill" style={{ background: "transparent", color: "var(--text-light)", fontSize: 11, padding: "4px 8px", border: "1px solid var(--border-color)" }}>+{p.cursos.length - 2}</span>}
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px dashed var(--border-color)", textAlign: "center" }}>
                    <span style={{ color: "var(--primary-blue)", fontSize: 12.5, fontWeight: 800 }}>Dejar primera reseña →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contador de resultados cuando se busca o filtra */}
        {!loading && (!isSearchEmpty || sortBy !== "aleatorio") && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
              Mostrando {filtered.length} profesor{filtered.length === 1 ? "" : "es"}
            </span>
          </div>
        )}

        {/* Lista Principal */}
        <div className="prof-grid">
          {loading && <SkeletonCard count={6} />}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ padding: "52px 24px", textAlign: "center", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ color: "var(--text-dark)", fontSize: 17, fontWeight: 800, marginBottom: 6 }}>No encontramos resultados</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Intenta con otro nombre o agrega al profesor si aún no está registrado.</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => { setBusqueda(""); setFacFiltro("Todas"); setSedeFiltro([]); }}>Limpiar filtros</button>
                <button className="btn btn-orange" onClick={() => navigate("agregar")}>➕ Agregar profe nuevo</button>
              </div>
            </div>
          )}
          {filtered.slice(0, visibleCount).map((p, i) => (
            <Fragment key={p.id}>
              {i === 4 && (
                <div className="card fade-in" style={{ gridColumn: "1 / -1", background: `linear-gradient(135deg, ${B}, ${BD})`, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>¿Tus amigos andan perdidos con la matrícula?</div>
                    <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 13.5, fontWeight: 500 }}>¡Pásales el link de la página y sálvales el ciclo!</div>
                  </div>
                  <button className="btn" onClick={(e) => {
                      e.preventDefault();
                      const text = "Mira las reseñas de los profes antes de matricularte y salva tu ciclo 🚀 👉 " + window.location.origin;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }} style={{ background: "#25D366", color: "#fff", fontWeight: 800, padding: "11px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    Compartir en WhatsApp
                  </button>
                </div>
              )}
              {i === 12 && (
                <div className="card fade-in" style={{ gridColumn: "1 / -1", background: `linear-gradient(135deg, ${OR}, #f09040)`, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Ayuda a que la comunidad crezca 🌱</div>
                    <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 13.5, fontWeight: 500 }}>Mientras más personas califiquen, ¡mejores referencias tendremos todos!</div>
                  </div>
                  <button className="btn" onClick={(e) => {
                      e.preventDefault();
                      const text = "Únete a la comunidad y revisa qué profes valen la pena en UCSUR 🌱 👉 " + window.location.origin;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }} style={{ background: "#25D366", color: "#fff", fontWeight: 800, padding: "11px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    Recomendar página
                  </button>
                </div>
              )}
              <Link to={`/profesor/${p.id}`} className="card card-hover fade-in" 
                style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, borderLeft: `5px solid ${FAC_COLOR[p.facultad] || B}`, animationDelay: `${Math.min(i, 10) * .03}s`, textDecoration: "none" }}>
                <Avatar name={p.nombre} fac={p.facultad} size={54} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: "var(--text-dark)", marginBottom: 6, lineHeight: 1.25 }}>
                    {p.nombre}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {p.facultades?.slice(0, 2).map(f => (
                      <span key={f} className="pill" style={{ background: FAC_BG[f] || BL, color: FAC_COLOR[f] || BD }}>{FAC_EMOJI[f] || ""} {f}</span>
                    ))}
                    {(p.sedes || [p.sede].filter(Boolean)).map(s => (
                      <span key={s} className="pill" style={{ background: "var(--ghost-bg)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>📍 {s}</span>
                    ))}
                    {(p.cursos || []).slice(0, 3).map(c => (
                      <span key={c} className="pill" style={{ background: "var(--ghost-bg)", color: "var(--text-muted)" }}>📚 {c}</span>
                    ))}
                    {(p.cursos || []).length > 3 && (
                      <span className="pill" style={{ background: "transparent", color: "var(--text-light)", border: "1px solid var(--border-color)" }}>
                        +{p.cursos.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                  <RatingChip r={p.rating} />
                  <div style={{ marginTop: 6 }}><Stars value={p.rating} size={13} gap={1} /></div>
                  <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4, fontWeight: 700 }}>{p.totalReseñas || 0} reseñas</div>
                </div>
              </Link>
            </Fragment>
          ))}
        </div>
        
        {visibleCount < filtered.length && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button 
              className="btn btn-blue" 
              style={{ padding: "13px 28px", fontSize: 14.5, fontWeight: 800, borderRadius: 999 }}
              onClick={() => setVisibleCount(v => v + 15)}
            >
              ⬇️ Mostrar más profesores ({filtered.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>
      
      {/* Modal Manual para Agrandar Noticia */}
      {expandedNews && createPortal(
        <div onClick={() => setExpandedNews(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ maxWidth: 550, width: "100%", maxHeight: "90vh", position: "relative", overflowY: "auto", background: "var(--card-bg)" }}>
            <button onClick={() => setExpandedNews(null)} 
              style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>✖</button>
            
            {expandedNews.imagenUrl && (
              <img src={expandedNews.imagenUrl} alt={expandedNews.titulo} 
                onError={(e) => { e.target.style.display = 'none'; }} 
                style={{ width: "100%", height: 240, objectFit: "cover", display: "block", borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
            )}
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8, lineHeight: 1.3 }}>{expandedNews.titulo}</h3>
              <div style={{ fontSize: 12.5, color: "var(--text-light)", marginBottom: 18, fontWeight: 600 }}>🗓️ {formatFechaExacta(expandedNews.createdAt)}</div>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 24 }}>{expandedNews.contenido}</p>
              
              {expandedNews.link && (
                <a href={expandedNews.link.startsWith("http") ? expandedNews.link : `https://${expandedNews.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-blue" style={{ display: "flex", width: "100%", padding: "14px", textDecoration: "none", marginBottom: 12, fontSize: 14.5 }}>📲 Únete al Canal de Difusión</a>
              )}
              
              <button className="btn btn-ghost" onClick={() => setExpandedNews(null)} style={{ width: "100%", padding: "12px", fontWeight: 800 }}>Cerrar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
