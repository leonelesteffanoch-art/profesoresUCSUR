import { OR } from "../../constants.js";

export const Stars = ({ value = 0, onChange, size = 16, gap = 2 }) => {
  const rounded = Math.round(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap }}>
      {[1, 2, 3, 4, 5].map(s => {
        const filled = s <= rounded;
        return (
          <span
            key={s}
            onClick={() => onChange && onChange(s)}
            role={onChange ? "button" : undefined}
            aria-label={onChange ? `Calificar con ${s} estrellas` : undefined}
            style={{
              width: size,
              height: size,
              color: filled ? OR : "var(--star-empty, #dce3ee)",
              cursor: onChange ? "pointer" : "default",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform .18s cubic-bezier(0.34, 1.56, 0.64, 1), color .18s ease",
              filter: filled ? "drop-shadow(0 1px 2px rgba(232,119,34,0.28))" : "none"
            }}
            onMouseEnter={e => { if (onChange) e.currentTarget.style.transform = "scale(1.25)"; }}
            onMouseLeave={e => { if (onChange) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.4l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 16.96l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.4z" />
            </svg>
          </span>
        );
      })}
    </span>
  );
};
