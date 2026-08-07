import { FACULTADES, FAC_COLOR, FAC_BG, B, BD, BL, OR, CRIT, CRIT_LABEL, CRIT_ICON, FACULTADES_FORM, SEMESTRES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { similarity, ratingColor, ratingLabel } from "../utils/helpers.js";

export const Agregar = ({
  profesores,
  addMode, setAddMode,
  addProf, setAddProf,
  addProfSel, setAddProfSel,
  addCurso, setAddCurso,
  submitAddProf,
  submitAgregarCurso,
  carreras
}) => {
  const sugerencias = addProf.nombre.length >= 2
    ? profesores.filter(p => similarity(p.nombre, addProf.nombre) > 0.4).sort((a, b) => similarity(b.nombre, addProf.nombre) - similarity(a.nombre, addProf.nombre)).slice(0, 5)
    : [];
  const cursosExistentes = [...new Set(profesores.filter(p => p.facultad === addProf.facultad).flatMap(p => p.cursos || []))];
  const carrerasForm = addProf.facultadAlumno ? (carreras[addProf.facultadAlumno] || []) : [...new Set(Object.values(carreras || {}).flat())].sort();

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 64px" }}>
      {/* Guía de pasos */}
      <div style={{ background: `linear-gradient(135deg, ${BD}, ${B})`, borderRadius: 20, padding: "26px 28px", marginBottom: 28, boxShadow: "0 8px 32px rgba(21,96,170,.25)" }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginBottom: 18 }}>¿Cómo funciona?</div>
        {[
          ["1", "Elige qué quieres hacer abajo: agregar un profe nuevo o agregar un curso a uno que ya existe."],
          ["2", "Completa el formulario con el nombre, facultad y el curso que dicta."],
          ["3", "¡Listo! Otros alumnos ya podrán calificarlo."],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: n === "3" ? 0 : 14 }}>
            <div className="step-badge">{n}</div>
            <p style={{ color: "rgba(255,255,255,.85)", fontSize: 14, lineHeight: 1.5, fontWeight: 500, paddingTop: 3 }}>{t}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, background: "var(--border-color)", borderRadius: 16, padding: 6, marginBottom: 24 }}>
        {[["nuevo", "➕ Nuevo profesor"], ["curso", "📚 Agregar curso"]].map(([m, l]) => (
          <button key={m} className="tab" onClick={() => { setAddMode(m); setAddProfSel(null); setAddCurso(""); }}
            style={{ 
              flex: 1, 
              background: addMode === m ? B : "transparent", 
              color: addMode === m ? "#fff" : "var(--text-muted)", 
              fontWeight: 800,
              boxShadow: addMode === m ? "0 2px 12px rgba(21,96,170,.2)" : "none" 
            }}>
            {l}
          </button>
        ))}
      </div>

      {addMode === "nuevo" && (
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>Nombre completo del profesor</label>
            <input className="input" value={addProf.nombre} onChange={e => setAddProf(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. Juan Pérez García" autoComplete="off" />
            {sugerencias.length > 0 && (
              <div style={{ marginTop: 10, background: "#fff8f2", border: `1.5px solid ${OR}`, borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: OR, fontWeight: 800, marginBottom: 10, letterSpacing: 0.5 }}>⚠️ PROFESORES SIMILARES — ¿Ya existe?</div>
                {sugerencias.map(p => (
                  <div key={p.id} onClick={() => { setAddProfSel(p); setAddMode("curso"); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #fde8d0", cursor: "pointer", transition: "opacity .2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <Avatar name={p.nombre} fac={p.facultad} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--text-light)" }}>{p.facultad} · {(p.cursos || []).join(", ")}</div>
                    </div>
                    <span style={{ fontSize: 12, color: OR, fontWeight: 800 }}>Agregar curso →</span>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 10, fontWeight: 500 }}>Si no es ninguno, continúa creando el nuevo profesor.</div>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>Facultad del profesor</label>
            <select className="input" style={{ cursor: "pointer", appearance: "none" }} value={addProf.facultad} onChange={e => setAddProf(p => ({ ...p, facultad: e.target.value }))}>
              {FACULTADES.filter(f => f !== "Todas").map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>Curso que enseña</label>
            <input className="input" value={addProf.curso} onChange={e => setAddProf(p => ({ ...p, curso: e.target.value }))} placeholder="Ej. Cálculo III" autoComplete="off" />
            {cursosExistentes.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-light)", marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>CURSOS YA REGISTRADOS EN ESTA FACULTAD</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cursosExistentes.map(c => (
                    <span key={c} onClick={() => setAddProf(p => ({ ...p, curso: c }))}
                      style={{ 
                        background: addProf.curso === c ? (FAC_COLOR[addProf.facultad] || B) : (FAC_BG[addProf.facultad] || BL), 
                        color: addProf.curso === c ? "#fff" : (FAC_COLOR[addProf.facultad] || BD), 
                        padding: "6px 14px", 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 700, 
                        cursor: "pointer", 
                        transition: "all .2s" 
                      }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ borderTop: "2px dashed var(--border-color)", margin: "8px 0", paddingTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ background: `${OR}18`, borderRadius: 12, padding: "8px 12px", fontSize: 20 }}>✍️</div>
              <div>
                <div style={{ fontWeight: 800, color: BD, fontSize: 18 }}>Tu primera reseña</div>
                <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500, marginTop: 2 }}>Obligatorio para agregar al profesor</div>
              </div>
            </div>

            {/* Criterios */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 12, letterSpacing: 0.5 }}>CALIFICA ESTOS CRITERIOS <span style={{ color: OR }}>*</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {CRIT.map(c => (
                <div key={c} className={`crit-box${addProf[c] > 0 ? " active" : ""}`}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>{CRIT_ICON[c]} {CRIT_LABEL[c]}</div>
                  <Stars value={addProf[c]} onChange={v => setAddProf(prev => ({ ...prev, [c]: v }))} size={28} gap={4} />
                  {addProf[c] > 0 && <div style={{ fontSize: 12, color: ratingColor(addProf[c]), fontWeight: 800, marginTop: 6 }}>{ratingLabel(addProf[c])}</div>}
                </div>
              ))}
            </div>

            {/* Facultad y Carrera libres */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 12, letterSpacing: 0.5 }}>TU INFORMACIÓN <span style={{ fontWeight: 500 }}>(opcional)</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🏫 Tu facultad</label>
                <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", appearance: "none" }} value={addProf.facultadAlumno}
                  onChange={e => setAddProf(prev => ({ ...prev, facultadAlumno: e.target.value, carrera: "" }))}>
                  <option value="">Selecciona tu facultad</option>
                  {FACULTADES_FORM.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🎓 Tu carrera</label>
                <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", appearance: "none" }} value={addProf.carrera}
                  onChange={e => {
                    const val = e.target.value;
                    const matchFac = Object.keys(carreras || {}).find(fac => carreras[fac].includes(val));
                    setAddProf(prev => ({ 
                      ...prev, 
                      carrera: val, 
                      ...(matchFac && !prev.facultadAlumno ? { facultadAlumno: matchFac } : {})
                    }));
                  }}
                  disabled={carrerasForm.length === 0}>
                  <option value="">Selecciona tu carrera</option>
                  {carrerasForm.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 700 }}>📅 Tu ciclo actual</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} onClick={() => setAddProf(prev => ({ ...prev, ciclo: prev.ciclo === String(n) ? "" : String(n) }))}
                    style={{ 
                      padding: "8px 16px", borderRadius: 20, border: `1.5px solid`, fontSize: 13, fontWeight: 800, cursor: "pointer", 
                      transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", fontFamily: "inherit", 
                      background: addProf.ciclo === String(n) ? B : "transparent", 
                      color: addProf.ciclo === String(n) ? "#fff" : "var(--text-light)", 
                      borderColor: addProf.ciclo === String(n) ? B : "var(--border-color)" 
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🗓️ Semestre cursado</label>
              <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", appearance: "none" }} value={addProf.semestre || ""}
                onChange={e => setAddProf(prev => ({ ...prev, semestre: e.target.value }))}>
                <option value="">No especificar</option>
                {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Comentario */}
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", marginBottom: 12, letterSpacing: 0.5 }}>TU OPINIÓN <span style={{ color: OR }}>*</span></div>
            <textarea className="textarea" style={{ fontSize: 14, padding: 16 }} value={addProf.texto} onChange={e => { if (e.target.value.length <= 500) setAddProf(prev => ({ ...prev, texto: e.target.value })); }} placeholder="Cuéntales a otros alumnos cómo es este profesor: sus clases, su trato, los exámenes..." maxLength={500} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: addProf.texto.length >= 450 ? "#DC2626" : "var(--text-light)", fontWeight: 600, transition: "color .2s" }}>{addProf.texto.length} / 500</span>
              {addProf.texto.length < 20 && addProf.texto.length > 0 && <span style={{ fontSize: 12, color: OR, fontWeight: 600 }}>Mínimo 20 caracteres</span>}
            </div>
          </div>
          {addProf.nombre && (
            <div style={{ background: "#f7f9fc", borderRadius: 14, padding: "16px 18px", border: "1px dashed #c8d5e8", marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-light)", marginBottom: 10, fontWeight: 700, letterSpacing: 0.5 }}>VISTA PREVIA</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={addProf.nombre} fac={addProf.facultad} size={48} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)" }}>{addProf.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2, fontWeight: 500 }}>{addProf.facultad}{addProf.curso && ` · ${addProf.curso}`}</div>
                </div>
              </div>
            </div>
          )}
          <button className="btn btn-blue" onClick={submitAddProf} style={{ width: "100%", padding: "14px", fontSize: 15, marginTop: 8 }}>Agregar profesor</button>
        </div>
      )}

      {addMode === "curso" && (
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>Buscar profesor existente</label>
            <input className="input" placeholder="Escribe el nombre del profesor..." autoComplete="off"
              value={addProfSel ? addProfSel.nombre : addProf.nombre}
              onChange={e => { setAddProf(p => ({ ...p, nombre: e.target.value })); setAddProfSel(null); }} />
            {!addProfSel && addProf.nombre.length >= 2 && (
              <div style={{ marginTop: 8, border: "1.5px solid var(--border-color)", borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.08)" }}>
                {profesores.filter(p => similarity(p.nombre, addProf.nombre) > 0.3).sort((a, b) => similarity(b.nombre, addProf.nombre) - similarity(a.nombre, addProf.nombre)).slice(0, 6).map((p, i) => (
                  <div key={p.id} onClick={() => setAddProfSel(p)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid #edf1f7" : "none", cursor: "pointer", transition: "background .2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f7f9fc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Avatar name={p.nombre} fac={p.facultad} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.facultad}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 160 }}>
                      {(p.cursos || []).slice(0, 2).map(c => <span key={c} style={{ fontSize: 11, background: "#f3f6fb", padding: "3px 8px", borderRadius: 12, color: "#5a6a80", fontWeight: 500 }}>{c}</span>)}
                      {(p.cursos || []).length > 2 && <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 700 }}>+{p.cursos.length - 2}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {addProfSel && (
            <>
              <div style={{ background: (FAC_BG[addProfSel.facultad] || BL), borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${FAC_COLOR[addProfSel.facultad] || B}30` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <Avatar name={addProfSel.nombre} fac={addProfSel.facultad} size={52} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>{addProfSel.nombre}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, fontWeight: 500 }}>{addProfSel.facultad}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ marginLeft: "auto", fontSize: 12, padding: "6px 12px" }} onClick={() => { setAddProfSel(null); setAddProf(p => ({ ...p, nombre: "" })); }}>✕ Cambiar</button>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>CURSOS ACTUALES</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(addProfSel.cursos || []).map(c => (
                    <span key={c} style={{ background: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 13, color: (FAC_COLOR[addProfSel.facultad] || BD), fontWeight: 700, border: `1px solid ${FAC_COLOR[addProfSel.facultad] || B}30`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>📚 {c}</span>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", display: "block", marginBottom: 8 }}>Nuevo curso a agregar</label>
                <input className="input" value={addCurso} onChange={e => setAddCurso(e.target.value)} placeholder="Ej. Cálculo III" autoComplete="off" />
              </div>
              <button className="btn btn-orange" onClick={submitAgregarCurso} style={{ width: "100%", padding: "14px", fontSize: 15, marginTop: 8 }}>
                Agregar curso a {addProfSel.nombre.split(" ")[0]}
              </button>
            </>
          )}
          {!addProfSel && <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-light)", fontSize: 14, fontWeight: 500 }}>Busca y selecciona un profesor para agregar un curso</div>}
        </div>
      )}
    </div>
  );
};
