import { ratingColor, ratingLabel } from "../../utils/helpers.js";

export const RatingChip = ({ r, large = false }) => {
  if (!r) {
    return (
      <span style={{ 
        background: "var(--ghost-bg)", 
        color: "var(--text-light)", 
        fontSize: large ? 13 : 11.5, 
        fontWeight: 700, 
        padding: large ? "8px 14px" : "4px 10px", 
        borderRadius: 10,
        border: "1px solid var(--border-color)",
        display: "inline-block"
      }}>
        Nuevo
      </span>
    );
  }
  const c = ratingColor(r);
  
  return large ? (
    <div style={{ textAlign: "center" }}>
      <span style={{ 
        background: `${c}18`, 
        color: c, 
        fontWeight: 800, 
        fontSize: 28, 
        padding: "10px 18px", 
        borderRadius: 14, 
        lineHeight: 1.2, 
        display: "inline-block",
        border: `1px solid ${c}30`
      }}>
        ★ {r.toFixed(1)}
      </span>
      <div style={{ fontSize: 11.5, color: c, fontWeight: 800, marginTop: 6, letterSpacing: 0.3 }}>
        {ratingLabel(r)}
      </div>
    </div>
  ) : (
    <span style={{ 
      background: `${c}18`, 
      color: c, 
      fontWeight: 800, 
      fontSize: 14.5, 
      padding: "5px 11px", 
      borderRadius: 10,
      border: `1px solid ${c}28`,
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }}>
      <span style={{ fontSize: 12 }}>★</span> {r.toFixed(1)}
    </span>
  );
};
