import { B, BD } from "../constants.js";
import { BrandLogo } from "./UI/BrandLogo.jsx";

export const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    textAlign: "left",
    padding: "5px 0",
    cursor: "pointer",
    fontSize: "13.5px",
    fontFamily: "inherit",
    fontWeight: 600,
    transition: "color 0.2s, transform 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 7
  };

  return (
    <footer
      className="site-footer"
      style={{
        background: `linear-gradient(155deg, #07203f 0%, ${BD} 50%, ${B} 100%)`,
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        marginTop: 0,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,119,34,0.16) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "32px",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Columna 1: Identidad */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "inline-flex", width: "fit-content" }}>
            <BrandLogo size="sm" variant="light" showSubtitle={true} />
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6, maxWidth: 300 }}>
            Guía colaborativa de estudiantes de la Universidad Científica del Sur para elegir cursos con referencias reales.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "5px 12px", width: "fit-content", fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
            🔒 100% Anónimo · Sin registro obligatorio
          </div>
        </div>

        {/* Columna 2: Explorar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.48)", letterSpacing: 1.2, textTransform: "uppercase" }}>
            Explorar
          </h3>
          {[
            ["home", "🏠", "Inicio / Directorio"],
            ["ranking", "🏆", "Ranking de Profesores"],
            ["solicitudes", "🗳️", "Secciones Adicionales"],
            ["agregar", "➕", "Agregar Profesor o Curso"]
          ].map(([route, icon, label]) => (
            <button
              key={route}
              onClick={() => onNavigate(route)}
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Columna 3: Comunidad */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 800, color: "rgba(255,255,255,0.48)", letterSpacing: 1.2, textTransform: "uppercase" }}>
            Comunidad
          </h3>
          <button
            onClick={() => onNavigate("feedback")}
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "translateX(3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span>💡</span>
            <span>Buzón de Sugerencias</span>
          </button>
          <button
            onClick={() => onNavigate("admin")}
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.transform = "translateX(3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span>⚙️</span>
            <span>Administración</span>
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 920,
          margin: "30px auto 0",
          paddingTop: 18,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          color: "rgba(255,255,255,0.48)",
          fontSize: 12,
          fontWeight: 500
        }}
      >
        <span>© {currentYear} ProfesoresUCSUR · Universidad Científica del Sur</span>
        <span>Plataforma estudiantil independiente</span>
      </div>
    </footer>
  );
};
