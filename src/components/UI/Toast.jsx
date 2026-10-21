import { useEffect } from "react";

export const Toast = ({ msg, onDone }) => {
  useEffect(() => { 
    const t = setTimeout(onDone, 3200); 
    return () => clearTimeout(t);
  }, [onDone]);
  
  return (
    <div style={{ 
      position: "fixed", 
      bottom: "clamp(84px, 10vh, 96px)", 
      left: "50%", 
      transform: "translateX(-50%)", 
      background: "rgba(15, 23, 42, 0.96)", 
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      color: "#fff", 
      padding: "13px 22px", 
      borderRadius: 16, 
      fontSize: 13.5, 
      fontWeight: 700, 
      zIndex: 9999, 
      boxShadow: "0 12px 32px rgba(0,0,0,.35)", 
      animation: "slideUp .35s cubic-bezier(0.4, 0, 0.2, 1)", 
      maxWidth: "calc(100vw - 32px)",
      textAlign: "center",
      lineHeight: 1.4,
      border: "1px solid rgba(255,255,255,0.14)"
    }}>
      {msg}
    </div>
  );
};
