import { useMemo } from "react";
import { B, BD, OR } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Link } from "react-router-dom";

export const Ranking = ({ profesores, rankTab, setRankTab, rankCursoFiltro: cursoFiltro, setRankCursoFiltro: setCursoFiltro, navigate }) => {

  const todosLosCursos = useMemo(() => {
    const cursos = new Set();
    profesores.forEach(p => p.cursos?.forEach(c => cursos.add(c)));
    return Array.from(cursos).sort();
  }, [profesores]);

  const profesoresFiltrados = useMemo(() => {
    if (!cursoFiltro) return profesores;
    return profesores.filter(p => p.cursos?.includes(cursoFiltro));
  }, [profesores, cursoFiltro]);

  const withR = profesoresFiltrados.filter(p => p.totalReseñas > 0);
  const top = [...withR].sort((a, b) => b.rating - a.rating);
  const worst = [...withR].sort((a, b) => a.rating - b.rating);
  const popular = [...profesoresFiltrados].sort((a, b) => (b.totalReseñas || 0) - (a.totalReseñas || 0));
  const maxR = Math.max(...profesoresFiltrados.map(p => p.totalReseñas || 0), 1);
  const podio = top.slice(0, 3);
  const ord = [1, 0, 2], heights = ["70px", "90px", "50px"], medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 64px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: BD, marginBottom: 6, textAlign: "center" }}>🏆 Ranking de profesores</h2>
      <p style={{ fontSize: 14, color: "var(--text-light)", marginBottom: 20, fontWeight: 500, textAlign: "center" }}>Basado en calificaciones reales de estudiantes.</p>
      
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <select className="input" style={{ width: "100%", maxWidth: 300, padding: "12px 16px", fontSize: 14, cursor: "pointer", fontWeight: 600, margin: "0 auto" }} value={cursoFiltro} onChange={e => setCursoFiltro(e.target.value)}>
          <option value="">🏫 Todos los cursos</option>
          {todosLosCursos.map(c => <option key={c} value={c}>📚 {c}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 6, background: "var(--border-color)", borderRadius: 14, padding: 6, width: "fit-content", marginBottom: 28, overflowX: "auto", maxWidth: "100%", margin: "0 auto 28px" }}>
        {[["top", "⭐ Top rated"], ["worst", "💔 Peor rated"], ["popular", "🔥 Populares"]].map(([k, l]) => (
          <button key={k} className="tab" onClick={() => setRankTab(k)} 
            style={{ 
              background: rankTab === k ? B : "transparent", 
              color: rankTab === k ? "#fff" : "var(--text-muted)",
              boxShadow: rankTab === k ? "0 2px 10px rgba(21,96,170,.2)" : "none" 
            }}>
            {l}
          </button>
        ))}
      </div>

      {rankTab === "top" && podio.length > 0 && <>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 20, marginBottom: 32, paddingTop: 20 }}>
          {ord.map((idx, i) => { 
            const p = podio[idx]; 
            if (!p) return null; 
            return (
              <Link key={p.id} to={`/profesor/${p.id}`} className="card-hover" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: 1, maxWidth: 180, transition: "transform .2s", textDecoration: "none" }}>
                <span style={{ fontSize: 32, marginBottom: 8, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.1))" }}>{medals[idx]}</span>
                <Avatar name={p.nombre} fac={p.facultad} size={idx === 0 ? 72 : 56} />
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", marginTop: 10, textAlign: "center" }}>{p.nombre.split(" ")[0]}</div>
                <div style={{ marginTop: 6 }}><RatingChip r={p.rating} /></div>
                <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700, marginTop: 6 }}>{p.totalReseñas || 0} reseñas</div>
                <div style={{ 
                  background: idx === 0 ? `linear-gradient(180deg, ${OR}, #d96518)` : idx === 1 ? "linear-gradient(180deg, #a8b8cc, #8a99b0)" : "linear-gradient(180deg, #d4a373, #bc8f5f)", 
                  height: heights[i], 
                  width: "100%", 
                  borderRadius: "16px 16px 0 0", 
                  marginTop: 14, 
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "center", 
                  paddingTop: 10,
                  boxShadow: "inset 0 2px 10px rgba(255,255,255,.2)"
                }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>#{idx + 1}</span>
                </div>
              </Link>
          ); })}
        </div>
        <div className="card" style={{ padding: "8px 0" }}>
          {top.slice(3).map((p, i) => (
            <Link key={p.id} to={`/profesor/${p.id}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 800, width: 32 }}>#{i + 4}</span>
              <Avatar name={p.nombre} fac={p.facultad} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <RatingChip r={p.rating} />
                <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>{p.totalReseñas || 0} reseñas</span>
              </div>
            </Link>
          ))}
        </div>
      </>}

      {rankTab === "top" && podio.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-light)", fontSize: 15, fontWeight: 600 }}>
          No hay suficientes profesores con reseñas en este curso.
        </div>
      )}

      {rankTab === "worst" && <div className="card" style={{ padding: "8px 0" }}>
        {worst.map((p, i) => (
          <Link key={p.id} to={`/profesor/${p.id}`}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 24, width: 32, textAlign: "center" }}>{i === 0 ? "💀" : i === 1 ? "😬" : "😕"}</span>
            <Avatar name={p.nombre} fac={p.facultad} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <RatingChip r={p.rating} />
              <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>{p.totalReseñas || 0} reseñas</span>
            </div>
          </Link>
        ))}
      </div>}

      {rankTab === "popular" && <div className="card" style={{ padding: "8px 0" }}>
        {popular.map((p, i) => (
          <Link key={p.id} to={`/profesor/${p.id}`}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 800, width: 32 }}>#{i + 1}</span>
            <Avatar name={p.nombre} fac={p.facultad} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.totalReseñas || 0} reseñas · {p.facultad}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 90, background: "#edf1f7", borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{ width: `${((p.totalReseñas || 0) / maxR) * 100}%`, background: `linear-gradient(90deg,${B},${OR})`, height: "100%", borderRadius: 8 }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: B }}>{p.totalReseñas || 0}</span>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
};
