import { useMemo, useState, useEffect } from "react";
import { B, BD, OR, FACULTADES, FAC_EMOJI, FAC_COLOR } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Link } from "react-router-dom";

export const Ranking = ({
  profesores,
  rankTab,
  setRankTab,
  rankCursoFiltro: cursoFiltro,
  setRankCursoFiltro: setCursoFiltro,
}) => {
  const [facFiltro, setFacFiltro] = useState("Todas");
  const [visibleCount, setVisibleCount] = useState(15);

  useEffect(() => {
    setVisibleCount(15);
  }, [facFiltro, cursoFiltro, rankTab]);

  const todosLosCursos = useMemo(() => {
    const cursos = new Set();
    profesores
      .filter((p) => facFiltro === "Todas" || p.facultades?.includes(facFiltro))
      .forEach((p) => p.cursos?.forEach((c) => cursos.add(c)));
    return Array.from(cursos).sort((a, b) => a.localeCompare(b));
  }, [profesores, facFiltro]);

  const profesoresFiltrados = useMemo(() => {
    return profesores
      .filter((p) => facFiltro === "Todas" || p.facultades?.includes(facFiltro))
      .filter((p) => !cursoFiltro || p.cursos?.includes(cursoFiltro));
  }, [profesores, facFiltro, cursoFiltro]);

  const withR = profesoresFiltrados.filter((p) => p.totalReseñas > 0);

  const C = withR.length ? withR.reduce((sum, p) => sum + p.rating, 0) / withR.length : 0;
  const m = 3; // Minimum reviews needed to be confident
  const bayesianRating = (p) => {
    const v = p.totalReseñas || 0;
    return (v * p.rating + m * C) / (v + m);
  };

  const top = [...withR].sort((a, b) => bayesianRating(b) - bayesianRating(a));
  const worst = [...withR].sort((a, b) => bayesianRating(a) - bayesianRating(b));
  const popular = [...profesoresFiltrados].sort((a, b) => (b.totalReseñas || 0) - (a.totalReseñas || 0));

  const maxR = Math.max(...profesoresFiltrados.map((p) => p.totalReseñas || 0), 1);
  const podio = top.slice(0, 3);
  const ord = [1, 0, 2];
  const heights = ["78px", "106px", "60px"];
  const medals = ["🥇", "🥈", "🥉"];

  const shortName = (nombre) => {
    if (!nombre) return "";
    const parts = nombre.split(" ");
    return parts.slice(0, 2).join(" ");
  };

  const renderSubtitle = (p) => {
    const facColor = FAC_COLOR[p.facultad] || B;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--text-light)",
          marginTop: 3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: facColor, flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.facultad}
          {p.cursos && p.cursos.length > 0 ? ` · 📚 ${p.cursos.slice(0, 2).join(", ")}` : ""}
        </span>
      </div>
    );
  };

  const hasFilters = facFiltro !== "Todas" || Boolean(cursoFiltro);

  return (
    <div className="page-shell" style={{ maxWidth: 880 }}>
      {/* Hero Header */}
      <div
        className="card fade-in hero-banner"
        style={{
          backgroundColor: BD,
          backgroundImage: `radial-gradient(at 15% 15%, rgba(56, 189, 248, 0.16) 0, transparent 48%), radial-gradient(at 88% 82%, rgba(232, 119, 34, 0.22) 0, transparent 52%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(145deg, #07294d 0%, ${BD} 48%, ${B} 100%)`,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px, 100% 100%",
          color: "#fff",
          textAlign: "center",
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(255,255,255,0.13)",
            backdropFilter: "blur(8px)",
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 800,
            marginBottom: 12,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          🏆 RANKING PONDERADO EN TIEMPO REAL
        </div>
        <h1 style={{ fontSize: "clamp(23px, 4.5vw, 32px)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Mejores Profesores UCSUR
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", maxWidth: 540, margin: "0 auto 20px", fontWeight: 500, lineHeight: 1.5 }}>
          Calculado con promedio bayesiano (combina calificación y volumen de reseñas para un ranking justo).
        </p>

        {/* Filtros combinados de Facultad y Curso */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, maxWidth: 620, margin: "0 auto" }}>
          <select
            className="input"
            style={{ padding: "11px 14px", fontSize: 13.5, cursor: "pointer", fontWeight: 700, borderRadius: 12 }}
            value={facFiltro}
            onChange={(e) => {
              setFacFiltro(e.target.value);
              setCursoFiltro("");
            }}
          >
            {FACULTADES.map((f) => (
              <option key={f} value={f}>
                {f === "Todas" ? "🏛️ Todas las Facultades" : `${FAC_EMOJI[f] || "🏫"} ${f}`}
              </option>
            ))}
          </select>

          <select
            className="input"
            style={{ padding: "11px 14px", fontSize: 13.5, cursor: "pointer", fontWeight: 700, borderRadius: 12 }}
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
          >
            <option value="">📚 Todos los cursos ({todosLosCursos.length})</option>
            {todosLosCursos.map((c) => (
              <option key={c} value={c}>
                📚 {c}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="tabular-nums" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              Mostrando {profesoresFiltrados.length} docentes ({withR.length} con reseñas)
            </span>
            <button
              type="button"
              onClick={() => {
                setFacFiltro("Todas");
                setCursoFiltro("");
              }}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✕ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabs de Ranking */}
      <div className="ranking-tabs">
        {[
          ["top", "⭐ Mejores"],
          ["popular", "🔥 Populares"],
          ["worst", "💔 Más Bajos"],
        ].map(([k, l]) => (
          <button
            key={k}
            className="tab ranking-tab"
            onClick={() => setRankTab(k)}
            style={{
              background: rankTab === k ? "var(--primary-blue)" : "transparent",
              color: rankTab === k ? "#fff" : "var(--text-muted)",
              boxShadow: rankTab === k ? "0 4px 12px rgba(21,96,170,.28)" : "none",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {rankTab === "top" && podio.length > 0 && (
        <>
          {/* Podio Top 3 */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(8px, 2.5vw, 22px)", marginBottom: 26, paddingTop: 6 }}>
            {ord.map((idx, i) => {
              const p = podio[idx];
              if (!p) return null;
              return (
                <Link
                  key={p.id}
                  to={`/profesor/${p.id}`}
                  className="card-hover"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    flex: 1,
                    maxWidth: 215,
                    minWidth: 0,
                    transition: "transform .2s",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: idx === 0 ? 36 : 26, marginBottom: 6, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.18))" }}>
                    {medals[idx]}
                  </span>
                  <div
                    style={{
                      borderRadius: Math.round((idx === 0 ? 72 : 58) * 0.34) + 5,
                      padding: idx === 0 ? 3 : 0,
                      background: idx === 0 ? `linear-gradient(135deg, ${OR}, #fbbf24)` : "transparent",
                      boxShadow: idx === 0 ? "0 8px 24px rgba(232, 119, 34, 0.28)" : "none",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: Math.round((idx === 0 ? 72 : 58) * 0.34) + 2,
                        padding: idx === 0 ? 2 : 0,
                        background: idx === 0 ? "var(--bg-main)" : "transparent",
                      }}
                    >
                      <Avatar name={p.nombre} fac={p.facultad} size={idx === 0 ? 72 : 58} />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: "var(--text-dark)",
                      marginTop: 10,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      padding: "0 4px",
                    }}
                  >
                    {shortName(p.nombre)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-light)",
                      marginTop: 2,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      padding: "0 6px",
                    }}
                  >
                    {p.facultad}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <RatingChip r={p.rating} />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700, marginTop: 5 }}>
                    💬 {p.totalReseñas || 0} reseñas
                  </div>
                  <div
                    style={{
                      background:
                        idx === 0
                          ? `linear-gradient(180deg, ${OR}, #c95c0c)`
                          : idx === 1
                          ? "linear-gradient(180deg, #94a3b8, #64748b)"
                          : "linear-gradient(180deg, #d97706, #92400e)",
                      height: heights[i],
                      width: "100%",
                      borderRadius: "18px 18px 8px 8px",
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "inset 0 2px 10px rgba(255,255,255,.28), 0 8px 20px rgba(0,0,0,0.1)",
                    }}
                  >
                    <span className="tabular-nums" style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>
                      #{idx + 1}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {top.length > 3 && (
            <>
              <div className="card" style={{ padding: "6px 0", overflow: "hidden" }}>
                {top.slice(3, 3 + visibleCount).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/profesor/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderTop: i > 0 ? "1px solid var(--border-color)" : "none",
                      cursor: "pointer",
                      transition: "background .2s",
                      textDecoration: "none",
                      color: "var(--text-dark)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="tabular-nums" style={{ fontSize: 13.5, color: "var(--text-light)", fontWeight: 800, width: 34, textAlign: "center" }}>
                      #{i + 4}
                    </span>
                    <Avatar name={p.nombre} fac={p.facultad} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.nombre}
                      </div>
                      {renderSubtitle(p)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <RatingChip r={p.rating} />
                      <span className="tabular-nums" style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>
                        {p.totalReseñas || 0} reseñas
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {visibleCount < top.length - 3 && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    className="btn btn-blue"
                    style={{ padding: "12px 26px", fontSize: 14, fontWeight: 800, borderRadius: 999 }}
                    onClick={() => setVisibleCount((v) => v + 15)}
                  >
                    ⬇️ Mostrar más profesores ({top.length - 3 - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {rankTab === "top" && podio.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-light)", fontSize: 15, fontWeight: 600 }}>
          No hay profesores con reseñas suficientes para este filtro.
        </div>
      )}

      {rankTab === "worst" && (
        <>
          {worst.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-light)", fontSize: 15, fontWeight: 600 }}>
              No hay profesores con reseñas para este filtro.
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: "6px 0", overflow: "hidden" }}>
                {worst.slice(0, visibleCount).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/profesor/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderTop: i > 0 ? "1px solid var(--border-color)" : "none",
                      cursor: "pointer",
                      transition: "background .2s",
                      textDecoration: "none",
                      color: "var(--text-dark)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="tabular-nums" style={{ fontSize: i < 3 ? 20 : 13.5, width: 34, textAlign: "center", fontWeight: 800, color: "var(--text-light)" }}>
                      {i === 0 ? "💀" : i === 1 ? "😬" : i === 2 ? "😕" : `#${i + 1}`}
                    </span>
                    <Avatar name={p.nombre} fac={p.facultad} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.nombre}
                      </div>
                      {renderSubtitle(p)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <RatingChip r={p.rating} />
                      <span className="tabular-nums" style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>
                        {p.totalReseñas || 0} reseñas
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {visibleCount < worst.length && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    className="btn btn-blue"
                    style={{ padding: "12px 26px", fontSize: 14, fontWeight: 800, borderRadius: 999 }}
                    onClick={() => setVisibleCount((v) => v + 15)}
                  >
                    ⬇️ Mostrar más profesores ({worst.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {rankTab === "popular" && (
        <>
          {popular.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-light)", fontSize: 15, fontWeight: 600 }}>
              No se encontraron profesores para este filtro.
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: "6px 0", overflow: "hidden" }}>
                {popular.slice(0, visibleCount).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/profesor/${p.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderTop: i > 0 ? "1px solid var(--border-color)" : "none",
                      cursor: "pointer",
                      transition: "background .2s",
                      textDecoration: "none",
                      color: "var(--text-dark)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="tabular-nums" style={{ fontSize: 13.5, color: "var(--text-light)", fontWeight: 800, width: 34, textAlign: "center" }}>
                      #{i + 1}
                    </span>
                    <Avatar name={p.nombre} fac={p.facultad} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.nombre}
                      </div>
                      {renderSubtitle(p)}
                    </div>
                    <div className="ranking-pop-track">
                      <RatingChip r={p.rating} />
                      <div className="ranking-pop-bar">
                        <div
                          style={{
                            width: `${((p.totalReseñas || 0) / maxR) * 100}%`,
                            background: `linear-gradient(90deg, ${B}, ${OR})`,
                            height: "100%",
                            borderRadius: 8,
                          }}
                        />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 800, color: "var(--primary-blue)", minWidth: 26, textAlign: "right" }}>
                        {p.totalReseñas || 0}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {visibleCount < popular.length && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    className="btn btn-blue"
                    style={{ padding: "12px 26px", fontSize: 14, fontWeight: 800, borderRadius: 999 }}
                    onClick={() => setVisibleCount((v) => v + 15)}
                  >
                    ⬇️ Mostrar más profesores ({popular.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
