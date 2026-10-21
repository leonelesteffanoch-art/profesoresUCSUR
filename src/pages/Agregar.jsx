import { Link } from "react-router-dom";
import { FACULTADES, FAC_COLOR, FAC_BG, B, BD, BL, OR, CRIT, CRIT_LABEL, CRIT_ICON, FACULTADES_FORM, SEMESTRES, SEDES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { similarity, ratingColor, ratingLabel, normalizeText, resolveCanonicalCourse, capitalizeName } from "../utils/helpers.js";

export const Agregar = ({
  profesores,
  addMode, setAddMode,
  addProf, setAddProf,
  addProfSel, setAddProfSel,
  addCurso, setAddCurso,
  addCursoSede, setAddCursoSede,
  addCursoFac, setAddCursoFac,
  submitAddProf,
  submitAgregarCurso,
  carreras
}) => {
  // Detector inteligente de profesores similares o duplicados (tolera nombres incompletos, invertidos y errores de tipeo)
  const sugerencias = addProf.nombre.trim().length >= 3
    ? profesores
        .map(p => ({ prof: p, sim: similarity(p.nombre, addProf.nombre) }))
        .filter(x => x.sim >= 0.48)
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 5)
    : [];

  const exactOrHighDuplicate = sugerencias.find(x => x.sim >= 0.85)?.prof || null;

  const cursosGlobal = [...new Set(profesores.flatMap(p => p.cursos || []))].sort((a, b) => a.localeCompare(b));
  const cursosExistentes = addProf.curso.trim() 
    ? cursosGlobal.filter(c => normalizeText(c).includes(normalizeText(addProf.curso))).slice(0, 18)
    : cursosGlobal.slice(0, 18);
  const canonicalPreviewNuevo = addProf.curso.trim() ? resolveCanonicalCourse(addProf.curso, cursosGlobal) : "";
  const canonicalPreviewExistente = addCurso.trim() ? resolveCanonicalCourse(addCurso, cursosGlobal) : "";
  const carrerasForm = addProf.facultadAlumno ? (carreras[addProf.facultadAlumno] || []) : [...new Set(Object.values(carreras || {}).flat())].sort();

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px 72px" }}>
      {/* Hero Banner Intuitivo */}
      <div style={{ background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, borderRadius: 22, padding: "26px 28px", marginBottom: 22, boxShadow: "var(--shadow-lg)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(232,119,34,.18)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            👨‍🏫
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 25px)", fontWeight: 800, lineHeight: 1.2 }}>Agregar Profesor o Curso</h1>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", marginTop: 2, fontWeight: 500 }}>
              Ayuda a mantener actualizada la guía de docentes de la Científica del Sur.
            </p>
          </div>
        </div>

        {/* Selector de Modo Principal Muy Claro */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 18 }}>
          {[
            ["nuevo", "➕ Registrar Nuevo Profesor", "Si el docente aún no aparece en la plataforma"],
            ["curso", "📚 Asignar Curso a Profesor", "Si el docente ya existe pero dicta otro curso"]
          ].map(([m, title, desc]) => {
            const active = addMode === m;
            return (
              <div
                key={m}
                onClick={() => { setAddMode(m); setAddProfSel(null); setAddCurso(""); }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 16,
                  cursor: "pointer",
                  background: active ? "#fff" : "rgba(255,255,255,0.1)",
                  color: active ? BD : "#fff",
                  border: active ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.2)",
                  transition: "all 0.2s ease",
                  boxShadow: active ? "0 8px 20px rgba(0,0,0,0.18)" : "none"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, opacity: active ? 0.75 : 0.8, fontWeight: 500 }}>{desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {addMode === "nuevo" && (
        <div className="card fade-in" style={{ padding: "28px 24px", display: "flex", flexWrap: "wrap", gap: 36 }}>
          
          {/* Columna Izquierda: Datos del Profesor */}
          <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ background: B, color: "#fff", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>1</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-dark)" }}>Datos del docente</span>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 6 }}>
                Nombre y apellidos del profesor <span style={{ color: OR }}>*</span>
              </label>
              <input
                className="input"
                value={addProf.nombre}
                onChange={e => setAddProf(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej. Juan Carlos Pérez García (sin Dr. ni Ing.)"
                autoComplete="off"
                style={{ borderColor: exactOrHighDuplicate ? "#ef4444" : undefined }}
              />

              {/* Validador Inteligente Anti-Duplicados en Tiempo Real */}
              {sugerencias.length > 0 && (
                <div className="fade-in" style={{
                  marginTop: 12,
                  background: exactOrHighDuplicate ? "rgba(239, 68, 68, 0.08)" : "var(--ghost-bg)",
                  border: `2px solid ${exactOrHighDuplicate ? "#ef4444" : OR}`,
                  borderRadius: 16,
                  padding: "14px 16px"
                }}>
                  <div style={{ fontSize: 12.5, color: exactOrHighDuplicate ? "#ef4444" : OR, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{exactOrHighDuplicate ? "🚨 ¡ALTO! ESTE PROFESOR YA PARECE ESTAR REGISTRADO:" : "⚠️ PROFESORES SIMILARES ENCONTRADOS — ¿Es alguno de ellos?"}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sugerencias.map(({ prof: p, sim }) => (
                      <div key={p.id} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "10px 12px",
                        background: "var(--card-bg)",
                        borderRadius: 12,
                        border: "1px solid var(--border-color)",
                        flexWrap: "wrap"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180, flex: 1 }}>
                          <Avatar name={p.nombre} fac={p.facultad} size={38} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span>{p.nombre}</span>
                              {sim >= 0.85 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 6, fontWeight: 800 }}>Coincidencia {Math.round(sim * 100)}%</span>}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 2 }}>
                              {p.facultad} · {(p.cursos || []).slice(0, 2).join(", ") || "Sin cursos"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn btn-orange"
                            style={{ padding: "6px 11px", fontSize: 11.5, borderRadius: 9 }}
                            onClick={() => {
                              setAddProfSel(p);
                              setAddMode("curso");
                              if (addProf.curso) setAddCurso(addProf.curso);
                            }}
                          >
                            ➕ Agregarle curso
                          </button>
                          <Link
                            to={`/profesor/${p.id}`}
                            className="btn btn-ghost"
                            style={{ padding: "6px 11px", fontSize: 11.5, borderRadius: 9, textDecoration: "none" }}
                          >
                            Ver perfil →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10, fontWeight: 600 }}>
                    💡 Por favor revisa si ya está en la lista antes de crear un duplicado.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>
                Facultad(es) donde enseña <span style={{ fontWeight: 500, color: "var(--text-light)", fontSize: 12 }}>(puedes marcar varias)</span>
              </label>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {FACULTADES.filter(f => f !== "Todas").map(f => {
                  const facs = addProf.facultades || [addProf.facultad];
                  const isSelected = facs.includes(f);
                  return (
                    <button key={f} type="button" className="pill" onClick={() => {
                      if (isSelected) {
                        const newFacs = facs.filter(x => x !== f);
                        if (newFacs.length > 0) setAddProf(p => ({ ...p, facultades: newFacs, facultad: newFacs[0] }));
                      } else {
                        const newFacs = [...facs, f];
                        setAddProf(p => ({ ...p, facultades: newFacs, facultad: newFacs[0] }));
                      }
                    }}
                    style={{ 
                      background: isSelected ? FAC_COLOR[f] : "transparent",
                      color: isSelected ? "#fff" : "var(--text-muted)",
                      border: `1.5px solid ${FAC_COLOR[f] || B}`,
                      cursor: "pointer",
                      padding: "6px 12px",
                      fontWeight: 700
                    }}>
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>
                Sede(s) <span style={{ fontWeight: 500, color: "var(--text-light)", fontSize: 12 }}>(puedes marcar varias)</span>
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SEDES.map(s => {
                  const sedes = addProf.sedes || [addProf.sede].filter(Boolean);
                  const isSelected = sedes.includes(s);
                  const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };
                  const c = sedeColors[s] || B;
                  return (
                    <button key={s} type="button" className="pill" onClick={() => {
                      if (isSelected) {
                        const newSedes = sedes.filter(x => x !== s);
                        if (newSedes.length > 0) setAddProf(p => ({ ...p, sedes: newSedes, sede: newSedes[0] }));
                        else setAddProf(p => ({ ...p, sedes: [], sede: "" }));
                      } else {
                        const newSedes = [...sedes, s];
                        setAddProf(p => ({ ...p, sedes: newSedes, sede: newSedes[0] }));
                      }
                    }}
                    style={{ 
                      background: isSelected ? c : "transparent",
                      color: isSelected ? "#fff" : "var(--text-muted)",
                      border: `1.5px solid ${c}`,
                      cursor: "pointer",
                      padding: "6px 14px",
                      fontWeight: 700
                    }}>
                      📍 {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 6 }}>
                Curso que enseña <span style={{ color: OR }}>*</span>
              </label>
              <input className="input" value={addProf.curso} onChange={e => setAddProf(p => ({ ...p, curso: e.target.value }))} placeholder="Ej. Cálculo I, Biología Celular..." autoComplete="off" />
              {canonicalPreviewNuevo && canonicalPreviewNuevo !== addProf.curso.trim() && (
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--primary-blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✨ Se guardará estandarizado como:</span>
                  <span style={{ background: "var(--light-blue)", padding: "2px 8px", borderRadius: 8 }}>{canonicalPreviewNuevo}</span>
                </div>
              )}
              {cursosExistentes.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-light)", marginBottom: 7, fontWeight: 800, letterSpacing: 0.4 }}>
                    📚 CURSOS EXISTENTES (TOCA UNO PARA ELEGIRLO):
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 115, overflowY: "auto", paddingRight: 4 }} className="custom-scrollbar">
                    {cursosExistentes.map(c => (
                      <span key={c} onClick={() => setAddProf(p => ({ ...p, curso: c }))}
                        style={{ 
                          background: addProf.curso === c ? (FAC_COLOR[addProf.facultad] || B) : "var(--ghost-bg)", 
                          color: addProf.curso === c ? "#fff" : "var(--text-dark)", 
                          border: "1px solid var(--border-color)",
                          padding: "5px 12px", 
                          borderRadius: 20, 
                          fontSize: 12, 
                          fontWeight: 700, 
                          cursor: "pointer", 
                          transition: "all .15s" 
                        }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {addProf.nombre && (
              <div style={{ background: "var(--ghost-bg)", borderRadius: 14, padding: "14px 16px", border: "1px dashed var(--border-color)" }}>
                <div style={{ fontSize: 10.5, color: "var(--text-light)", marginBottom: 8, fontWeight: 800, letterSpacing: 0.5 }}>VISTA PREVIA DE LA TARJETA</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar name={capitalizeName(addProf.nombre)} fac={addProf.facultad} size={46} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)" }}>{capitalizeName(addProf.nombre)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2, fontWeight: 600 }}>{addProf.facultad}{canonicalPreviewNuevo && ` · 📚 ${canonicalPreviewNuevo}`}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Columna Derecha: Reseña Inicial */}
          <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--border-color)", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: OR, color: "#fff", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>2</span>
                <div>
                  <div style={{ fontWeight: 800, color: "var(--text-dark)", fontSize: 16 }}>Tu primera reseña</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-light)", fontWeight: 600 }}>{addProf.incluirResena ? "Incluir calificación inicial" : "Solo registrar al docente"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setAddProf(p => ({ ...p, incluirResena: !p.incluirResena }))}>
                <div style={{ width: 46, height: 26, background: addProf.incluirResena ? "var(--primary-blue)" : "var(--border-color)", borderRadius: 14, position: "relative", transition: "background 0.25s" }}>
                  <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: addProf.incluirResena ? 23 : 3, transition: "left 0.25s", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
            </div>

            {addProf.incluirResena ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 10, letterSpacing: 0.4 }}>CALIFICA LOS 4 CRITERIOS <span style={{ color: OR }}>*</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                  {CRIT.map(c => (
                    <div key={c} className={`crit-box${addProf[c] > 0 ? " active" : ""}`} style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700 }}>{CRIT_ICON[c]} {CRIT_LABEL[c]}</div>
                      <Stars value={addProf[c]} onChange={v => setAddProf(prev => ({ ...prev, [c]: v }))} size={24} gap={3} />
                      {addProf[c] > 0 && <div style={{ fontSize: 11, color: ratingColor(addProf[c]), fontWeight: 800, marginTop: 4 }}>{ratingLabel(addProf[c])}</div>}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 8, letterSpacing: 0.4 }}>DATOS OPCIONALES DEL ALUMNO</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <select className="input" style={{ padding: "10px 12px", fontSize: 13, cursor: "pointer" }} value={addProf.facultadAlumno}
                    onChange={e => setAddProf(prev => ({ ...prev, facultadAlumno: e.target.value, carrera: "" }))}>
                    <option value="">🏫 Tu facultad...</option>
                    {FACULTADES_FORM.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select className="input" style={{ padding: "10px 12px", fontSize: 13, cursor: "pointer" }} value={addProf.carrera}
                    onChange={e => {
                      const val = e.target.value;
                      const matchFac = Object.keys(carreras || {}).find(fac => carreras[fac].includes(val));
                      setAddProf(prev => ({ ...prev, carrera: val, ...(matchFac && !prev.facultadAlumno ? { facultadAlumno: matchFac } : {}) }));
                    }}
                    disabled={carrerasForm.length === 0}>
                    <option value="">🎓 Tu carrera...</option>
                    {carrerasForm.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
                  <select className="input" style={{ flex: 1, padding: "10px 12px", fontSize: 13, cursor: "pointer" }} value={addProf.ciclo || ""}
                    onChange={e => setAddProf(prev => ({ ...prev, ciclo: e.target.value }))}>
                    <option value="">📅 Ciclo cursado...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={String(n)}>Ciclo {n}</option>)}
                  </select>
                  <select className="input" style={{ flex: 1, padding: "10px 12px", fontSize: 13, cursor: "pointer" }} value={addProf.semestre || ""}
                    onChange={e => setAddProf(prev => ({ ...prev, semestre: e.target.value }))}>
                    <option value="">🗓️ Semestre...</option>
                    {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 8, letterSpacing: 0.4 }}>TU COMENTARIO <span style={{ color: OR }}>*</span></div>
                <textarea className="textarea" style={{ fontSize: 14, padding: 12, minHeight: 95 }} value={addProf.texto} onChange={e => { if (e.target.value.length <= 500) setAddProf(prev => ({ ...prev, texto: e.target.value })); }} placeholder="¿Cómo explica? ¿Qué tal sus exámenes y trato con los alumnos?" maxLength={500} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: addProf.texto.length >= 450 ? "#DC2626" : "var(--text-light)", fontWeight: 600 }}>{addProf.texto.length} / 500</span>
                  {addProf.texto.length < 20 && addProf.texto.length > 0 && <span style={{ fontSize: 11, color: OR, fontWeight: 700 }}>Mínimo 20 caracteres</span>}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-light)", background: "var(--ghost-bg)", borderRadius: 16, padding: 28, margin: "8px 0" }}>
                <div style={{ fontSize: 44 }}>✨</div>
                <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  El profesor se registrará sin reseña inicial y aparecerá en la sección <b>"Recién agregados"</b> para que otros alumnos lo califiquen.
                </div>
              </div>
            )}
            
            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <button className="btn btn-blue" onClick={submitAddProf} style={{ width: "100%", padding: "16px", fontSize: 15.5, borderRadius: 14 }}>
                {addProf.incluirResena ? "🚀 Registrar Profesor y Publicar Reseña" : "➕ Registrar Profesor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addMode === "curso" && (
        <div className="card fade-in" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>
              1. Busca y selecciona al profesor existente
            </label>
            <input className="input" placeholder="🔍 Escribe el nombre o apellido del profesor..." autoComplete="off"
              value={addProfSel ? addProfSel.nombre : addProf.nombre}
              onChange={e => { setAddProf(p => ({ ...p, nombre: e.target.value })); setAddProfSel(null); }} />
            {!addProfSel && addProf.nombre.trim().length >= 2 && (
              <div style={{ marginTop: 8, border: "1.5px solid var(--border-color)", borderRadius: 14, overflow: "hidden", background: "var(--card-bg)", boxShadow: "var(--shadow-md)" }}>
                {profesores
                  .map(p => ({ p, sim: similarity(p.nombre, addProf.nombre) }))
                  .filter(x => x.sim > 0.3 || normalizeText(x.p.nombre).includes(normalizeText(addProf.nombre)))
                  .sort((a, b) => b.sim - a.sim)
                  .slice(0, 6)
                  .map(({ p }, i) => (
                    <div key={p.id} onClick={() => setAddProfSel(p)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid var(--border-color)" : "none", cursor: "pointer", transition: "background .2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--ghost-bg)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Avatar name={p.nombre} fac={p.facultad} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)" }}>{p.nombre}</div>
                        <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--primary-blue)" }}>Elegir →</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {addProfSel && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ background: "var(--ghost-bg)", borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${FAC_COLOR[addProfSel.facultad] || B}40` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                  <Avatar name={addProfSel.nombre} fac={addProfSel.facultad} size={52} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>{addProfSel.nombre}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, fontWeight: 600 }}>{addProfSel.facultad}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => { setAddProfSel(null); setAddProf(p => ({ ...p, nombre: "" })); }}>
                    ✕ Cambiar profesor
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-light)", marginBottom: 8, fontWeight: 800, letterSpacing: 0.5 }}>CURSOS QUE YA TIENE REGISTRADOS:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(addProfSel.cursos || []).map(c => (
                    <span key={c} style={{ background: "var(--card-bg)", padding: "5px 12px", borderRadius: 20, fontSize: 12.5, color: "var(--text-dark)", fontWeight: 700, border: "1px solid var(--border-color)" }}>📚 {c}</span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>
                  2. Escribe o elige el nuevo curso que dicta
                </label>
                <input className="input" value={addCurso} onChange={e => setAddCurso(e.target.value)} placeholder="Ej. Cálculo II, Bioquímica..." autoComplete="off" list="cursosGlobalList" />
                <datalist id="cursosGlobalList">
                  {cursosGlobal.map(c => <option key={c} value={c} />)}
                </datalist>
                {canonicalPreviewExistente && canonicalPreviewExistente !== addCurso.trim() && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--primary-blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>✨ Se guardará estandarizado como:</span>
                    <span style={{ background: "var(--light-blue)", padding: "2px 8px", borderRadius: 8 }}>{canonicalPreviewExistente}</span>
                  </div>
                )}

                <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8, marginTop: 18 }}>
                  Añadir Nuevas Sedes <span style={{ fontWeight: 500, color: "var(--text-light)" }}>(Opcional)</span>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SEDES.filter(s => !(addProfSel.sedes || [addProfSel.sede]).includes(s)).map(s => {
                    const isSelected = addCursoSede.includes(s);
                    const sedeColors = { "Villa": "#2563EB", "Norte": "#059669", "Aramburú": "#D97706", "Ate": "#7C3AED" };
                    const c = sedeColors[s] || B;
                    return (
                      <button key={s} type="button" className="pill" onClick={() => {
                        if (isSelected) setAddCursoSede(addCursoSede.filter(x => x !== s));
                        else setAddCursoSede([...addCursoSede, s]);
                      }}
                      style={{ 
                        background: isSelected ? c : "transparent",
                        color: isSelected ? "#fff" : "var(--text-muted)",
                        border: `1.5px solid ${c}`,
                        cursor: "pointer",
                        padding: "6px 12px",
                        fontWeight: 700
                      }}>
                        📍 {s}
                      </button>
                    );
                  })}
                  {SEDES.filter(s => !(addProfSel.sedes || [addProfSel.sede]).includes(s)).length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--text-light)" }}>Este profesor ya tiene todas las sedes registradas.</div>
                  )}
                </div>

                <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8, marginTop: 16 }}>
                  Añadir Nuevas Facultades <span style={{ fontWeight: 500, color: "var(--text-light)" }}>(Opcional)</span>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {FACULTADES.filter(f => f !== "Todas" && !(addProfSel.facultades || [addProfSel.facultad]).includes(f)).map(f => {
                    const isSelected = addCursoFac.includes(f);
                    const c = FAC_COLOR[f] || B;
                    return (
                      <button key={f} type="button" className="pill" onClick={() => {
                        if (isSelected) setAddCursoFac(addCursoFac.filter(x => x !== f));
                        else setAddCursoFac([...addCursoFac, f]);
                      }}
                      style={{ 
                        background: isSelected ? c : "transparent",
                        color: isSelected ? "#fff" : "var(--text-muted)",
                        border: `1.5px solid ${c}`,
                        cursor: "pointer",
                        padding: "6px 12px",
                        fontWeight: 700
                      }}>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="btn btn-orange" onClick={submitAgregarCurso} style={{ width: "100%", padding: "15px", fontSize: 15, borderRadius: 14 }}>
                📚 Guardar curso en {addProfSel.nombre}
              </button>
            </div>
          )}

          {!addProfSel && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-light)", fontSize: 14, fontWeight: 600, background: "var(--ghost-bg)", borderRadius: 14 }}>
              👆 Escribe arriba el nombre del profesor para seleccionarlo y añadirle su nuevo curso.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
