import { useState, useEffect } from "react";
import { B, BD } from "../constants.js";
import { ThemeToggle } from "./UI/ThemeToggle.jsx";
import { BrandLogo } from "./UI/BrandLogo.jsx";

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
    ["solicitudes", "🗳️", "Secciones Adicionales"],
    ["agregar", "➕", "Agregar Profesor"], 
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
        height: 66, 
        boxShadow: "0 4px 24px rgba(12,68,124,.35)", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
      }}>
        <span
          onClick={() => handleNav("home")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0, transition: "transform 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Ir a inicio"
        >
          <BrandLogo size="md" variant="light" showSubtitle={true} />
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
              style={p === "feedback" ? { background: "var(--primary-orange)", color: "#fff", padding: "6px 13px", borderRadius: 20, fontWeight: 800 } : {}}
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
          <BrandLogo size="sm" variant="dark" showSubtitle={false} />
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
          transform: hidden ? "translateY(150%)" : "translateY(0)"
        }}
      >
        {[
          ["home", "🏠", "Inicio"],
          ["ranking", "🏆", "Ranking"],
          ["solicitudes", "🗳️", "Secciones\nAdicionales"],
          ["agregar", "➕", "Agregar\nProfesor"],
          ["feedback", "💡", "Sugerencias"]
        ].map(([p, icon, label]) => (
          <div 
            key={p} 
            className={`bottom-nav-item${page === p ? " active" : ""}`} 
            onClick={() => navigate(p === "home" ? "/" : `/${p}`)}
            style={p === "feedback" ? { background: "var(--primary-orange)", color: "#fff", borderRadius: 14 } : {}}
          >
            <span style={{ fontSize: 18, marginBottom: 0 }}>{icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: p === "feedback" ? "#fff" : "inherit", whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.05 }}>{label}</span>
          </div>
        ))}
      </nav>
    </>
  );
};
