import { useState, useEffect } from "react";
import { B, BD, OR } from "../constants.js";
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
      } else if (currentScroll > lastScroll + 6) {
        setHidden(true);
      } else if (currentScroll < lastScroll - 4) {
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
      <header
        className="site-header"
        style={{
          background: darkMode
            ? `linear-gradient(135deg, rgba(7, 17, 38, 0.94) 0%, rgba(12, 46, 94, 0.92) 100%)`
            : `linear-gradient(135deg, rgba(10, 56, 107, 0.96) 0%, rgba(21, 96, 170, 0.94) 100%)`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 6px 28px rgba(7, 25, 52, 0.25)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <span
          onClick={() => handleNav("home")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0, transition: "transform 0.18s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Ir a inicio"
        >
          <BrandLogo size="md" variant="light" showSubtitle={true} />
        </span>

        <span style={{ flex: 1 }} />

        {/* Desktop nav */}
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map(([p, icon, label]) => {
            const isActive = page === p;
            const isFeedback = p === "feedback";
            return (
              <span
                key={p}
                className={`nav-link${isActive ? " active" : ""}`}
                onClick={() => handleNav(p)}
                style={
                  isFeedback
                    ? {
                        background: isActive ? OR : "rgba(232, 119, 34, 0.2)",
                        border: `1px solid ${isActive ? OR : "rgba(253, 186, 116, 0.38)"}`,
                        color: "#fff",
                        padding: "7px 13px",
                        borderRadius: 999,
                        fontWeight: 700
                      }
                    : {}
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </span>
            );
          })}
        </nav>

        <ThemeToggle isDark={darkMode} onToggle={() => setDarkMode((d) => !d)} />

        {/* Mobile hamburger */}
        <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer overlay */}
      <div className={`mobile-menu-overlay${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`mobile-drawer${menuOpen ? " open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border-color)" }}>
          <BrandLogo size="sm" variant={darkMode ? "light" : "dark"} showSubtitle={false} />
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: "var(--ghost-bg)", border: "1px solid var(--border-color)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer", color: "var(--text-muted)", fontWeight: 700 }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {links.map(([p, icon, label]) => {
          const isActive = page === p;
          const isFeedback = p === "feedback";
          return (
            <div
              key={p}
              className={`mobile-nav-link${isActive ? " active" : ""}`}
              onClick={() => handleNav(p)}
              style={
                isFeedback
                  ? {
                      background: isActive ? OR : "rgba(232, 119, 34, 0.14)",
                      border: `1px solid rgba(232, 119, 34, 0.35)`,
                      color: isActive ? "#fff" : OR,
                      fontWeight: 800,
                      marginTop: 6
                    }
                  : {}
              }
            >
              <span style={{ fontSize: 19 }}>{icon}</span>
              <span style={isFeedback && isActive ? { color: "#fff" } : {}}>{label}</span>
            </div>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
          <div
            className="mobile-nav-link"
            onClick={() => setDarkMode((d) => !d)}
            style={{ color: "var(--text-muted)" }}
          >
            <span style={{ fontSize: 19 }}>{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Navegación móvil"
        style={{
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hidden ? "translateY(150%)" : "translateY(0)"
        }}
      >
        {[
          ["home", "🏠", "Inicio"],
          ["ranking", "🏆", "Ranking"],
          ["solicitudes", "🗳️", "Secciones"],
          ["agregar", "➕", "Agregar"],
          ["feedback", "💡", "Sugerir"]
        ].map(([p, icon, label]) => {
          const isActive = page === p;
          const isFeedback = p === "feedback";
          return (
            <div
              key={p}
              className={`bottom-nav-item${isActive ? " active" : ""}`}
              onClick={() => navigate(p === "home" ? "/" : `/${p}`)}
              style={
                isFeedback
                  ? {
                      background: isActive ? OR : "transparent",
                      color: isActive ? "#fff" : OR,
                      position: "relative"
                    }
                  : {}
              }
            >
              {isFeedback && !isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: 5,
                    right: "24%",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: OR,
                    boxShadow: `0 0 6px ${OR}`
                  }}
                />
              )}
              <span style={{ fontSize: 18, marginBottom: 0, lineHeight: 1 }}>{icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "inherit",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  lineHeight: 1.1
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </nav>
    </>
  );
};
