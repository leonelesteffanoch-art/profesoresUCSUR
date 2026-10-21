import { useState, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { B, OR, SEDES } from "../constants.js";
import { normalizeText, formatFecha, resolveCanonicalCourse } from "../utils/helpers.js";

export const Solicitudes = ({ 
  profesores, 
  solicitudes, 
  votarSolicitud, 
  crearSolicitud, 
  votadosSol,
  navigate
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState(SEDES[0]);
  const [contactoVisible, setContactoVisible] = useState(false);
  const [nombreContacto, setNombreContacto] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [filtroSedeVista, setFiltroSedeVista] = useState("Todas");
  const [filtroTextoActivas, setFiltroTextoActivas] = useState("");
  
  const [votandoId, setVotandoId] = useState(null);
  const [votoNombre, setVotoNombre] = useState("");
  const [votoCorreo, setVotoCorreo] = useState("");
  
  const formRef = useRef(null);

  // Derive unique courses from all professors
  const todosLosCursos = useMemo(() => {
    return [...new Set(profesores.flatMap(p => p.cursos || []))].sort();
  }, [profesores]);

  // Handle course search
  const cursosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const q = normalizeText(busqueda);
    return todosLosCursos.filter(c => normalizeText(c).includes(q)).slice(0, 6);
  }, [busqueda, todosLosCursos]);

  const cursoNuevoFormateado = useMemo(() => {
    if (!busqueda.trim()) return "";
    return resolveCanonicalCourse(busqueda, todosLosCursos);
  }, [busqueda, todosLosCursos]);

  const handleCrear = async () => {
    if (!cursoSeleccionado) return;
    await crearSolicitud(cursoSeleccionado, sedeSeleccionada, { nombre: nombreContacto, correo: correoContacto });
    setBusqueda("");
    setCursoSeleccionado("");
    setNombreContacto("");
    setCorreoContacto("");
    setContactoVisible(false);
  };

  const handleVotar = async (solId) => {
    await votarSolicitud(solId, { nombre: votoNombre, correo: votoCorreo });
    setVotandoId(null);
    setVotoNombre("");
    setVotoCorreo("");
  };

  const handleShareWhatsApp = (sol) => {
    const text = `🔥 ¡Hola! Estamos juntando firmas/votos en ProfesoresUCSUR para abrir una sección adicional de *${sol.curso}* en sede *${sol.sede}* (ya vamos ${sol.votos} votos). Suma tu voto aquí 👉 ${window.location.origin}/solicitudes`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const totalVotosAcumulados = useMemo(() => {
    return (solicitudes || []).reduce((acc, s) => acc + (s.votos || 0), 0);
  }, [solicitudes]);

  const solMostradas = (solicitudes || [])
    .filter(s => filtroSedeVista === "Todas" || s.sede === filtroSedeVista)
    .filter(s => normalizeText(s.curso).includes(normalizeText(filtroTextoActivas)))
    .sort((a, b) => b.votos - a.votos);

  return (
    <div style={{ maxWidth: 920, margin: "28px auto", padding: "0 16px 64px" }}>
      <Helmet>
        <title>Secciones Adicionales | ProfesoresUCSUR</title>
        <meta name="description" content="Solicita la apertura de nuevos cursos o secciones adicionales por cruce de horarios en la Universidad Científica del Sur." />
      </Helmet>

      {/* Hero Banner */}
      <div 
        className="card fade-in" 
        style={{ padding: "32px 28px", background: `linear-gradient(135deg, ${B} 0%, #0f172a 100%)`, color: "#fff", border: "none", marginBottom: 24, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,119,34,0.28) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
              🗳️ Organización Estudiantil
            </div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, marginBottom: 10, letterSpacing: -0.6 }}>
              Secciones Adicionales
            </h1>
            <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 620, lineHeight: 1.6 }}>
              ¿Tu curso se cruzó o se cerraron las vacantes? Crea o apoya una solicitud para reunir alumnos interesados, coordinar juntos y sustentar la demanda de una nueva sección.
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{(solicitudes || []).length}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Cursos pedidos</div>
            </div>
            <div style={{ background: "rgba(232,119,34,0.22)", backdropFilter: "blur(8px)", border: "1px solid rgba(232,119,34,0.4)", borderRadius: 16, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fdba74", lineHeight: 1 }}>🔥 {totalVotosAcumulados}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>Votos totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Creation / Search Section */}
      <div className="card fade-in" style={{ padding: "24px", marginBottom: 32, border: cursoSeleccionado ? `2px solid ${B}` : "1px solid var(--border-color)" }} ref={formRef}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)" }}>➕ Solicitar apertura de sección</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Busca un curso del catálogo o escribe uno nuevo si aún no figura</p>
          </div>
          {cursoSeleccionado && (
            <button
              className="btn btn-ghost"
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => {
                setCursoSeleccionado("");
                setBusqueda("");
              }}
            >
              ✕ Cambiar curso
            </button>
          )}
        </div>
        
        <div style={{ position: "relative" }}>
          <input
            className="input"
            placeholder="Escribe el nombre del curso (ej: Cálculo II, Bioquímica, Ética...)"
            value={cursoSeleccionado || busqueda}
            readOnly={!!cursoSeleccionado}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setCursoSeleccionado("");
            }}
            style={{
              fontSize: 15,
              padding: "14px 16px",
              borderColor: cursoSeleccionado ? "var(--primary-blue)" : "var(--border-color)",
              background: cursoSeleccionado ? "var(--light-blue)" : "var(--input-bg)",
              fontWeight: cursoSeleccionado ? 700 : 500
            }}
          />
          
          {!cursoSeleccionado && busqueda.trim().length >= 2 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, marginTop: 8, zIndex: 20, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
              {cursosFiltrados.map(curso => (
                <div 
                  key={curso} 
                  style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "background 0.15s" }}
                  onClick={() => {
                    setCursoSeleccionado(curso);
                    setBusqueda("");
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--ghost-bg)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>📚 {curso}</span>
                  <span style={{ fontSize: 12, color: "var(--primary-blue)", fontWeight: 800 }}>Elegir →</span>
                </div>
              ))}
              {!cursosFiltrados.some(c => normalizeText(c) === normalizeText(cursoNuevoFormateado)) && (
                <div
                  style={{ padding: "12px 16px", background: "var(--light-blue)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => {
                    setCursoSeleccionado(cursoNuevoFormateado);
                    setBusqueda("");
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: B }}>✨ Solicitar curso: "{cursoNuevoFormateado}"</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>¿No está en la lista? Créalo con formato estandarizado</div>
                  </div>
                  <span style={{ fontSize: 12, color: B, fontWeight: 800 }}>Usar nombre →</span>
                </div>
              )}
            </div>
          )}
        </div>

        {cursoSeleccionado && (
          <div className="fade-in" style={{ marginTop: 20, padding: 20, background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  📍 Selecciona la Sede / Modalidad
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SEDES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSedeSeleccionada(s)}
                      className="pill"
                      style={{
                        border: sedeSeleccionada === s ? `1.5px solid ${B}` : "1.5px solid var(--border-color)",
                        background: sedeSeleccionada === s ? B : "var(--card-bg)",
                        color: sedeSeleccionada === s ? "#fff" : "var(--text-medium)",
                        padding: "7px 14px",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "var(--card-bg)", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <input 
                  type="checkbox" 
                  checked={contactoVisible} 
                  onChange={(e) => setContactoVisible(e.target.checked)} 
                />
                <span style={{ fontSize: 13, color: "var(--text-dark)", fontWeight: 700 }}>Dejar mi contacto para coordinar (opcional)</span>
              </label>
            </div>

            {contactoVisible && (
              <div className="fade-in" style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", background: "var(--card-bg)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <input className="input" placeholder="Tu nombre (ej: Camila R.)" value={nombreContacto} onChange={e => setNombreContacto(e.target.value)} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <input className="input" placeholder="WhatsApp, correo o Instagram" value={correoContacto} onChange={e => setCorreoContacto(e.target.value)} />
                </div>
                <div style={{ width: "100%", fontSize: 11, color: "var(--text-muted)" }}>
                  🔒 Visible para que otros alumnos interesados en el curso puedan armar el grupo y presentar la solicitud.
                </div>
              </div>
            )}

            {(() => {
              const existeSede = (solicitudes || []).find(s => normalizeText(s.curso) === normalizeText(cursoSeleccionado) && s.sede === sedeSeleccionada);
              if (existeSede) {
                return (
                  <div style={{ marginTop: 18, padding: 14, background: "rgba(232,119,34,.12)", border: `1px solid ${OR}40`, borderRadius: 12, color: OR, fontWeight: 700, fontSize: 13, textAlign: "center" }}>
                    ⚠️ Ya existe una solicitud activa para <strong>{existeSede.curso}</strong> en <strong>{sedeSeleccionada}</strong> ({existeSede.votos} votos). ¡Búscala abajo y súmate!
                  </div>
                );
              }
              return (
                <button 
                  className="btn btn-blue fade-in" 
                  style={{ width: "100%", padding: 15, fontSize: 15, marginTop: 18 }}
                  onClick={handleCrear}
                >
                  🚀 Publicar solicitud para {cursoSeleccionado} ({sedeSeleccionada})
                </button>
              );
            })()}
          </div>
        )}
      </div>

      {/* Filters and List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)" }}>
            Solicitudes Activas <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 700 }}>({solMostradas.length})</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1, justifyContent: "flex-end", minWidth: 280 }}>
          <input
            className="input"
            placeholder="🔍 Filtrar curso solicitado..."
            value={filtroTextoActivas}
            onChange={(e) => setFiltroTextoActivas(e.target.value)}
            style={{ padding: "8px 14px", fontSize: 13, maxWidth: 230, borderRadius: 10 }}
          />
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            {["Todas", ...SEDES].map(s => (
              <button
                key={s}
                onClick={() => setFiltroSedeVista(s)}
                className="tab"
                style={{
                  background: filtroSedeVista === s ? B : "var(--ghost-bg)",
                  color: filtroSedeVista === s ? "#fff" : "var(--ghost-text)",
                  border: "none",
                  whiteSpace: "nowrap",
                  padding: "7px 14px",
                  fontSize: 12
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {solMostradas.length > 0 ? solMostradas.map(sol => {
          const yaVoto = votadosSol[sol.id];
          const metaVotos = 15; // Referencia tipica para abrir seccion
          const progress = Math.min((sol.votos / metaVotos) * 100, 100);
          const esAltaDemanda = sol.votos >= 10;

          return (
            <div
              key={sol.id}
              className="card fade-in"
              style={{
                padding: "20px 22px",
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                alignItems: "center",
                borderLeft: esAltaDemanda ? `4px solid ${OR}` : `4px solid ${B}`
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: "var(--light-blue)", padding: "4px 10px", borderRadius: 99, color: "var(--primary-blue)", textTransform: "uppercase" }}>
                    📍 {sol.sede}
                  </span>
                  {esAltaDemanda && (
                    <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(232,119,34,0.14)", padding: "4px 10px", borderRadius: 99, color: OR }}>
                      🔥 Alta demanda
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500 }}>
                    Último apoyo: {formatFecha(sol.ultimoVoto || sol.createdAt)}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 10 }}>{sol.curso}</h3>
                
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 8, background: "var(--ghost-bg)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: esAltaDemanda ? `linear-gradient(90deg, ${OR}, #ef4444)` : B, borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
                  <span>
                    <strong style={{ color: esAltaDemanda ? OR : "var(--primary-blue)", fontSize: 14 }}>{sol.votos}</strong> {sol.votos === 1 ? "estudiante interesado" : "estudiantes interesados"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>Meta sugerida: {metaVotos} firmas</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleShareWhatsApp(sol)}
                  title="Compartir en grupos de WhatsApp"
                  style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, borderRadius: 12 }}
                >
                  📲 Compartir
                </button>

                {votandoId === sol.id ? (
                  <div className="fade-in" style={{ background: "var(--bg-main)", padding: 14, borderRadius: 14, border: `1.5px solid ${B}`, minWidth: 230 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: "var(--primary-blue)" }}>Opcional: Deja tu contacto</div>
                    <input className="input" placeholder="Tu nombre (opcional)" value={votoNombre} onChange={(e) => setVotoNombre(e.target.value)} style={{ padding: "8px 12px", fontSize: 12, marginBottom: 6 }} />
                    <input className="input" placeholder="WhatsApp o correo (opcional)" value={votoCorreo} onChange={(e) => setVotoCorreo(e.target.value)} style={{ padding: "8px 12px", fontSize: 12, marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost" style={{ flex: 1, padding: "7px", fontSize: 12 }} onClick={() => setVotandoId(null)}>Cancelar</button>
                      <button className="btn btn-blue" style={{ flex: 1, padding: "7px", fontSize: 12 }} onClick={() => handleVotar(sol.id)}>🔥 Confirmar</button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={`btn ${yaVoto ? "pop-animation" : ""}`}
                    style={{
                      background: yaVoto ? "var(--light-blue)" : `linear-gradient(135deg, ${OR}, #d96416)`,
                      color: yaVoto ? "var(--primary-blue)" : "#fff",
                      border: yaVoto ? `1.5px solid ${B}` : "none",
                      padding: "10px 18px",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: yaVoto ? "none" : "0 4px 12px rgba(232,119,34,0.25)"
                    }}
                    onClick={() => {
                      if (!yaVoto) setVotandoId(sol.id);
                    }}
                    disabled={yaVoto}
                  >
                    <span style={{ fontSize: 16 }}>{yaVoto ? "✅" : "🔥"}</span>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{yaVoto ? "Apoyado" : "¡Yo también!"}</span>
                  </button>
                )}
              </div>
              
              {/* Contactos */}
              {sol.contactos && sol.contactos.length > 0 && (
                <div style={{ width: "100%", marginTop: 6, paddingTop: 12, borderTop: "1px dashed var(--border-color)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    🤝 Alumnos coordinando ({sol.contactos.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sol.contactos.slice(0, 8).map((c, idx) => (
                      <span key={idx} style={{ fontSize: 11, background: "var(--ghost-bg)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 99, color: "var(--text-dark)", fontWeight: 600 }}>
                        👤 {c.nombre || "Estudiante"} {c.correo ? `· ${c.correo}` : ""}
                      </span>
                    ))}
                    {sol.contactos.length > 8 && (
                      <span style={{ fontSize: 11, background: "var(--ghost-bg)", padding: "4px 10px", borderRadius: 99, color: "var(--text-muted)", fontWeight: 700 }}>
                        +{sol.contactos.length - 8} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="card" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-light)" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>No hay solicitudes activas con este filtro</div>
            <div style={{ fontSize: 13, marginTop: 4, color: "var(--text-muted)" }}>Busca un curso en el panel de arriba y sé el primero en abrir la convocatoria.</div>
          </div>
        )}
      </div>
    </div>
  );
};
