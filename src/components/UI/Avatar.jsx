import { FAC_COLOR, B } from "../../constants.js";
import { initials } from "../../utils/helpers.js";

export const Avatar = ({ name, fac, size = 48 }) => {
  const accent = FAC_COLOR[fac] || B;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.34),
        backgroundColor: "var(--card-bg)",
        backgroundImage: `linear-gradient(145deg, ${accent}2a 0%, ${accent}12 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.34),
        fontWeight: 800,
        color: accent,
        flexShrink: 0,
        border: `1.5px solid ${accent}45`,
        boxShadow: `0 4px 14px ${accent}1F, inset 0 1px 1px rgba(255,255,255,0.45)`,
        letterSpacing: "-0.5px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 55%)",
          pointerEvents: "none"
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{initials(name)}</span>
    </div>
  );
};
