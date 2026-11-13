import { useState, useEffect, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { FACULTADES, FAC_COLOR, FAC_EMOJI, B, BD, OR, SEDES } from "../constants.js";
import { Link } from "react-router-dom";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { AnimatedCounter } from "../components/UI/AnimatedCounter.jsx";
import { SkeletonCard } from "../components/UI/SkeletonCard.jsx";
import { formatFechaExacta, normalizeText } from "../utils/helpers.js";

const BookmarkIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
  solicitudes,
  savedIds = [],
  toggleSaveProf
}) => {
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);
  const [newsHovered, setNewsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [expandedNews, setExpandedNews] = useState(null);
  const [visibleCount, setVisibleCount] = useState(15);
  const [showFilters, setShowFilters] = useState(true);
  const [onlySaved, setOnlySaved] = useState(false);
  const searchBarRef = useRef(null);

  useEffect(() => {
    document.title = "Profesores UCSUR | Califica y descubre a tus profesores";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Descubre, califica y lee reseñas de los profesores de la Universidad Científica del Sur (UCSUR).");
  }, []);

  useEffect(() => {
    setVisibleCount(15);
  }, [busqueda, facFiltro, sedeFiltro, sortBy, onlySaved]);

  useEffect(() => {
    if (onlySaved && savedIds.length === 0) {
      setOnlySaved(false);
    }
  }, [savedIds, onlySaved]);

  // Autoplay para noticias
  useEffect(() => {
    if (!noticias || noticias.length <= 1 || newsHovered) return;
    const interval = setInterval(() => {
      setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [noticias, newsHovered]);

  const filtered = profesores
    .filter(p => !onlySaved || savedIds.includes(p.id))
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
  const activeFilterCount = (facFiltro !== "Todas" ? 1 : 0) + sedeFiltro.length + (onlySaved ? 1 : 0);
  const isSearchEmpty = !busqueda && activeFilterCount === 0;

  const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };

  return (
    <>
      {/* Hero */}
      <div
        className="hero-grid-pattern"
        style={{
          backgroundColor: BD,
          backgroundImage: `radial-gradient(at 15% 15%, rgba(56, 189, 248, 0.16) 0, transparent 48%), radial-gradient(at 88% 82%, rgba(232, 119, 34, 0.22) 0, transparent 52%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(145deg, #07294d 0%, ${BD} 45%, ${B} 100%)`,
          backgroundSize: "100% 100%, 100% 100%, 32px 32px, 32px 32px, 100% 100%",
          padding: "46px 16px 54px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.12)", backdropFilter: "blur(10px)", borderRadius: 999, padding: "6px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,.2)", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, letterSpacing: 0.25 }}>100% anónimo · Comunidad estudiantil UCSUR</span>
          </div>

          <h1 style={{ color: "#fff", fontSize: "clamp(27px, 5vw, 38px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.16, letterSpacing: "-0.8px", textShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
            ¿Qué profesor te tocó este ciclo?
          </h1>
          <p style={{ color: "rgba(255,255,255,.82)", fontSize: "clamp(14px, 2.5vw, 16.5px)", marginBottom: 26, fontWeight: 500, lineHeight: 1.5 }}>
            {fraseInicio}
          </p>

          {/* Animated Stats bar */}
          <div className="hero-stats-grid" style={{ maxWidth: 640, margin: "0 auto" }}>
            {[
              { n: profesores.length, l: "profesores", i: "👨‍🏫", action: () => searchBarRef.current?.scrollIntoView({ behavior: "smooth" }) },
              { n: totalResenas, l: "reseñas", i: "💬", action: () => { setSortBy("populares"); searchBarRef.current?.scrollIntoView({ behavior: "smooth" }); } },
              { n: FACULTADES.length - 1, l: "facultades", i: "🏫", action: () => { setShowFilters(true); searchBarRef.current?.scrollIntoView({ behavior: "smooth" }); } },
              { n: solicitudes?.length || 0, l: "secciones pedidas", i: "🗳️", action: () => navigate("solicitudes") }
            ].map(s => (
              <div
                key={s.l}
                onClick={s.action}
                style={{
                  background: "rgba(255,255,255,.11)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  padding: "13px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,.16)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                  cursor: s.action ? "pointer" : "default",
                  transition: "transform 0.2s, background 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (s.action) {
                    e.currentTarget.style.background = "rgba(255,255,255,.19)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (s.action) {
                    e.currentTarget.style.background = "rgba(255,255,255,.11)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{s.i}</span>
                  <span className="tabular-nums" style={{ color: "#fff", fontWeight: 800, fontSize: 19, lineHeight: 1 }}>
                    <AnimatedCounter end={s.n} duration={1100} />
                  </span>
                </div>
                <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11.5, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA FLOTANTE COMPACTA E INTUITIVA */}
      <div
        ref={searchBarRef}
        style={{
          position: "sticky",
          top: 66,
          zIndex: 90,
          background: "var(--glass-sticky)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border-color)",
          padding: "12px 0",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.25s ease"
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="search-bar-row">
              {/* Buscador con botón de limpiar rápido */}
              <div className="search-input" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 14, fontSize: 15, pointerEvents: "none", opacity: 0.7 }}>🔍</span>
                <input
                  className="input"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar profesor o curso (ej. Cálculo, Biología)..."
                  aria-label="Buscar profesor o curso"
                  style={{ fontSize: 14.5, padding: "11px 38px 11px 40px", borderRadius: 13, fontWeight: 600 }}
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

              {/* Acceso rápido a Guardados */}
              {savedIds.length > 0 && (
                <button
                  onClick={() => setOnlySaved(s => !s)}
                  className="btn"
                  title="Ver mis profesores guardados para matrícula"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 13,
                    fontSize: 13,
                    fontWeight: 800,
                    background: onlySaved ? "rgba(232, 119, 34, 0.16)" : "var(--ghost-bg)",
                    color: onlySaved ? OR : "var(--text-dark)",
                    border: `1.5px solid ${onlySaved ? OR : "var(--border-color)"}`,
                    flexShrink: 0
                  }}
                >
                  <BookmarkIcon filled={onlySaved} />
                  <span>{savedIds.length}</span>
                </button>
              )}

              {/* Botón de Filtros (Facultad y Sede) */}
              <button
                onClick={() => setShowFilters(f => !f)}
                className="btn"
                style={{
                  padding: "10px 15px",
                  borderRadius: 13,
                  fontSize: 13,
                  fontWeight: 800,
                  background: showFilters || activeFilterCount > 0 ? "var(--light-blue)" : "var(--ghost-bg)",
                  color: showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--text-dark)",
                  border: `1.5px solid ${showFilters || activeFilterCount > 0 ? "var(--primary-blue)" : "var(--border-color)"}`,
                  flexShrink: 0
                }}
              >
                <span>🎛️ {showFilters ? "Ocultar filtros" : "Filtros"}</span>
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
                aria-label="Ordenar profesores"
                style={{ padding: "10px 14px", borderRadius: 13, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
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
                {onlySaved && (
                  <span onClick={() => setOnlySaved(false)} className="pill" style={{ background: OR, color: "#fff", cursor: "pointer", padding: "4px 10px", fontSize: 11.5 }}>
                    🔖 Guardados ✕
                  </span>
                )}
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
                <button onClick={() => { setFacFiltro("Todas"); setSedeFiltro([]); setOnlySaved(false); }} style={{ background: "none", border: "none", color: "var(--text-light)", fontSize: 11.5, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Panel desplegable de Facultades y Sedes */}
            {showFilters && (
              <div className="fade-in" style={{ paddingTop: 8, borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🏫 Facultad</div>
                  <div className="custom-scrollbar" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, alignItems: "center", WebkitOverflowScrolling: "touch" }}>
                    {FACULTADES.map(f => {
                      const active = facFiltro === f;
                      const accent = FAC_COLOR[f] || B;
                      return (
                        <button
                          key={f}
                          onClick={() => setFacFiltro(f)}
                          aria-pressed={active}
                          style={{
                            padding: "6px 13px",
                            borderRadius: 999,
                            fontSize: 12.5,
                            cursor: "pointer",
                            fontWeight: 700,
                            border: "1.5px solid",
                            transition: "all .18s",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            fontFamily: "inherit",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: active ? accent : "var(--surface-subtle)",
                            color: active ? "#fff" : "var(--text-medium)",
                            borderColor: active ? accent : "var(--border-color)",
                            boxShadow: active ? `0 4px 12px ${accent}38` : "none"
                          }}
                        >
                          {f !== "Todas" && (
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#fff" : accent, flexShrink: 0 }} />
                          )}
                          <span>{f === "Todas" ? "Todas las Facultades" : `${FAC_EMOJI[f] || ""} ${f}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>📍 Sede (puedes elegir varias)</div>
                  <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSedeFiltro([])}
                      aria-pressed={sedeFiltro.length === 0}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 12.5,
                        cursor: "pointer",
                        fontWeight: 700,
                        border: "1.5px solid",
                        transition: "all .18s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        fontFamily: "inherit",
                        background: sedeFiltro.length === 0 ? "var(--text-dark)" : "var(--surface-subtle)",
                        color: sedeFiltro.length === 0 ? "var(--bg-main)" : "var(--text-medium)",
                        borderColor: sedeFiltro.length === 0 ? "var(--text-dark)" : "var(--border-color)"
                      }}
                    >
                      🌍 Todas
                    </button>

                    {SEDES.map(s => {
                      const isSelected = sedeFiltro.includes(s);
                      const c = sedeColors[s] || B;
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            if (isSelected) setSedeFiltro(sedeFiltro.filter(x => x !== s));
                            else setSedeFiltro([...sedeFiltro, s]);
                          }}
                          aria-pressed={isSelected}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 999,
                            fontSize: 12.5,
                            cursor: "pointer",
                            fontWeight: 700,
                            border: "1.5px solid",
                            transition: "all .18s",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            fontFamily: "inherit",
                            background: isSelected ? c : "var(--surface-subtle)",
                            color: isSelected ? "#fff" : "var(--text-medium)",
                            borderColor: isSelected ? c : "var(--border-color)",
                            boxShadow: isSelected ? `0 4px 12px ${c}38` : "none"
                          }}
                        >
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
        <div
          style={{ maxWidth: 880, margin: "24px auto 0", padding: "0 16px" }}
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
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <span>📢</span> Novedades de la plataforma
            </h3>

            {noticias.length > 1 && (
              <div style={{ display: "flex", gap: 5 }}>
                {noticias.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentNewsIdx(idx)}
                    style={{
                      width: currentNewsIdx === idx ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: currentNewsIdx === idx ? "var(--primary-blue)" : "var(--border-strong)",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {noticias.length > 1 && (
              <>
                <button
                  className="btn btn-ghost desktop-only"
                  aria-label="Noticia anterior"
                  onClick={() => setCurrentNewsIdx(prev => (prev === 0 ? noticias.length - 1 : prev - 1))}
                  style={{ position: "absolute", left: -48, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "var(--card-bg)", border: "1px solid var(--border-color)", width: 40, height: 40, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}
                >
                  ←
                </button>
                <button
                  className="btn btn-ghost desktop-only"
                  aria-label="Siguiente noticia"
                  onClick={() => setCurrentNewsIdx(prev => (prev === noticias.length - 1 ? 0 : prev + 1))}
                  style={{ position: "absolute", right: -48, top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "var(--card-bg)", border: "1px solid var(--border-color)", width: 40, height: 40, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}
                >
                  →
                </button>
              </>
            )}
            {(() => {
              const n = noticias[currentNewsIdx];
              if (!n) return null;
              const isNew = n.createdAt && (new Date() - n.createdAt.toDate()) < 3 * 24 * 60 * 60 * 1000;
              return (
                <div key={n.id} className="card fade-in" style={{ overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
                  <div style={{ height: 4, width: "100%", background: `linear-gradient(90deg, ${B}, ${OR})` }} />
                  {n.imagenUrl && (
                    <div style={{ width: "100%", height: 185, overflow: "hidden", flexShrink: 0 }}>
                      <img src={n.imagenUrl} alt={n.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 16.5, fontWeight: 800, color: "var(--text-dark)", flex: 1 }}>{n.titulo}</div>
                      {isNew && <span style={{ background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99, letterSpacing: 0.5, flexShrink: 0 }}>NUEVO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-light)", marginBottom: 12, fontWeight: 600 }}>🗓️ {formatFechaExacta(n.createdAt)}</div>
                    <p
                      className="custom-scrollbar"
                      style={{
                        fontSize: 14,
                        color: "var(--text-muted)",
                        lineHeight: 1.65,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        maxHeight: 140,
                        overflowY: "auto",
                        paddingRight: 4
                      }}
                    >
                      {n.contenido}
                    </p>
                    <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {n.link && (
                        <a href={n.link.startsWith("http") ? n.link : `https://${n.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-blue" style={{ display: "inline-flex", alignItems: "center", fontSize: 13, padding: "9px 16px", textDecoration: "none" }}>
                          📲 Únete al Canal de Difusión
                        </a>
                      )}
                      <button onClick={() => setExpandedNews(n)} className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", fontSize: 13, padding: "9px 16px" }}>
                        🔍 Leer completo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* BANNER de "¿No encuentras a tu profe?" */}
      <div style={{ maxWidth: 880, margin: "18px auto 0", padding: "0 16px" }}>
        <div className="add-banner hero-grid-pattern" style={{ marginBottom: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 15, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }}>
            👨‍🏫
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16.5, marginBottom: 3 }}>¿No encuentras a tu profesor?</div>
            <div style={{ color: "rgba(255,255,255,.84)", fontSize: 13.5, fontWeight: 500 }}>Agrégalo en segundos o súmale un curso para ayudar a toda la UCSUR.</div>
          </div>
          <button className="btn-cta" style={{ fontSize: 13.5, padding: "11px 20px", flexShrink: 0 }} onClick={() => navigate("agregar")}>
            ➕ Agregar Profesor
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "24px auto 0", padding: "0 16px 64px" }}>
        {/* Carrusel de Nuevos Profesores */}
        {isSearchEmpty && profesoresNuevos.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, margin: "0 0 14px 0" }}>
              <span>✨</span> Recién agregados <span style={{ color: "var(--text-light)", fontSize: 12.5, fontWeight: 600 }}>(¡Sé el primero en calificarlos!)</span>
            </h3>
            <div className="custom-scrollbar" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 14, scrollSnapType: "x mandatory" }}>
              {profesoresNuevos.map(p => {
                const accent = FAC_COLOR[p.facultad] || B;
                return (
                  <Link
                    key={p.id}
                    to={`/profesor/${p.id}`}
                    className="card card-hover fade-in"
                    style={{ width: 274, flexShrink: 0, padding: "16px", display: "flex", flexDirection: "column", gap: 12, textDecoration: "none", scrollSnapAlign: "start", position: "relative", overflow: "hidden" }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3.5, background: accent }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 2 }}>
                      <Avatar name={p.nombre} fac={p.facultad} size={46} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                          <span>{p.facultad}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(p.cursos || []).slice(0, 2).map(c => (
                        <span key={c} className="pill" style={{ background: "var(--surface-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-color)", fontSize: 11, padding: "4px 9px" }}>
                          📚 {c}
                        </span>
                      ))}
                      {(p.cursos || []).length > 2 && (
                        <span className="pill" style={{ background: "transparent", color: "var(--text-light)", fontSize: 11, padding: "4px 8px", border: "1px solid var(--border-color)" }}>
                          +{p.cursos.length - 2}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 9, borderTop: "1px dashed var(--border-color)", textAlign: "center" }}>
                      <span style={{ color: "var(--primary-blue)", fontSize: 12.5, fontWeight: 800 }}>Dejar primera reseña →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Contador de resultados cuando se busca, filtra o ve guardados */}
        {!loading && (!isSearchEmpty || sortBy !== "aleatorio") && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-muted)" }}>
              {onlySaved ? "🔖 En tu lista de guardados: " : "Mostrando "}
              <strong style={{ color: "var(--text-dark)" }}>{filtered.length}</strong> profesor{filtered.length === 1 ? "" : "es"}
            </span>
            {onlySaved && (
              <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setOnlySaved(false)}>
                Ver todos los profesores
              </button>
            )}
          </div>
        )}

        {/* Lista Principal */}
        <div className="prof-grid">
          {loading && <SkeletonCard count={6} />}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ padding: "52px 24px", textAlign: "center", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{onlySaved ? "🔖" : "🔍"}</div>
              <div style={{ color: "var(--text-dark)", fontSize: 17.5, fontWeight: 800, marginBottom: 6 }}>
                {onlySaved ? "No tienes profesores guardados con estos filtros" : "No encontramos resultados"}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
                {onlySaved
                  ? "Usa el ícono de marcador en cualquier profesor para compararlo antes de tu matrícula."
                  : "Intenta con otro nombre o agrega al profesor si aún no está registrado."}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => { setBusqueda(""); setFacFiltro("Todas"); setSedeFiltro([]); setOnlySaved(false); }}>
                  Limpiar filtros
                </button>
                {!onlySaved && (
                  <button className="btn btn-orange" onClick={() => navigate("agregar")}>➕ Agregar profesor nuevo</button>
                )}
              </div>
            </div>
          )}

          {filtered.slice(0, visibleCount).map((p, i) => {
            const accent = FAC_COLOR[p.facultad] || B;
            const isSaved = savedIds.includes(p.id);
            const isTopBadge = (p.rating || 0) >= 4.5 && (p.totalReseñas || 0) >= 5;
            const sedesList = p.sedes || [p.sede].filter(Boolean);
            const facsList = p.facultades?.slice(0, 2) || [p.facultad].filter(Boolean);

            return (
              <Fragment key={p.id}>
                {i === 4 && !onlySaved && (
                  <div className="card fade-in hero-grid-pattern" style={{ gridColumn: "1 / -1", backgroundColor: BD, backgroundImage: `linear-gradient(135deg, ${B}, ${BD})`, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, border: "1px solid rgba(255,255,255,0.14)" }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>¿Tus amigos andan perdidos con la matrícula?</div>
                      <div style={{ color: "rgba(255,255,255,0.84)", fontSize: 13.5, fontWeight: 500 }}>¡Pásales el link de la página y sálvales el ciclo!</div>
                    </div>
                    <button
                      className="btn"
                      onClick={(e) => {
                        e.preventDefault();
                        const text = "Mira las reseñas de los profes antes de matricularte y salva tu ciclo 🚀 👉 " + window.location.origin;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      style={{ background: "#25D366", color: "#fff", fontWeight: 800, padding: "11px 20px", boxShadow: "0 6px 18px rgba(37, 211, 102, 0.35)" }}
                    >
                      <WhatsAppIcon />
                      <span>Compartir en WhatsApp</span>
                    </button>
                  </div>
                )}

                {i === 12 && !onlySaved && (
                  <div className="card fade-in hero-grid-pattern" style={{ gridColumn: "1 / -1", backgroundColor: OR, backgroundImage: `linear-gradient(135deg, ${OR}, #f59e0b)`, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, border: "1px solid rgba(255,255,255,0.18)" }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Ayuda a que la comunidad crezca 🌱</div>
                      <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 13.5, fontWeight: 500 }}>Mientras más personas califiquen, ¡mejores referencias tendremos todos!</div>
                    </div>
                    <button
                      className="btn"
                      onClick={(e) => {
                        e.preventDefault();
                        const text = "Únete a la comunidad y revisa qué profes valen la pena en UCSUR 🌱 👉 " + window.location.origin;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      style={{ background: "#16a34a", color: "#fff", fontWeight: 800, padding: "11px 20px", boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)" }}
                    >
                      <WhatsAppIcon />
                      <span>Recomendar página</span>
                    </button>
                  </div>
                )}

                <Link
                  to={`/profesor/${p.id}`}
                  className="card card-hover fade-in"
                  style={{
                    padding: "17px 19px 15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    animationDelay: `${Math.min(i, 10) * 0.025}s`,
                    textDecoration: "none",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Barra de acento superior sutil por facultad */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40)` }} />

                  {/* Fila Superior: Avatar, Nombre/Facultad, Rating & Bookmark */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                    <Avatar name={p.nombre} fac={p.facultad} size={50} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 15.5, color: "var(--text-dark)", lineHeight: 1.25 }}>
                          {p.nombre}
                        </span>
                        {isTopBadge && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(245, 158, 11, 0.16)", color: "#d97706", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "1.5px 6px", borderRadius: 6 }}>
                            🏆 TOP
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {facsList.map(f => {
                          const fAccent = FAC_COLOR[f] || B;
                          return (
                            <span
                              key={f}
                              style={{
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: "var(--text-medium)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: fAccent, flexShrink: 0 }} />
                              <span>{FAC_EMOJI[f] || ""} {f}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <RatingChip r={p.rating} />
                        {toggleSaveProf && (
                          <button
                            type="button"
                            className={`bookmark-btn${isSaved ? " saved" : ""}`}
                            title={isSaved ? "Quitar de guardados" : "Guardar para comparar"}
                            aria-label={isSaved ? "Quitar profesor de guardados" : "Guardar profesor"}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSaveProf(p.id, p.nombre);
                            }}
                          >
                            <BookmarkIcon filled={isSaved} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Stars value={p.rating} size={12} gap={1.5} />
                        <span className="tabular-nums" style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>
                          ({p.totalReseñas || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fila Inferior: Sedes & Cursos */}
                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px dashed var(--border-color)", display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                    {sedesList.map(s => (
                      <span
                        key={s}
                        className="pill"
                        style={{
                          background: `${sedeColors[s] || B}14`,
                          color: sedeColors[s] || "var(--primary-blue)",
                          border: `1px solid ${sedeColors[s] || B}28`,
                          fontSize: 10.5
                        }}
                      >
                        📍 {s}
                      </span>
                    ))}
                    {(p.cursos || []).slice(0, 3).map(c => (
                      <span
                        key={c}
                        className="pill"
                        style={{
                          background: "var(--surface-subtle)",
                          color: "var(--text-medium)",
                          border: "1px solid var(--border-color)",
                          fontSize: 11
                        }}
                      >
                        📚 {c}
                      </span>
                    ))}
                    {(p.cursos || []).length > 3 && (
                      <span className="pill" style={{ background: "transparent", color: "var(--text-light)", border: "1px solid var(--border-color)", fontSize: 10.5 }}>
                        +{p.cursos.length - 3} más
                      </span>
                    )}
                    {(!p.cursos || p.cursos.length === 0) && sedesList.length === 0 && (
                      <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>Sin cursos asignados aún</span>
                    )}
                  </div>
                </Link>
              </Fragment>
            );
          })}
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
        <div onClick={() => setExpandedNews(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ maxWidth: 550, width: "100%", maxHeight: "90vh", position: "relative", overflowY: "auto", background: "var(--card-bg)" }}>
            <button
              onClick={() => setExpandedNews(null)}
              aria-label="Cerrar noticia"
              style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.65)", color: "white", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
            >
              ✕
            </button>

            {expandedNews.imagenUrl && (
              <img
                src={expandedNews.imagenUrl}
                alt={expandedNews.titulo}
                onError={(e) => { e.target.style.display = "none"; }}
                style={{ width: "100%", height: 240, objectFit: "cover", display: "block", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              />
            )}
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8, lineHeight: 1.3 }}>{expandedNews.titulo}</h3>
              <div style={{ fontSize: 12.5, color: "var(--text-light)", marginBottom: 18, fontWeight: 600 }}>🗓️ {formatFechaExacta(expandedNews.createdAt)}</div>
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 24 }}>{expandedNews.contenido}</p>

              {expandedNews.link && (
                <a href={expandedNews.link.startsWith("http") ? expandedNews.link : `https://${expandedNews.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-blue" style={{ display: "flex", width: "100%", padding: "14px", textDecoration: "none", marginBottom: 12, fontSize: 14.5 }}>
                  📲 Únete al Canal de Difusión
                </a>
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
