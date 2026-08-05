import { OR } from "../../constants.js";

export const Stars = ({ value, onChange, size = 16, gap = 2 }) => (
  <span style={{ display: "inline-flex", gap }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} onClick={() => onChange && onChange(s)}
        style={{ 
          fontSize: size, 
          color: s <= Math.round(value) ? OR : "#dde3ec", 
          cursor: onChange ? "pointer" : "default", 
          lineHeight: 1, 
          display: "inline-block", 
          transition: "transform .15s cubic-bezier(0.4, 0, 0.2, 1), color .15s" 
        }}
        onMouseEnter={e => { if (onChange) e.target.style.transform = "scale(1.3)" }}
        onMouseLeave={e => { if (onChange) e.target.style.transform = "scale(1)" }}>★</span>
    ))}
  </span>
);
