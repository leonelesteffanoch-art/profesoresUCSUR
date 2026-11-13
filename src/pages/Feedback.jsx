import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { B, BD, OR } from "../constants.js";
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
      .filter((f) => f.respuesta && f.esPublico)
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
    <div className="page-shell-wide">
      <Helmet>
        <title>Buzón de Sugerencias | ProfesoresUCSUR</title>
        <meta
          name="description"
          content="Envía tus sugerencias, ideas o reporta problemas de forma 100% anónima en ProfesoresUCSUR."
        />
      </Helmet>

      {/* Hero Banner */}
      <div
        className="card fade-in hero-banner"
        style={{
          backgroundColor: BD,
          backgroundImage: `radial-gradient(at 15% 15%, rgba(56, 189, 248, 0.16) 0, transparent 48%), radial-gradient(at 88% 82%, rgba(232, 119, 34, 0.24) 0, transparent 52%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(145deg, #07294d 0%, ${BD} 48%, ${B} 100%)`,
          backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px, 100% 100%",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
          <div style={{ flex: "1 1 300px", maxWidth: 640 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.14)",
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.6
              }}
            >
              ✨ Construido por y para estudiantes
            </div>
            <h1 style={{ fontSize: "clamp(23px, 4.5vw, 32px)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
              Buzón de Ideas y Sugerencias
            </h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.6 }}>
              ¿Qué te gustaría ver en la próxima actualización de <strong>ProfesoresUCSUR</strong>? Tu mensaje llega directo al panel de administración y podemos responderte aquí mismo en el mural público.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flex: "1 1 230px",
              maxWidth: "100%",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              padding: "13px 18px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.18)"
            }}
          >
            <span style={{ fontSize: 26 }}>🕵️‍♂️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>100% Anónimo</div>
              <div style={{ fontSize: 12, opacity: 0.84 }}>Sin registros ni correos obligatorios</div>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-layout">
        {/* Columna Formulario */}
        <div className="feedback-form">
          <div className="card card-pad fade-in" style={{ border: "1.5px solid var(--border-color)" }}>
            {enviadoExito ? (
              <div className="fade-in" style={{ textAlign: "center", padding: "22px 10px" }}>
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
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>✍️ Envíanos tu mensaje</h2>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                    Elige una categoría para ayudarnos a priorizarlo
                  </p>
                </div>

                {/* Selector de categoría */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8, marginBottom: 18 }}>
                  {CATEGORIAS_SUGERENCIA.map((cat) => {
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
                          border: active ? "1.5px solid var(--primary-blue)" : "1.5px solid var(--border-color)",
                          background: active ? "var(--light-blue)" : "var(--surface-subtle)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          fontFamily: "inherit"
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
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}
                  >
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
                    onChange={(e) => setMensaje(e.target.value)}
                    style={{ padding: 14, minHeight: 115, fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}
                  >
                    Contacto <span style={{ fontWeight: 500, textTransform: "none" }}>(opcional, por si necesitas respuesta directa)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="Instagram, correo o WhatsApp (nunca se publica)"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    style={{ padding: "12px 14px", fontSize: 14 }}
                  />
                </div>

                <button
                  className="btn-cta"
                  onClick={handleSubmit}
                  disabled={!mensaje.trim() || enviando}
                  style={{
                    width: "100%",
                    padding: 15,
                    fontSize: 15,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    opacity: !mensaje.trim() || enviando ? 0.6 : 1
                  }}
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
              <span
                style={{
                  fontSize: 20,
                  background: "var(--light-blue)",
                  borderRadius: 12,
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                📣
              </span>
              <div>
                <h2 style={{ fontSize: 18.5, fontWeight: 800, color: "var(--text-dark)", letterSpacing: -0.3 }}>
                  Mural de Respuestas Oficiales
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Sugerencias de alumnos respondidas por los administradores</p>
              </div>
            </div>
            <span className="pill tabular-nums" style={{ fontSize: 12, background: "var(--surface-subtle)", color: "var(--text-medium)", border: "1px solid var(--border-color)", padding: "5px 12px" }}>
              {publicFeedbacks.length} {publicFeedbacks.length === 1 ? "respuesta" : "respuestas"}
            </span>
          </div>

          {publicFeedbacks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {publicFeedbacks.map((f) => (
                <div
                  key={f.id}
                  className="card card-pad fade-in"
                  style={{
                    borderLeft: `4px solid ${B}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}
                >
                  {/* Pregunta del estudiante */}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 11,
                        background: "var(--surface-subtle)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        flexShrink: 0
                      }}
                    >
                      🎓
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          Estudiante anónimo
                        </span>
                        {f.createdAt && <span style={{ fontSize: 11, color: "var(--text-light)" }}>{formatFecha(f.createdAt)}</span>}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-dark)", fontWeight: 600, lineHeight: 1.5, wordBreak: "break-word" }}>
                        “{f.mensaje}”
                      </div>
                    </div>
                  </div>

                  {/* Respuesta de Admin */}
                  <div
                    style={{
                      background: "var(--light-blue)",
                      padding: "13px 15px",
                      borderRadius: 12,
                      border: `1px solid ${B}28`
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
            <div className="card card-pad" style={{ textAlign: "center", padding: "44px 20px", color: "var(--text-light)" }}>
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
