import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { B, OR } from "../constants.js";

export const Feedback = ({ navigate, crearFeedback, feedbacks }) => {
  const [mensaje, setMensaje] = useState("");
  const [contacto, setContacto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

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
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px 64px" }}>
      <Helmet>
        <title>Sugerencias | ProfesoresUCSUR</title>
        <meta name="description" content="Envía tus sugerencias o reporta problemas de forma anónima a los administradores de ProfesoresUCSUR." />
      </Helmet>

      <div className="feedback-layout">
        {/* Formulario (Derecha en PC, Arriba en Celular) */}
        <div className="feedback-form" ref={formRef}>
          {!showForm ? (
            <div 
              className="card banner-btn fade-in" 
              style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, background: `linear-gradient(135deg, ${B}, #1e3a5f)`, cursor: "pointer", border: "none", flexWrap: "wrap" }}
              onClick={() => {
                setShowForm(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
              }}>
              <div style={{ fontSize: 32 }}>💡</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>¿Tienes alguna sugerencia?</div>
                <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 500 }}>Ayúdanos a mejorar o reporta errores. Es 100% anónimo.</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.25)", borderRadius: 12, padding: "10px 18px", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0, textAlign: "center", width: "100%", maxWidth: 120 }}>
                Escribir ↓
              </div>
            </div>
          ) : (
            <div className="card fade-in" style={{ padding: 32, border: `2px solid ${B}40`, boxShadow: `0 8px 32px ${B}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: `${B}18`, borderRadius: 12, padding: "10px 14px", fontSize: 24 }}>💡</div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)" }}>Buzón de Sugerencias</h2>
                    <p style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 500, marginTop: 2 }}>100% anónimo y privado</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: "var(--text-light)" }}>✕</button>
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
        )}
      </div>

      {/* Sugerencias respondidas de la comunidad (Izquierda en PC, Abajo en Celular) */}
        <div className="feedback-answers">
          {(feedbacks || []).filter(f => f.respuesta && f.esPublico).length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24, background: "#fef08a", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>💡</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)", letterSpacing: -0.5 }}>Respuestas a la comunidad</h2>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(feedbacks || []).filter(f => f.respuesta && f.esPublico).sort((a, b) => (b.respondidoAt?.seconds || 0) - (a.respondidoAt?.seconds || 0)).map(f => (
                  <div key={f.id} className="card fade-in" style={{ padding: 20, borderLeft: "4px solid #eab308" }}>
                    <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 8, fontStyle: "italic" }}>
                      "{f.mensaje}"
                    </div>
                    <div style={{ background: "#fef8c4", padding: 12, borderRadius: 8, borderLeft: "2px solid #ca8a04" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#a16207", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Respuesta Oficial</div>
                      <div style={{ fontSize: 14, color: "#713f12", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{f.respuesta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-light)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Aún no hay respuestas públicas.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
