import { useState, useEffect } from "react";
import { B, BD, OR } from "../constants.js";
import { ThemeToggle } from "./UI/ThemeToggle.jsx";

export const Header = ({ page, navigate, darkMode, setDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScroll = window.scrollY;
    
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll <= 60) {
        setHidden(false);
      } else if (currentScroll > lastScroll) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScroll = currentScroll;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    ["home", "🏠", "Inicio"], 
    ["ranking", "🏆", "Ranking"], 
    ["agregar", "➕", "Agregar profe"], 
    ["feedback", "💡", "Sugerencias"],
    ["admin", "⚙️", "Admin"]
  ];

  const handleNav = (p) => {
    navigate(p);
    setMenuOpen(false);
  };

  return (
    <>
      <header style={{ 
        background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, 
        padding: "0 20px", 
        display: "flex", 
        alignItems: "center", 
        gap: 10, 
        height: 64, 
        boxShadow: "0 4px 24px rgba(12,68,124,.4)", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
      }}>
        <span onClick={() => handleNav("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }} aria-label="Ir a inicio">
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
        
        <ThemeToggle isDark={darkMode} onToggle={() => setDarkMode(d => !d)} />

        {/* Desktop nav */}
        <nav className="desktop-nav">
          {links.map(([p, icon, label]) => (
            <span 
              key={p} 
              className={`nav-link${page === p ? " active" : ""}`} 
              onClick={() => handleNav(p)}
              style={p === "feedback" ? { background: "var(--primary-orange)", color: "#fff", padding: "6px 12px", borderRadius: 20, fontWeight: 800 } : {}}
            >
              {icon} {label}
            </span>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          ☰
        </button>
      </header>

      {/* Mobile drawer overlay */}
      <div className={`mobile-menu-overlay${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`mobile-drawer${menuOpen ? " open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: OR, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>★</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text-dark)" }}>ProfesoresUCSUR</span>
          </div>
          <button 
            onClick={() => setMenuOpen(false)} 
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        {links.map(([p, icon, label]) => (
          <div 
            key={p} 
            className={`mobile-nav-link${page === p ? " active" : ""}`}
            onClick={() => handleNav(p)}
            style={p === "feedback" ? { background: "var(--primary-orange)", color: "#fff", fontWeight: 800, marginTop: 8 } : {}}
          >
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={p === "feedback" ? { color: "#fff" } : {}}>{label}</span>
          </div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
          <div 
            className="mobile-nav-link" 
            onClick={() => setDarkMode(d => !d)} 
            style={{ color: "var(--text-muted)" }}
          >
            <span style={{ fontSize: 20 }}>{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="mobile-bottom-nav"
        style={{
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hidden ? "translateY(calc(100% + 32px))" : "translateY(0)"
        }}
      >
        {[["home", "🏠", "Inicio"], ["ranking", "🏆", "Ranking"], ["agregar", "➕", "Agregar"], ["feedback", "💡", "Sugerencias"]].map(([p, icon, label]) => (
          <div 
            key={p} 
            className={`bottom-nav-item${page === p ? " active" : ""}`} 
            onClick={() => navigate(p === "home" ? "/" : `/${p}`)}
            style={p === "feedback" ? { background: "var(--primary-orange)", color: "#fff", borderRadius: 12 } : {}}
          >
            <span style={{ fontSize: 20, marginBottom: 2 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: p === "feedback" ? "#fff" : "inherit" }}>{label}</span>
          </div>
        ))}
      </nav>
    </>
  );
};
