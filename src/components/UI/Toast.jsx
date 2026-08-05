import { useEffect } from "react";

export const Toast = ({ msg, onDone }) => {
  useEffect(() => { 
    const t = setTimeout(onDone, 3000); 
    return () => clearTimeout(t);
  }, [onDone]);
  
  return (
    <div style={{ 
      position: "fixed", 
      bottom: 32, 
      left: "50%", 
      transform: "translateX(-50%)", 
      background: "rgba(26, 37, 64, 0.95)", 
      backdropFilter: "blur(8px)",
      color: "#fff", 
      padding: "14px 24px", 
      borderRadius: 16, 
      fontSize: 14, 
      fontWeight: 600, 
      zIndex: 9999, 
      boxShadow: "0 8px 32px rgba(0,0,0,.25)", 
      animation: "slideUp .4s cubic-bezier(0.4, 0, 0.2, 1)", 
      whiteSpace: "nowrap",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      {msg}
    </div>
  );
};
