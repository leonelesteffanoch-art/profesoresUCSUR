import { ratingColor, ratingLabel } from "../../utils/helpers.js";

export const RatingChip = ({ r, large = false }) => {
  if (!r) return <span style={{ color: "#bbb", fontSize: 12 }}>Sin calificar</span>;
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
        display: "inline-block" 
      }}>
        ★ {r.toFixed(1)}
      </span>
      <div style={{ fontSize: 11, color: c, fontWeight: 700, marginTop: 6 }}>
        {ratingLabel(r)}
      </div>
    </div>
  ) : (
    <span style={{ 
      background: `${c}18`, 
      color: c, 
      fontWeight: 800, 
      fontSize: 15, 
      padding: "4px 12px", 
      borderRadius: 10 
    }}>
      {r.toFixed(1)}
    </span>
  );
};
