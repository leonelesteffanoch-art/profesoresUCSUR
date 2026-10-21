import { useMemo, useState } from "react";
import { B, BD, OR, FACULTADES, FAC_EMOJI } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Link } from "react-router-dom";

export const Ranking = ({ profesores, rankTab, setRankTab, rankCursoFiltro: cursoFiltro, setRankCursoFiltro: setCursoFiltro }) => {
  const [facFiltro, setFacFiltro] = useState("Todas");

  const todosLosCursos = useMemo(() => {
    const cursos = new Set();
    profesores
      .filter(p => facFiltro === "Todas" || p.facultades?.includes(facFiltro))
      .forEach(p => p.cursos?.forEach(c => cursos.add(c)));
    return Array.from(cursos).sort((a, b) => a.localeCompare(b));
  }, [profesores, facFiltro]);

  const profesoresFiltrados = useMemo(() => {
    return profesores
      .filter(p => facFiltro === "Todas" || p.facultades?.includes(facFiltro))
      .filter(p => !cursoFiltro || p.cursos?.includes(cursoFiltro));
  }, [profesores, facFiltro, cursoFiltro]);

  const withR = profesoresFiltrados.filter(p => p.totalReseñas > 0);
  
  const C = withR.length ? withR.reduce((sum, p) => sum + p.rating, 0) / withR.length : 0;
  const m = 3; // Minimum reviews needed to be confident
  const bayesianRating = (p) => {
    const v = p.totalReseñas || 0;
    return (v * p.rating + m * C) / (v + m);
  };

  const top = [...withR].sort((a, b) => bayesianRating(b) - bayesianRating(a));
  const worst = [...withR].sort((a, b) => bayesianRating(a) - bayesianRating(b));
  const popular = [...profesoresFiltrados].sort((a, b) => (b.totalReseñas || 0) - (a.totalReseñas || 0));
  
  const maxR = Math.max(...profesoresFiltrados.map(p => p.totalReseñas || 0), 1);
  const podio = top.slice(0, 3);
  const ord = [1, 0, 2], heights = ["78px", "104px", "60px"], medals = ["🥇", "🥈", "🥉"];

  const shortName = (nombre) => {
    if (!nombre) return "";
    const parts = nombre.split(" ");
    return parts.slice(0, 2).join(" ");
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "28px 16px 72px" }}>
      {/* Hero Header */}
      <div className="card fade-in" style={{ background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, padding: "28px 24px", borderRadius: 22, color: "#fff", textAlign: "center", marginBottom: 24, border: "none", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", padding: "5px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, marginBottom: 10 }}>
          🏆 RANKING PONDERADO EN TIEMPO REAL
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4.5vw, 30px)", fontWeight: 800, marginBottom: 6 }}>Mejores Profesores UCSUR</h1>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", maxWidth: 520, margin: "0 auto 20px", fontWeight: 500 }}>
          Calculado con promedio bayesiano (combina calificación y cantidad de reseñas para un ranking 100% justo).
        </p>

        {/* Filtros combinados de Facultad y Curso */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, maxWidth: 600, margin: "0 auto" }}>
          <select
            className="input"
            style={{ padding: "11px 14px", fontSize: 13.5, cursor: "pointer", fontWeight: 700, borderRadius: 12 }}
            value={facFiltro}
            onChange={e => { setFacFiltro(e.target.value); setCursoFiltro(""); }}
          >
            {FACULTADES.map(f => (
              <option key={f} value={f}>{f === "Todas" ? "🏛️ Todas las Facultades" : `${FAC_EMOJI[f] || "🏫"} ${f}`}</option>
            ))}
          </select>

          <select
            className="input"
            style={{ padding: "11px 14px", fontSize: 13.5, cursor: "pointer", fontWeight: 700, borderRadius: 12 }}
            value={cursoFiltro}
            onChange={e => setCursoFiltro(e.target.value)}
          >
            <option value="">📚 Todos los cursos ({todosLosCursos.length})</option>
            {todosLosCursos.map(c => <option key={c} value={c}>📚 {c}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs de Ranking */}
      <div style={{ display: "flex", gap: 6, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 6, width: "fit-content", overflowX: "auto", maxWidth: "100%", margin: "0 auto 28px", boxShadow: "var(--shadow-sm)" }}>
        {[
          ["top", "⭐ Mejor Calificados"],
          ["popular", "🔥 Más Reseñados"],
          ["worst", "💔 Más Exigentes / Bajos"]
        ].map(([k, l]) => (
          <button key={k} className="tab" onClick={() => setRankTab(k)} 
            style={{ 
              background: rankTab === k ? B : "transparent", 
              color: rankTab === k ? "#fff" : "var(--text-muted)",
              boxShadow: rankTab === k ? "0 4px 12px rgba(21,96,170,.25)" : "none",
              whiteSpace: "nowrap"
            }}>
            {l}
          </button>
        ))}
      </div>

      {rankTab === "top" && podio.length > 0 && <>
        {/* Podio Top 3 */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(10px, 3vw, 22px)", marginBottom: 28, paddingTop: 12 }}>
          {ord.map((idx, i) => { 
            const p = podio[idx]; 
            if (!p) return null; 
            return (
              <Link key={p.id} to={`/profesor/${p.id}`} className="card-hover" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: 1, maxWidth: 210, minWidth: 0, transition: "transform .2s", textDecoration: "none" }}>
                <span style={{ fontSize: idx === 0 ? 36 : 28, marginBottom: 6, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.15))" }}>{medals[idx]}</span>
                <Avatar name={p.nombre} fac={p.facultad} size={idx === 0 ? 74 : 58} />
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-dark)", marginTop: 10, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", padding: "0 4px" }}>
                  {shortName(p.nombre)}
                </div>
                <div style={{ marginTop: 6 }}><RatingChip r={p.rating} /></div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700, marginTop: 5 }}>💬 {p.totalReseñas || 0} reseñas</div>
                <div style={{ 
                  background: idx === 0 ? `linear-gradient(180deg, ${OR}, #d96518)` : idx === 1 ? "linear-gradient(180deg, #94a3b8, #64748b)" : "linear-gradient(180deg, #d97706, #92400e)", 
                  height: heights[i], 
                  width: "100%", 
                  borderRadius: "18px 18px 8px 8px", 
                  marginTop: 12, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  boxShadow: "inset 0 2px 10px rgba(255,255,255,.25), 0 8px 20px rgba(0,0,0,0.08)"
                }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>#{idx + 1}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {top.length > 3 && (
          <div className="card" style={{ padding: "6px 0" }}>
            {top.slice(3).map((p, i) => (
              <Link key={p.id} to={`/profesor/${p.id}`}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none", color: "var(--text-dark)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--ghost-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 13.5, color: "var(--text-light)", fontWeight: 800, width: 32, textAlign: "center" }}>#{i + 4}</span>
                <Avatar name={p.nombre} fac={p.facultad} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.facultad} {(p.cursos && p.cursos.length > 0) ? `· 📚 ${p.cursos.slice(0, 2).join(", ")}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <RatingChip r={p.rating} />
                  <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>{p.totalReseñas || 0} reseñas</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </>}

      {rankTab === "top" && podio.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-light)", fontSize: 15, fontWeight: 600 }}>
          No hay profesores con reseñas suficientes para este filtro.
        </div>
      )}

      {rankTab === "worst" && (
        <div className="card" style={{ padding: "6px 0" }}>
          {worst.map((p, i) => (
            <Link key={p.id} to={`/profesor/${p.id}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none", color: "var(--text-dark)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--ghost-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{i === 0 ? "💀" : i === 1 ? "😬" : "😕"}</span>
              <Avatar name={p.nombre} fac={p.facultad} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.facultad} {(p.cursos && p.cursos.length > 0) ? `· 📚 ${p.cursos.slice(0, 2).join(", ")}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <RatingChip r={p.rating} />
                <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>{p.totalReseñas || 0} reseñas</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {rankTab === "popular" && (
        <div className="card" style={{ padding: "6px 0" }}>
          {popular.map((p, i) => (
            <Link key={p.id} to={`/profesor/${p.id}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none", color: "var(--text-dark)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--ghost-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 13.5, color: "var(--text-light)", fontWeight: 800, width: 32, textAlign: "center" }}>#{i + 1}</span>
              <Avatar name={p.nombre} fac={p.facultad} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 85, background: "var(--ghost-bg)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${((p.totalReseñas || 0) / maxR) * 100}%`, background: `linear-gradient(90deg,${B},${OR})`, height: "100%", borderRadius: 8 }} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--primary-blue)", minWidth: 28, textAlign: "right" }}>{p.totalReseñas || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
