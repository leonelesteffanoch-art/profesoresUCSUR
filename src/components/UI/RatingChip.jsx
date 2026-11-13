import { ratingColor, ratingLabel } from "../../utils/helpers.js";

const StarGlyph = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12 2.4l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 16.96l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.4z" />
  </svg>
);

export const RatingChip = ({ r, large = false }) => {
  if (!r) {
    return (
      <span
        style={{
          background: "var(--surface-subtle)",
          color: "var(--text-light)",
          fontSize: large ? 13 : 11,
          fontWeight: 800,
          padding: large ? "8px 14px" : "4px 10px",
          borderRadius: 10,
          border: "1px solid var(--border-color)",
          display: "inline-flex",
          alignItems: "center",
          gap: 4
        }}
      >
        Sin notas
      </span>
    );
  }
  const c = ratingColor(r);

  return large ? (
    <div style={{ textAlign: "center" }}>
      <div
        className="tabular-nums"
        style={{
          background: `linear-gradient(145deg, ${c}22 0%, ${c}12 100%)`,
          color: c,
          fontWeight: 800,
          fontSize: 30,
          padding: "10px 18px",
          borderRadius: 16,
          lineHeight: 1.15,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: `1.5px solid ${c}38`,
          boxShadow: `0 6px 18px ${c}18`
        }}
      >
        <StarGlyph size={22} />
        <span>{r.toFixed(1)}</span>
      </div>
      <div style={{ fontSize: 12, color: c, fontWeight: 800, marginTop: 7, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {ratingLabel(r)}
      </div>
    </div>
  ) : (
    <span
      className="tabular-nums"
      style={{
        background: `${c}18`,
        color: c,
        fontWeight: 800,
        fontSize: 14,
        padding: "5px 10px",
        borderRadius: 10,
        border: `1px solid ${c}30`,
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }}
    >
      <StarGlyph size={12} />
      <span>{r.toFixed(1)}</span>
    </span>
  );
};
