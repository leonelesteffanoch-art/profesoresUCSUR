import { ratingColor } from "../../utils/helpers.js";
import { B, OR } from "../../constants.js";

export const CritBar = ({ label, icon, value, delay = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11, animation: `fadeIn .4s ease ${delay}s both` }}>
    <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 13, color: "var(--text-medium)", width: 92, flexShrink: 0, fontWeight: 700 }}>{label}</span>
    <div style={{ flex: 1, background: "var(--ghost-bg)", borderRadius: 99, height: 10, overflow: "hidden", border: "1px solid var(--border-color)" }}>
      <div
        style={{
          width: `${Math.max(value * 20, value > 0 ? 6 : 0)}%`,
          background: `linear-gradient(90deg, ${B} 0%, #2563eb 45%, ${OR} 100%)`,
          height: "100%",
          borderRadius: 99,
          transition: "width .8s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: value > 0 ? "0 0 8px rgba(232,119,34,0.28)" : "none"
        }}
      />
    </div>
    <span className="tabular-nums" style={{ fontSize: 13.5, fontWeight: 800, color: value > 0 ? ratingColor(value) : "var(--text-light)", width: 34, textAlign: "right", flexShrink: 0 }}>
      {value > 0 ? value.toFixed(1) : "—"}
    </span>
  </div>
);
