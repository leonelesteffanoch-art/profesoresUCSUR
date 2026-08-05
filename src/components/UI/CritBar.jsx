import { ratingColor } from "../../utils/helpers.js";
import { B, OR } from "../../constants.js";

export const CritBar = ({ label, icon, value, delay = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, animation: `fadeIn .4s ease ${delay}s both` }}>
    <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{icon}</span>
    <span style={{ fontSize: 13, color: "var(--text-muted)", width: 90, flexShrink: 0, fontWeight: 500 }}>{label}</span>
    <div style={{ flex: 1, background: "#edf1f7", borderRadius: 8, height: 10, overflow: "hidden" }}>
      <div style={{ 
        width: `${value * 20}%`, 
        background: `linear-gradient(90deg, ${B}, ${OR})`, 
        height: "100%", 
        borderRadius: 8, 
        transition: "width .8s cubic-bezier(0.4, 0, 0.2, 1)" 
      }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 800, color: ratingColor(value), width: 32, textAlign: "right" }}>
      {value > 0 ? value.toFixed(1) : "—"}
    </span>
  </div>
);
