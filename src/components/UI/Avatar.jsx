import { FAC_BG, FAC_COLOR, BL, B } from "../../constants.js";
import { initials } from "../../utils/helpers.js";

export const Avatar = ({ name, fac, size = 48 }) => (
  <div style={{ 
    width: size, 
    height: size, 
    borderRadius: "50%", 
    background: FAC_BG[fac] || BL, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: size * .32, 
    fontWeight: 700, 
    color: FAC_COLOR[fac] || B, 
    flexShrink: 0, 
    border: `2.5px solid ${FAC_COLOR[fac] || B}40`, 
    letterSpacing: "-.5px" 
  }}>
    {initials(name)}
  </div>
);
