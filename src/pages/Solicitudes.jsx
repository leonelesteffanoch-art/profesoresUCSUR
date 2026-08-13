import { useState, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { B, OR, SEDES } from "../constants.js";
import { normalizeText, formatFecha } from "../utils/helpers.js";

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
  
  const formRef = useRef(null);

  // Derive unique courses from all professors
  const todosLosCursos = useMemo(() => {
    return [...new Set(profesores.flatMap(p => p.cursos || []))].sort();
  }, [profesores]);

  // Handle course search
  const cursosFiltrados = busqueda.trim()
    ? todosLosCursos.filter(c => normalizeText(c).includes(normalizeText(busqueda))).slice(0, 5)
    : [];

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
    await votarSolicitud(solId, { nombre: nombreContacto, correo: correoContacto });
    setNombreContacto("");
    setCorreoContacto("");
  };

  const solMostradas = (solicitudes || [])
    .filter(s => filtroSedeVista === "Todas" || s.sede === filtroSedeVista)
    .sort((a, b) => b.votos - a.votos);

  return (
    <div style={{ maxWidth: 840, margin: "40px auto", padding: "0 16px 64px" }}>
      <Helmet>
        <title>Solicitudes de Cursos | ProfesoresUCSUR</title>
        <meta name="description" content="Solicita la apertura de nuevos cursos o secciones por cruce de horarios en la Universidad Científica del Sur." />
      </Helmet>

      {/* Hero Banner */}
      <div 
        className="card fade-in" 
        style={{ padding: "32px 24px", background: `linear-gradient(135deg, ${B}, #1e3a5f)`, color: "#fff", border: "none", marginBottom: 32, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
        <div style={{ fontSize: 40, marginBottom: 16 }}>🗳️</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Solicita apertura de cursos</h1>
        <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 600, lineHeight: 1.5 }}>
          ¿Tu curso se cruzó o ya no hay cupos? Busca tu curso y suma tu voto. 
          Dejando tus datos podemos avisarte si se abre una nueva sección, o compartiremos la lista con la universidad para evidenciar la demanda.
        </p>
      </div>

      {/* Creation / Search Section */}
      <div className="card fade-in" style={{ padding: 24, marginBottom: 40, border: `2px solid ${B}40` }} ref={formRef}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>Buscar curso para solicitar</h2>
        
        <div style={{ position: "relative" }}>
          <input
            className="input"
            placeholder="Ej: Cálculo II, Ética..."
            value={cursoSeleccionado || busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setCursoSeleccionado("");
            }}
            style={{ fontSize: 16, padding: "14px 16px", borderColor: cursoSeleccionado ? "var(--primary-blue)" : "var(--border-color)", background: cursoSeleccionado ? "var(--light-blue)" : "var(--input-bg)" }}
          />
          
          {!cursoSeleccionado && busqueda.trim() && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, marginTop: 8, zIndex: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              {cursosFiltrados.length > 0 ? (
                cursosFiltrados.map(curso => (
                  <div 
                    key={curso} 
                    style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() => {
                      setCursoSeleccionado(curso);
                      setBusqueda("");
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--ghost-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{curso}</span>
                    <span style={{ fontSize: 12, color: "var(--primary-blue)", fontWeight: 700 }}>Seleccionar →</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>No se encontraron cursos con ese nombre.</div>
              )}
            </div>
          )}
        </div>

        {cursoSeleccionado && (
          <div className="fade-in" style={{ marginTop: 24, padding: 20, border: "1.5px solid var(--border-color)", borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>Configura tu solicitud</h3>

        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>SEDE</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SEDES.map(s => (
                <button
                  key={s}
                  onClick={() => setSedeSeleccionada(s)}
                  className="pill"
                  style={{
                    border: "none",
                    background: sedeSeleccionada === s ? B : "var(--ghost-bg)",
                    color: sedeSeleccionada === s ? "#fff" : "var(--text-muted)",
                    padding: "6px 14px", cursor: "pointer", fontSize: 13
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input 
              type="checkbox" 
              id="contacto-check" 
              checked={contactoVisible} 
              onChange={(e) => setContactoVisible(e.target.checked)} 
            />
            <label htmlFor="contacto-check" style={{ fontSize: 13, color: "var(--text-dark)", cursor: "pointer", fontWeight: 600 }}>Añadir mis datos de contacto (opcional)</label>
          </div>
        </div>

        {contactoVisible && (
          <div className="fade-in" style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", background: "var(--ghost-bg)", padding: 16, borderRadius: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input className="input" placeholder="Nombre completo" value={nombreContacto} onChange={e => setNombreContacto(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input className="input" placeholder="Correo o celular" value={correoContacto} onChange={e => setCorreoContacto(e.target.value)} />
            </div>
            <div style={{ width: "100%", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              * Tus datos serán visibles públicamente para que otros puedan organizarse, úsalos bajo tu propio riesgo.
            </div>
          </div>
        )}

            {(() => {
              const existeSede = solicitudes.find(s => s.curso === cursoSeleccionado && s.sede === sedeSeleccionada);
              if (existeSede) {
                return (
                  <div style={{ marginTop: 24, padding: 16, background: "rgba(232,119,34,.1)", borderRadius: 12, color: OR, fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                    ⚠️ Este curso ya está solicitado en la sede {sedeSeleccionada}. Búscalo abajo para sumar tu voto.
                  </div>
                );
              }
              return (
                <button 
                  className="btn btn-blue fade-in" 
                  style={{ width: "100%", padding: 16, fontSize: 15, marginTop: 24 }}
                  onClick={handleCrear}
                >
                  🚀 Crear Solicitud para {sedeSeleccionada}
                </button>
              );
            })()}
          </div>
        )}
      </div>

      {/* Filters and List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)" }}>Solicitudes Activas</h2>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {["Todas", ...SEDES].map(s => (
            <button
              key={s}
              onClick={() => setFiltroSedeVista(s)}
              className="tab"
              style={{
                background: filtroSedeVista === s ? "var(--text-dark)" : "var(--ghost-bg)",
                color: filtroSedeVista === s ? "#fff" : "var(--ghost-text)",
                border: "none", whiteSpace: "nowrap"
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {solMostradas.length > 0 ? solMostradas.map(sol => {
          const yaVoto = votadosSol[sol.id];
          const progress = Math.min((sol.votos / 20) * 100, 100); // Threshold of 20

          return (
            <div key={sol.id} className="card fade-in" style={{ padding: 20, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: "var(--ghost-bg)", padding: "4px 8px", borderRadius: 6, color: "var(--text-muted)", textTransform: "uppercase" }}>{sol.sede}</span>
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>Último voto: {formatFecha(sol.ultimoVoto || sol.createdAt)}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", marginBottom: 12 }}>{sol.curso}</h3>
                
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 8, background: "var(--ghost-bg)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: OR, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                  <span style={{ color: OR }}>{sol.votos}</span> personas solicitan este curso
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", minWidth: 100 }}>
                <button
                  className={`btn ${yaVoto ? "pop-animation" : ""}`}
                  style={{
                    background: yaVoto ? "var(--light-blue)" : "var(--ghost-bg)",
                    color: yaVoto ? B : "var(--ghost-text)",
                    border: `1.5px solid ${yaVoto ? B : "var(--border-color)"}`,
                    padding: "10px 20px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                  }}
                  onClick={() => {
                    if (!yaVoto) handleVotar(sol.id);
                  }}
                  disabled={yaVoto}
                >
                  <span style={{ fontSize: 20 }}>🔥</span>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{yaVoto ? "Votado" : "¡Lo necesito!"}</span>
                </button>
              </div>
              
              {/* Contactos */}
              {sol.contactos && sol.contactos.length > 0 && (
                <div style={{ width: "100%", marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--border-color)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>CONTACTOS INTERESADOS:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sol.contactos.slice(0, 5).map((c, idx) => (
                      <span key={idx} style={{ fontSize: 11, background: "var(--ghost-bg)", padding: "4px 10px", borderRadius: 12, color: "var(--text-dark)", fontWeight: 500 }}>
                        {c.nombre || "Estudiante"} {c.correo ? `(${c.correo})` : ""}
                      </span>
                    ))}
                    {sol.contactos.length > 5 && (
                      <span style={{ fontSize: 11, background: "var(--ghost-bg)", padding: "4px 10px", borderRadius: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                        + {sol.contactos.length - 5} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Aún no hay solicitudes para esta sede.</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Busca un curso arriba y sé el primero en solicitarlo.</div>
          </div>
        )}
      </div>
    </div>
  );
};
