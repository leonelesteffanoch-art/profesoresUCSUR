import { OR } from "../../constants.js";

export const BrandLogo = ({ size = "md", variant = "light", showSubtitle = true }) => {
  const isSmall = size === "sm";
  const boxSize = isSmall ? 34 : 42;
  const radius = isSmall ? 11 : 13;
  const titleSize = isSmall ? 15.5 : 17.5;
  const isDarkText = variant === "dark";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: isSmall ? 10 : 12, userSelect: "none" }}>
      {/* Icono Vectorial Premium (Birrete + Estrella de Calificación) */}
      <div
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius: radius,
          background: `linear-gradient(145deg, #FF9A3C 0%, ${OR} 55%, #C25306 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 16px rgba(232, 119, 34, 0.42), inset 0 1.5px 1px rgba(255, 255, 255, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          position: "relative",
          flexShrink: 0,
          overflow: "hidden"
        }}
      >
        {/* Brillo superior sutil */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: -10,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
            pointerEvents: "none"
          }}
        />
        <svg
          width={isSmall ? 20 : 25}
          height={isSmall ? 20 : 25}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 2px 3px rgba(120, 40, 0, 0.35))" }}
        >
          {/* Birrete Universitario Superior */}
          <path
            d="M14 3.5L2.8 8.6L14 13.7L25.2 8.6L14 3.5Z"
            fill="#FFFFFF"
          />
          {/* Borla del birrete */}
          <path
            d="M23.2 9.5V15.2"
            stroke="#FFF3E0"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="23.2" cy="15.8" r="1.3" fill="#FFE0B2" />
          {/* Estrella de excelencia / reseña debajo */}
          <path
            d="M14 14.8L15.85 18.45L19.9 19.02L16.95 21.85L17.65 25.85L14 23.95L10.35 25.85L11.05 21.85L8.1 19.02L12.15 18.45L14 14.8Z"
            fill="#FFF8E7"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tipografía de Marca */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: titleSize,
            lineHeight: 1.08,
            letterSpacing: -0.4,
            color: isDarkText ? "var(--text-dark)" : "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <span>Profesores</span>
          <span
            style={{
              background: isDarkText
                ? `linear-gradient(135deg, ${OR}, #d95f0e)`
                : "linear-gradient(135deg, #FFD29D 0%, #FF9B42 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 900
            }}
          >
            UCSUR
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 2.5
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#FF9B42",
                boxShadow: "0 0 6px #FF9B42",
                display: "inline-block"
              }}
            />
            <span
              style={{
                color: isDarkText ? "var(--text-muted)" : "rgba(255, 255, 255, 0.72)",
                fontSize: 9.5,
                letterSpacing: 1.4,
                fontWeight: 700,
                textTransform: "uppercase"
              }}
            >
              Científica del Sur
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
