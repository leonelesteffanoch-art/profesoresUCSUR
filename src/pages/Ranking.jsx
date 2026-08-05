import { B, BD, OR } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";

export const Ranking = ({ profesores, rankTab, setRankTab, navigate }) => {
  const withR = profesores.filter(p => p.totalReseñas > 0);
  const top = [...withR].sort((a, b) => b.rating - a.rating);
  const worst = [...withR].sort((a, b) => a.rating - b.rating);
  const popular = [...profesores].sort((a, b) => (b.totalReseñas || 0) - (a.totalReseñas || 0));
  const maxR = Math.max(...profesores.map(p => p.totalReseñas || 0), 1);
  const podio = top.slice(0, 3);
  const ord = [1, 0, 2], heights = ["70px", "90px", "50px"], medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 64px" }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: BD, marginBottom: 6 }}>🏆 Ranking de profesores</h2>
      <p style={{ fontSize: 14, color: "var(--text-light)", marginBottom: 28, fontWeight: 500 }}>Basado en calificaciones reales de estudiantes.</p>
      
      <div style={{ display: "flex", gap: 6, background: "var(--border-color)", borderRadius: 14, padding: 6, width: "fit-content", marginBottom: 28 }}>
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
              <div key={p.id} onClick={() => navigate("perfil", p)} className="card-hover" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: 1, maxWidth: 180, transition: "transform .2s" }}>
                <span style={{ fontSize: 32, marginBottom: 8, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.1))" }}>{medals[idx]}</span>
                <Avatar name={p.nombre} fac={p.facultad} size={idx === 0 ? 72 : 56} />
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", marginTop: 10, textAlign: "center" }}>{p.nombre.split(" ")[0]}</div>
                <div style={{ marginTop: 6 }}><RatingChip r={p.rating} /></div>
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
              </div>
          ); })}
        </div>
        <div className="card" style={{ padding: "8px 0" }}>
          {top.slice(3).map((p, i) => (
            <div key={p.id} onClick={() => navigate("perfil", p)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 800, width: 32 }}>#{i + 4}</span>
              <Avatar name={p.nombre} fac={p.facultad} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
              </div>
              <RatingChip r={p.rating} />
            </div>
          ))}
        </div>
      </>}

      {rankTab === "worst" && <div className="card" style={{ padding: "8px 0" }}>
        {worst.map((p, i) => (
          <div key={p.id} onClick={() => navigate("perfil", p)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 24, width: 32, textAlign: "center" }}>{i === 0 ? "💀" : i === 1 ? "😬" : "😕"}</span>
            <Avatar name={p.nombre} fac={p.facultad} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
            </div>
            <RatingChip r={p.rating} />
          </div>
        ))}
      </div>}

      {rankTab === "popular" && <div className="card" style={{ padding: "8px 0" }}>
        {popular.map((p, i) => (
          <div key={p.id} onClick={() => navigate("perfil", p)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s" }}
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
          </div>
        ))}
      </div>}
    </div>
  );
};
