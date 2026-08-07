import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { B, OR } from "../constants.js";

export const Feedback = ({ navigate, crearFeedback }) => {
  const [mensaje, setMensaje] = useState("");
  const [contacto, setContacto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (!mensaje.trim()) return;
    setEnviando(true);
    await crearFeedback({ mensaje, contacto });
    setMensaje("");
    setContacto("");
    setEnviando(false);
    setTimeout(() => {
      navigate("home");
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px 64px" }}>
      <Helmet>
        <title>Sugerencias | ProfesoresUCSUR</title>
        <meta name="description" content="Envía tus sugerencias o reporta problemas de forma anónima a los administradores de ProfesoresUCSUR." />
      </Helmet>

      <div className="card fade-in" style={{ padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>Buzón de Sugerencias</h2>
          <p style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 500, lineHeight: 1.5 }}>
            ¿Tienes alguna idea para mejorar la página o encontraste algún error? Déjanos un mensaje. ¡Es 100% anónimo!
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 700 }}>TU MENSAJE <span style={{ color: OR }}>*</span></label>
          <textarea 
            className="textarea" 
            placeholder="Escribe tu sugerencia, reporte de bug o comentario aquí..." 
            value={mensaje} 
            onChange={e => setMensaje(e.target.value)} 
            style={{ padding: 16, minHeight: 120, fontSize: 15 }} 
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 700 }}>CONTACTO <span style={{ fontWeight: 500 }}>(opcional)</span></label>
          <input 
            className="input" 
            placeholder="Correo o Instagram (solo si quieres que te respondamos)" 
            value={contacto} 
            onChange={e => setContacto(e.target.value)} 
            style={{ padding: "14px 16px", fontSize: 15 }} 
          />
        </div>

        <button 
          className="btn-cta" 
          onClick={handleSubmit} 
          disabled={!mensaje.trim() || enviando}
          style={{ width: "100%", padding: 16, fontSize: 15, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, opacity: (!mensaje.trim() || enviando) ? 0.6 : 1 }}
        >
          {enviando ? "Enviando..." : "🚀 Enviar Sugerencia"}
        </button>
      </div>
    </div>
  );
};
