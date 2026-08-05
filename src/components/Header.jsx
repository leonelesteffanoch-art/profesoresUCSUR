import { B, BD, OR } from "../constants.js";

export const Header = ({ page, navigate }) => (
  <div style={{ 
    background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, 
    padding: "0 20px", 
    display: "flex", 
    alignItems: "center", 
    gap: 10, 
    height: 64, 
    boxShadow: "0 4px 24px rgba(12,68,124,.4)", 
    position: "sticky", 
    top: 0, 
    zIndex: 100 
  }}>
    <span onClick={() => navigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <div style={{ 
        background: OR, 
        borderRadius: 14, 
        width: 40, 
        height: 40, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: 22, 
        boxShadow: "0 4px 12px rgba(232,119,34,.4)" 
      }}>★</div>
      <div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>ProfesoresUCSUR</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, letterSpacing: 1.5, fontWeight: 700 }}>CIENTÍFICA DEL SUR</div>
      </div>
    </span>
    <span style={{ flex: 1 }} />
    <nav style={{ display: "flex", gap: 4, overflowX: "auto", flexShrink: 1, minWidth: 0, paddingRight: 4 }}>
      {[
        ["home", "🏠 Inicio"], 
        ["ranking", "🏆 Ranking"], 
        ["agregar", "➕ Agregar profe"], 
        ["admin", "⚙️"]
      ].map(([p, l]) => (
        <span 
          key={p} 
          className={`nav-link${page === p ? " active" : ""}`} 
          onClick={() => navigate(p)}
        >
          {l}
        </span>
      ))}
    </nav>
  </div>
);
