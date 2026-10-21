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
  const [showFilters, setShowFilters] = useState(true);

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
      <div className="hero-section" style={{ background: `linear-gradient(145deg, #093563 0%, ${BD} 40%, ${B} 85%, #1d70c4 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,119,34,.22) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "5px 14px", marginBottom: 10, border: "1px solid rgba(255,255,255,.18)" }}>
            <span style={{ fontSize: 11.5, color: "#fff", fontWeight: 700, letterSpacing: 0.2 }}>🔒 100% anónimo · Comunidad estudiantil UCSUR</span>
          </div>
          <h1 className="hero-title" style={{ color: "#fff", fontSize: "clamp(22px, 4.5vw, 34px)", fontWeight: 800, marginBottom: 6, lineHeight: 1.18, letterSpacing: "-.5px" }}>
            ¿Qué profesor te tocó este ciclo?
          </h1>
          <p className="hero-subtitle" style={{ color: "rgba(255,255,255,.78)", fontSize: "clamp(13px, 2.2vw, 15.5px)", marginBottom: 16, fontWeight: 500 }}>
            {fraseInicio}
          </p>

          {/* Animated Stats bar */}
          <div className="hero-stats-grid" style={{ maxWidth: 640, margin: "0 auto" }}>
            {[
              { n: profesores.length, l: "profesores", i: "👨‍🏫" }, 
              { n: totalResenas, l: "reseñas", i: "💬" }, 
              { n: FACULTADES.length - 1, l: "facultades", i: "🏫" },
              { n: solicitudes?.length || 0, l: "secciones pedidas", i: "🗳️", action: () => navigate("solicitudes") }
            ].map(s => (
              <div 
                key={s.l} 
                onClick={s.action}
                className="hero-stat-card"
                style={{ 
                  background: "rgba(255,255,255,.11)", 
                  backdropFilter: "blur(6px)",
                  borderRadius: 14, 
                  padding: "9px 8px", 
                  display: "flex", 
                  flexDirection: "column",
                  gap: 3, 
                  alignItems: "center", 
                  justifyContent: "center",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,.14)",
                  cursor: s.action ? "pointer" : "default",
                  transition: "transform 0.2s, background 0.2s"
                }}
                onMouseEnter={(e) => s.action && (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                onMouseLeave={(e) => s.action && (e.currentTarget.style.background = "rgba(255,255,255,.11)")}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{s.i}</span>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>
                    <AnimatedCounter end={s.n} duration={1100} />
                  </span>
                </div>
                <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 600, lineHeight: 1.15, textAlign: "center" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y FILTROS (Visibles por defecto con opción de ocultar) */}
      <div style={{ 
        position: "sticky", top: 66, zIndex: 90, 
        background: "var(--card-bg)", 
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-color)", 
        padding: "10px 0",
        boxShadow: "var(--shadow-md)",
        transition: "all 0.25s ease"
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="search-bar-row">
              {/* Buscador con botón de limpiar rápido */}
              <div className="search-input" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 12, fontSize: 15, pointerEvents: "none", opacity: 0.7 }}>🔍</span>
                <input
                  className="input"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar profesor o curso..."
                  aria-label="Buscar"
                  style={{ fontSize: 14, padding: "10px 34px 10px 36px", borderRadius: 12, fontWeight: 600, border: "2px solid var(--primary-blue)" }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    aria-label="Limpiar búsqueda"
                    style={{ position: "absolute", right: 8, background: "var(--ghost-bg)", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botón para Mostrar / Ocultar Filtros */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className="btn"
                style={{
                  padding: "9px 13px",
                  borderRadius: 12,
                  fontSize: 12.5,
                  fontWeight: 800,
                  background: showFilters || activeFilterCount > 0 ? "var(--light-blue)" : "var(--ghost-bg)",
                  color: showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--text-dark)",
                  border: `1.5px solid ${showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--border-color)"}`,
                  flexShrink: 0
                }}
              >
                <span>🎛️ {showFilters ? "Ocultar filtros" : "Filtros"}</span>
                {activeFilterCount > 0 && (
                  <span style={{ background: "var(--primary-blue)", color: "#fff", borderRadius: 999, padding: "1px 6px", fontSize: 10.5, fontWeight: 800 }}>
                    {activeFilterCount}
                  </span>
                )}
                <span style={{ fontSize: 9.5, opacity: 0.75 }}>{showFilters ? "▲" : "▼"}</span>
              </button>

              {/* Ordenamiento */}
              <select
                className="input search-select"
                style={{ padding: "9px 12px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="populares">🔥 Populares</option>
                <option value="rating">⭐ Mejor rating</option>
                <option value="alfabetico">🔤 A - Z</option>
                <option value="aleatorio">🎲 Aleatorio</option>
              </select>
            </div>

            {/* Chips de filtros activos cuando el panel está oculto */}
            {!showFilters && activeFilterCount > 0 && (
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", paddingTop: 2 }}>
                <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>Activos:</span>
                {facFiltro !== "Todas" && (
                  <span onClick={() => setFacFiltro("Todas")} className="pill" style={{ background: FAC_COLOR[facFiltro] || B, color: "#fff", cursor: "pointer", padding: "3px 9px", fontSize: 11 }}>
                    {FAC_EMOJI[facFiltro] || ""} {facFiltro} ✕
                  </span>
                )}
                {sedeFiltro.map(s => (
                  <span key={s} onClick={() => setSedeFiltro(sedeFiltro.filter(x => x !== s))} className="pill" style={{ background: sedeColors[s] || B, color: "#fff", cursor: "pointer", padding: "3px 9px", fontSize: 11 }}>
                    📍 {s} ✕
                  </span>
                ))}
                <button onClick={() => { setFacFiltro("Todas"); setSedeFiltro([]); }} style={{ background: "none", border: "none", color: "var(--text-light)", fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                  Limpiar
                </button>
              </div>
            )}

            {/* Panel de Facultades y Sedes (Abierto por defecto, compacto en 1 línea por filtro) */}
            {showFilters && (
              <div className="fade-in" style={{ paddingTop: 6, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="custom-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, alignItems: "center", WebkitOverflowScrolling: "touch" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", marginRight: 2, flexShrink: 0 }}>🏫 Fac:</span>
                  {FACULTADES.map(f => (
                    <button key={f} onClick={() => setFacFiltro(f)}
                      aria-pressed={facFiltro === f}
                      style={{ 
                        padding: "5px 11px", borderRadius: 99, fontSize: 11.5, cursor: "pointer", fontWeight: 700, 
                        border: "1.5px solid", transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                        background: facFiltro === f ? (FAC_COLOR[f] || B) : "transparent", 
                        color: facFiltro === f ? "#fff" : (FAC_COLOR[f] || "var(--text-muted)"), 
                        borderColor: facFiltro === f ? (FAC_COLOR[f] || B) : (FAC_BG[f] || "var(--border-color)") 
                      }}>
                      {f === "Todas" ? "Todas" : `${FAC_EMOJI[f] || ""} ${f}`}
                    </button>
                  ))}
                </div>

                <div className="custom-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, alignItems: "center", WebkitOverflowScrolling: "touch" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", marginRight: 2, flexShrink: 0 }}>📍 Sede:</span>
                  <button onClick={() => setSedeFiltro([])}
                    aria-pressed={sedeFiltro.length === 0}
                    style={{ 
                      padding: "4px 11px", borderRadius: 99, fontSize: 11.5, cursor: "pointer", fontWeight: 700, 
                      border: "1.5px solid", transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
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
                          padding: "4px 11px", borderRadius: 99, fontSize: 11.5, cursor: "pointer", fontWeight: 700, 
                          border: "1.5px solid", transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
                          background: isSelected ? c : "transparent", 
                          color: isSelected ? "#fff" : "var(--text-muted)", 
                          borderColor: isSelected ? c : "var(--border-color)" 
                        }}>
                        📍 {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido superior compacto para llegar rápido a los profesores */}
      <div style={{ maxWidth: 840, margin: "14px auto 0", padding: "0 16px" }}>
        {/* Banner compacto "¿No encuentras a tu profe?" */}
        <div
          style={{
            background: `linear-gradient(135deg, var(--primary-blue), var(--dark-blue))`,
            borderRadius: 14,
            padding: "11px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            boxShadow: "0 6px 18px rgba(21, 96, 170, 0.18)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>👨‍🏫</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5, lineHeight: 1.2 }}>¿No encuentras a tu profesor?</div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11.5, fontWeight: 500 }}>Agrégalo o súmale un curso en segundos</div>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ fontSize: 12, padding: "8px 14px", borderRadius: 10, flexShrink: 0 }}
            onClick={() => navigate("agregar")}
          >
            ➕ Agregar Profesor
          </button>
        </div>

        {/* Noticia / Aviso en formato compacto (para no empujar la lista de profesores en celular) */}
        {noticias && noticias.length > 0 && (() => {
          const n = noticias[currentNewsIdx];
          if (!n) return null;
          const isNew = n.createdAt && (new Date() - n.createdAt.toDate()) < 3 * 24 * 60 * 60 * 1000;
          return (
            <div
              key={n.id}
              className="card fade-in"
              style={{ marginTop: 10, padding: "12px 14px", borderLeft: `4px solid ${B}`, display: "flex", alignItems: "center", gap: 12 }}
              onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={e => {
                if (touchStartX === null) return;
                const diff = touchStartX - e.changedTouches[0].clientX;
                if (diff > 50) setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1));
                else if (diff < -50) setCurrentNewsIdx(prev => (prev === 0 ? noticias.length - 1 : prev - 1));
                setTouchStartX(null);
              }}
            >
              {n.imagenUrl && (
                <img
                  src={n.imagenUrl}
                  alt={n.titulo}
                  onClick={() => setExpandedNews(n)}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, cursor: "pointer" }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--primary-blue)", textTransform: "uppercase" }}>📢 Aviso</span>
                  {isNew && <span style={{ background: "#EF4444", color: "#fff", fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>NUEVO</span>}
                  {noticias.length > 1 && (
                    <span style={{ fontSize: 10.5, color: "var(--text-light)", marginLeft: "auto" }}>
                      {currentNewsIdx + 1}/{noticias.length}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {n.titulo}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {n.contenido}
                </div>
              </div>
              <button
                onClick={() => setExpandedNews(n)}
                className="btn btn-ghost"
                style={{ padding: "7px 11px", fontSize: 11.5, borderRadius: 10, flexShrink: 0 }}
              >
                Ver →
              </button>
            </div>
          );
        })()}
      </div>

      <div style={{ maxWidth: 840, margin: "14px auto 0", padding: "0 16px 64px" }}>
        
        {/* Carrusel compacto de Nuevos Profesores */}
        {isSearchEmpty && profesoresNuevos.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                <span>✨</span> Recién agregados <span style={{ color: "var(--text-light)", fontSize: 11.5, fontWeight: 600 }}>(¡Sé el primero en calificarlos!)</span>
              </h3>
            </div>
            <div className="custom-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" }}>
              {profesoresNuevos.map(p => (
                <Link key={p.id} to={`/profesor/${p.id}`} className="card card-hover fade-in" 
                  style={{ width: 225, flexShrink: 0, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, borderLeft: `3.5px solid ${FAC_COLOR[p.facultad] || B}`, textDecoration: "none", scrollSnapAlign: "start" }}>
                  <Avatar name={p.nombre} fac={p.facultad} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--primary-blue)", fontWeight: 700, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {(p.cursos || [])[0] || p.facultad} · Calificar →
                    </div>
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
