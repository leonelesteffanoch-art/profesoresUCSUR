import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { B, OR } from "../constants.js";
import { formatFecha } from "../utils/helpers.js";

const CATEGORIAS_SUGERENCIA = [
  { id: "Idea / Mejora", icon: "💡", label: "Nueva función", desc: "Propón mejoras para la web" },
  { id: "Datos / Cursos", icon: "📚", label: "Corregir datos", desc: "Curso duplicado o facultad" },
  { id: "Error / Bug", icon: "🐛", label: "Reportar fallo", desc: "Algo no carga o falla" },
  { id: "Comentario", icon: "💬", label: "Otro mensaje", desc: "Duda o saludo al equipo" }
];

export const Feedback = ({ navigate, crearFeedback, feedbacks }) => {
  const [categoria, setCategoria] = useState(CATEGORIAS_SUGERENCIA[0].id);
  const [mensaje, setMensaje] = useState("");
  const [contacto, setContacto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  const publicFeedbacks = useMemo(() => {
    return (feedbacks || [])
      .filter(f => f.respuesta && f.esPublico)
      .sort((a, b) => (b.respondidoAt?.seconds || 0) - (a.respondidoAt?.seconds || 0));
  }, [feedbacks]);

  const handleSubmit = async () => {
    if (!mensaje.trim()) return;
    setEnviando(true);
    const mensajeFinal = `[${categoria}] ${mensaje.trim()}`;
    await crearFeedback({ mensaje: mensajeFinal, contacto: contacto.trim() });
    setMensaje("");
    setContacto("");
    setEnviando(false);
    setEnviadoExito(true);
  };

  return (
    <div style={{ maxWidth: 1120, margin: "28px auto", padding: "0 16px 64px" }}>
      <Helmet>
        <title>Buzón de Sugerencias | ProfesoresUCSUR</title>
        <meta name="description" content="Envía tus sugerencias, ideas o reporta problemas de forma 100% anónima en ProfesoresUCSUR." />
      </Helmet>

      {/* Hero Banner atractivo */}
      <div
        className="card fade-in"
        style={{
          padding: "32px 28px",
          background: `linear-gradient(135deg, #0f172a 0%, ${B} 60%, #0284c7 100%)`,
          color: "#fff",
          border: "none",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", right: -40, bottom: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,119,34,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
              ✨ Construido por y para estudiantes
            </div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, marginBottom: 8, letterSpacing: -0.6 }}>
              Buzón de Ideas y Sugerencias
            </h1>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>
              ¿Qué te gustaría ver en la próxima actualización de <strong>ProfesoresUCSUR</strong>? Tu mensaje llega directo al panel de administración y podemos responderte aquí mismo en el mural público.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "14px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.18)" }}>
            <span style={{ fontSize: 28 }}>🕵️‍♂️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>100% Anónimo</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Sin registros ni correos obligatorios</div>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-layout">
        {/* Columna Formulario */}
        <div className="feedback-form">
          <div className="card fade-in" style={{ padding: 26, border: `1.5px solid var(--border-color)` }}>
            {enviadoExito ? (
              <div className="fade-in" style={{ textAlign: "center", padding: "24px 12px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)", marginBottom: 8 }}>
                  ¡Gracias por tu aporte!
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                  Hemos recibido tu sugerencia. Si requiere una respuesta para toda la comunidad, la publicaremos en el mural de respuestas.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" onClick={() => setEnviadoExito(false)} style={{ padding: "10px 18px", fontSize: 13 }}>
                    ✍️ Enviar otra idea
                  </button>
                  <button className="btn btn-blue" onClick={() => navigate("home")} style={{ padding: "10px 18px", fontSize: 13 }}>
                    🏠 Volver al inicio
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>✍️ Envíanos tu mensaje</h2>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Elige una categoría para ayudarnos a priorizarlo</p>
                </div>

                {/* Selector de categoría */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 18 }}>
                  {CATEGORIAS_SUGERENCIA.map(cat => {
                    const active = categoria === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoria(cat.id)}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: active ? `2px solid ${B}` : "1.5px solid var(--border-color)",
                          background: active ? "var(--light-blue)" : "var(--bg-main)",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800, color: active ? "var(--primary-blue)" : "var(--text-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{cat.icon}</span> {cat.label}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{cat.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Tu Mensaje <span style={{ color: OR }}>*</span>
                  </label>
                  <textarea 
                    className="textarea" 
                    placeholder={
                      categoria === "Idea / Mejora"
                        ? "Ej: Sería genial poder filtrar profesores por ciclo o ver horarios..."
                        : categoria === "Datos / Cursos"
                        ? "Ej: El curso 'Biología Celular' aparece con dos nombres distintos en Medicina..."
                        : "Cuéntanos los detalles aquí..."
                    }
                    value={mensaje} 
                    onChange={e => setMensaje(e.target.value)} 
                    style={{ padding: 14, minHeight: 115, fontSize: 14 }} 
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Contacto <span style={{ fontWeight: 500, textTransform: "none" }}>(opcional, por si necesitas respuesta directa)</span>
                  </label>
                  <input 
                    className="input" 
                    placeholder="Instagram, correo o WhatsApp (nunca se publica)" 
                    value={contacto} 
                    onChange={e => setContacto(e.target.value)} 
                    style={{ padding: "12px 14px", fontSize: 14 }} 
                  />
                </div>

                <button 
                  className="btn-cta" 
                  onClick={handleSubmit} 
                  disabled={!mensaje.trim() || enviando}
                  style={{ width: "100%", padding: 15, fontSize: 15, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, opacity: (!mensaje.trim() || enviando) ? 0.6 : 1 }}
                >
                  {enviando ? "Enviando..." : "🚀 Enviar al equipo"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Columna Mural de Respuestas a la Comunidad */}
        <div className="feedback-answers">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, background: "var(--light-blue)", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>📣</span>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-dark)", letterSpacing: -0.4 }}>
                  Mural de Respuestas Oficiales
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Sugerencias de alumnos respondidas por los administradores
                </p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: "var(--ghost-bg)", color: "var(--text-medium)", padding: "5px 12px", borderRadius: 99 }}>
              {publicFeedbacks.length} {publicFeedbacks.length === 1 ? "respuesta" : "respuestas"}
            </span>
          </div>

          {publicFeedbacks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {publicFeedbacks.map(f => (
                <div
                  key={f.id}
                  className="card fade-in"
                  style={{
                    padding: 20,
                    borderLeft: `4px solid ${B}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}
                >
                  {/* Pregunta del estudiante */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--ghost-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                      🎓
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Estudiante anónimo</span>
                        {f.createdAt && (
                          <span style={{ fontSize: 11, color: "var(--text-light)" }}>{formatFecha(f.createdAt)}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-dark)", fontWeight: 600, lineHeight: 1.5 }}>
                        "{f.mensaje}"
                      </div>
                    </div>
                  </div>

                  {/* Respuesta de Admin */}
                  <div
                    style={{
                      background: "var(--light-blue)",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1px solid ${B}25`,
                      marginLeft: 12
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>🛡️</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--primary-blue)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Respuesta de Administración
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--text-dark)", lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: 500 }}>
                      {f.respuesta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-light)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>Aún no hay respuestas públicas</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Envía la primera sugerencia desde el formulario y las respuestas importantes aparecerán aquí.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
