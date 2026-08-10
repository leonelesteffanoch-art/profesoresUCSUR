import { useState } from "react";
import { useNavigate as useRouterNav } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FACULTADES_FORM, FAC_COLOR, FAC_BG, FAC_EMOJI, B, BD, OR, BL, CRIT, CRIT_LABEL, CRIT_ICON, SEMESTRES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { CritBar } from "../components/UI/CritBar.jsx";
import { Divider } from "../components/UI/Divider.jsx";
import { formatFecha, avg, ratingColor, ratingLabel } from "../utils/helpers.js";

export const Perfil = ({
  profesores,
  selProf,
  navigate,
  allR,
  globalRating,
  critAvg,
  form, setForm,
  formErr, setFormErr,
  submitResena,
  carrerasForm,
  carreras,
  votados,
  toggleUtil,
  reportes,
  reportarResena,
  formRef,
  recomendarFacultad
}) => {
  const routerNav = useRouterNav();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recFacultad, setRecFacultad] = useState("");
  if (!selProf) return null;

  const hasRecommended = localStorage.getItem(`rec_fac_${selProf.id}`) === "true";

  const getCourseRank = (curso) => {
    if (!profesores || (selProf.totalReseñas || 0) === 0) return null;
    const teaching = profesores.filter(p => (p.cursos || []).includes(curso) && (p.totalReseñas || 0) > 0);
    teaching.sort((a, b) => b.rating - a.rating);
    const idx = teaching.findIndex(p => p.id === selProf.id);
    return (idx !== -1 && idx < 5) ? idx + 1 : null;
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px 64px" }}>
      <Helmet>
        <title>{selProf.nombre} | ProfesoresUCSUR</title>
        <meta name="description" content={`Lee las reseñas de ${selProf.nombre}, profesor de la facultad de ${selProf.facultad} en la Universidad Científica del Sur.`} />
      </Helmet>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => routerNav(-1)} style={{ fontSize: 13, padding: "8px 16px" }}>← Volver</button>
        <button className="btn" style={{ fontSize: 13, padding: "8px 16px", background: "#25D366", color: "#fff", display: "flex", alignItems: "center", gap: 8, border: "none" }}
          onClick={(e) => { 
            e.preventDefault();
            const url = window.location.href; 
            const text = `¿Conoces a ${selProf.nombre}? Mira sus reseñas en ProfesoresUCSUR 👇`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Compartir por WhatsApp
        </button>
      </div>

      {/* Alerta de moderación */}
      {selProf.alerta && (
        <div className="card fade-in" style={{ marginBottom: 20, padding: 16, borderLeft: "5px solid #DC2626", background: "#fef2f2" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#DC2626", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Alerta de Moderación</div>
              <div style={{ fontSize: 14, color: "#991b1b", lineHeight: 1.5, fontWeight: 500 }}>{selProf.alerta}</div>
            </div>
          </div>
        </div>
      )}

      {/* Card del profe */}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden", border: `1.5px solid ${FAC_COLOR[selProf.facultad] || B}30` }}>
        <div style={{ background: `linear-gradient(135deg, ${FAC_COLOR[selProf.facultad] || BD}15, ${OR}08)`, padding: "28px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16 }}>
            <Avatar name={selProf.nombre} fac={selProf.facultad} size={84} />
            <div style={{ textAlign: "center", background: "var(--card-bg)", borderRadius: 20, padding: "16px 24px", border: "1px solid var(--border-color)", boxShadow: "0 8px 24px rgba(0,0,0,.06)" }}>
              <RatingChip r={globalRating} large />
              <div style={{ marginTop: 8 }}><Stars value={globalRating} size={16} gap={2} /></div>
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8, fontWeight: 700 }}>{allR.length} reseñas</div>
            </div>
          </div>
          
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-dark)", marginBottom: 12, lineHeight: 1.2 }}>{selProf.nombre}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(selProf.facultades || [selProf.facultad]).map(f => (
                <span key={f} className="pill" style={{ background: FAC_BG[f] || BL, color: FAC_COLOR[f] || BD, fontSize: 13, padding: "6px 14px" }}>
                  {FAC_EMOJI[f] || ""} {f}
                </span>
              ))}
              {(selProf.sedes || [selProf.sede].filter(Boolean)).map(s => (
                <span key={s} className="pill" style={{ background: "var(--border-color)", color: "var(--text-muted)", fontSize: 13, padding: "6px 14px" }}>📍 Sede {s}</span>
              ))}
              {(selProf.cursos || []).map(c => {
                const rank = getCourseRank(c);
                return (
                  <span key={c} className="pill" style={{ background: "#f3f6fb", color: "#5a6a80", fontSize: 13, padding: "6px 14px" }}>
                    📚 {c} 
                    {rank && <span style={{ color: rank === 1 ? "#d97706" : rank === 2 ? "#64748b" : rank === 3 ? "#92400e" : B, fontWeight: 800, marginLeft: 4 }} title={`Top #${rank} en ${c}`}>#{rank}</span>}
                  </span>
                );
              })}
            </div>
            {selProf.bio && <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{selProf.bio}</p>}
            
            {!hasRecommended && (
              <div style={{ marginTop: 16 }}>
                {!showRecommend ? (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => setShowRecommend(true)} style={{ fontSize: 14, padding: "10px 20px", background: "var(--primary-blue)", color: "#fff", fontWeight: 800, borderRadius: 12, boxShadow: "0 6px 16px rgba(59, 130, 246, 0.3)", border: "none", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      💡 Sugerir para otra facultad
                    </button>
                    <button className="btn" onClick={() => navigate("agregar", selProf)} style={{ fontSize: 14, padding: "10px 20px", background: "var(--card-bg)", color: "var(--text-dark)", fontWeight: 800, borderRadius: 12, border: "2px solid var(--border-color)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary-blue)"; e.currentTarget.style.color = "var(--primary-blue)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-dark)"; }}>
                      ➕ Añadir un curso
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "var(--card-bg)", padding: "12px", borderRadius: 16, border: "2px solid var(--primary-blue)" }}>
                    <select className="input" style={{ padding: "10px 14px", fontSize: 14, flex: 1, minWidth: 150 }} value={recFacultad} onChange={e => setRecFacultad(e.target.value)}>
                      <option value="">Seleccionar facultad...</option>
                      {FACULTADES_FORM.filter(f => !(selProf.facultades || [selProf.facultad]).includes(f)).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <button className="btn" disabled={!recFacultad} style={{ padding: "10px 20px", fontSize: 14, background: "var(--primary-blue)", color: "#fff", fontWeight: 800, borderRadius: 12, border: "none" }} onClick={() => {
                      recomendarFacultad(selProf.id, recFacultad);
                      setShowRecommend(false);
                    }}>Enviar</button>
                    <button className="btn btn-ghost" style={{ padding: "10px", fontSize: 14, color: "var(--text-light)" }} onClick={() => setShowRecommend(false)}>✕</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <Divider />
        <div style={{ padding: "0 28px 24px" }}>
          {CRIT.map((c, i) => <CritBar key={c} label={CRIT_LABEL[c]} icon={CRIT_ICON[c]} value={critAvg[c]} delay={i * .05} />)}
        </div>
      </div>

      {/* CTA Banner: dejar reseña */}
      <div style={{ background: `linear-gradient(135deg, ${OR}, #f09040)`, borderRadius: 20, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 18, boxShadow: "0 8px 32px rgba(232,119,34,.35)", cursor: "pointer", transition: "transform .2s", flexWrap: "wrap" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        onClick={() => {
          setShowReviewForm(prev => !prev);
          setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }}>
        <div style={{ fontSize: 32 }}>✍️</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>¿Tuviste a {selProf.nombre.split(" ")[0]}?</div>
          <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 500 }}>Deja tu reseña anónima y ayuda a otros estudiantes.</div>
        </div>
        <div style={{ background: "rgba(255,255,255,.25)", borderRadius: 12, padding: "10px 18px", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0, width: "100%", textAlign: "center", maxWidth: 120 }}>
          {showReviewForm ? "Cerrar ✕" : "Calificar ↓"}
        </div>
      </div>

      {/* Formulario de reseña */}
      {showReviewForm && (
      <div ref={formRef} className="card fade-in" style={{ padding: 28, marginBottom: 20, border: `2px solid ${OR}40`, boxShadow: `0 8px 32px ${OR}15` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ background: `${OR}18`, borderRadius: 12, padding: "8px 12px", fontSize: 20 }}>✍️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: BD, fontSize: 18 }}>Dejar una reseña anónima</div>
            <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500, marginTop: 2 }}>🔒 Sin nombre, sin cuenta, 100% privado</div>
          </div>
        </div>

        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* SECCIÓN 1: CRITERIOS */}
          <div style={{ background: "var(--ghost-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: OR, color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>1</span>
              CALIFICA ESTOS CRITERIOS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              {CRIT.map(c => (
                <div key={c} className={`crit-box${form[c] > 0 ? " active" : ""}`} style={{ background: "var(--card-bg)" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>{CRIT_ICON[c]} {CRIT_LABEL[c]}</div>
                  <Stars value={form[c]} onChange={v => setForm(prev => ({ ...prev, [c]: v }))} size={24} gap={4} />
                  {form[c] > 0 && <div style={{ fontSize: 12, color: ratingColor(form[c]), fontWeight: 800, marginTop: 6 }}>{ratingLabel(form[c])}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 2: INFORMACIÓN */}
          <div style={{ background: "var(--ghost-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--text-light)", color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>2</span>
              TU INFORMACIÓN <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>(opcional)</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🏫 Tu facultad</label>
                <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", background: "var(--card-bg)" }} value={form.facultadAlumno}
                  onChange={e => setForm(prev => ({ ...prev, facultadAlumno: e.target.value, carrera: "" }))}>
                  <option value="">Selecciona tu facultad</option>
                  {FACULTADES_FORM.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🎓 Tu carrera</label>
                <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", background: "var(--card-bg)" }} value={form.carrera}
                  onChange={e => {
                    const val = e.target.value;
                    const matchFac = Object.keys(carreras || {}).find(fac => carreras[fac].includes(val));
                    setForm(prev => ({ 
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
              <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 700 }}>📅 Ciclo cursado</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} onClick={() => setForm(prev => ({ ...prev, ciclo: prev.ciclo === String(n) ? "" : String(n) }))}
                    style={{ 
                      padding: "8px 16px", borderRadius: 20, border: `1.5px solid`, fontSize: 13, fontWeight: 800, cursor: "pointer", 
                      transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)", background: form.ciclo === String(n) ? B : "var(--card-bg)", 
                      color: form.ciclo === String(n) ? "#fff" : "var(--text-light)", borderColor: form.ciclo === String(n) ? B : "var(--border-color)" 
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🗓️ Semestre cursado</label>
              <select className="input" style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", appearance: "none", background: "var(--card-bg)" }} value={form.semestre || ""}
                onChange={e => setForm(prev => ({ ...prev, semestre: e.target.value }))}>
                <option value="">No especificar</option>
                {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN 3: OPINIÓN */}
          <div style={{ background: "var(--ghost-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 16, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: OR, color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>3</span>
              TU OPINIÓN
            </div>
            <textarea className="textarea" style={{ fontSize: 14, padding: 16, background: "var(--card-bg)", minHeight: 120 }} value={form.texto} onChange={e => { if (e.target.value.length <= 500) setForm(prev => ({ ...prev, texto: e.target.value })); }} placeholder="Cuéntales a otros alumnos cómo es este profesor: sus clases, su trato, los exámenes..." maxLength={500} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: form.texto.length >= 450 ? "#DC2626" : "var(--text-light)", fontWeight: 600, transition: "color .2s" }}>{form.texto.length} / 500</span>
              {form.texto.length < 20 && form.texto.length > 0 && <span style={{ fontSize: 12, color: OR, fontWeight: 600 }}>Mínimo 20 caracteres</span>}
            </div>
          </div>

          {formErr && <div style={{ color: "#DC2626", fontSize: 13, background: "#fef2f2", padding: "12px 16px", borderRadius: 12, border: "1px solid #fecaca", fontWeight: 600, textAlign: "center" }}>{formErr}</div>}
          
          <button className="btn-cta" onClick={() => {
            if (CRIT.some(c => form[c] === 0)) { setFormErr("Califica todos los criterios primero."); return; }
            if (form.texto.length < 20) { setFormErr("Escribe al menos 20 caracteres en tu opinión."); return; }
            setFormErr("");
            submitResena();
            setShowReviewForm(false);
          }} style={{ width: "100%", fontSize: 16, padding: 18, marginTop: 8 }}>
            🔒 Publicar reseña anónima
          </button>
        </div>
      </div>
      )}

      {/* Reseñas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: BD }}>Reseñas ({allR.length})</h3>
        {allR.length > 0 && <span style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 600 }}>Más recientes primero</span>}
      </div>
      
      {allR.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📝</div>
          <div style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 20, fontWeight: 500 }}>¡Sé el primero en dejar una reseña!</div>
          <button className="btn-cta" style={{ fontSize: 14, padding: "12px 24px" }} onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
            ✍️ Dejar la primera reseña
          </button>
        </div>
      )}
      
      {allR.map((r, idx) => {
        const rAvg = avg(CRIT.map(c => r.criterios[c]));
        return (
          <div key={r.id} className="card fade-in" style={{ padding: "20px 24px", marginBottom: 14, animationDelay: `${idx * .05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#edf1f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, marginTop: 2 }}>🎓</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark)" }}>
                    Estudiante anónimo
                    {r.facultadAlumno && <span style={{ fontWeight: 600, color: "var(--text-light)", fontSize: 12 }}> · {r.facultadAlumno.replace("Ciencias de la ", "").replace("Ciencias ", "")}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <span style={{ padding: "3px 8px", background: "var(--ghost-bg)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>🕐 {formatFecha(r.createdAt)}</span>
                    {r.carrera && <span style={{ padding: "3px 8px", background: "var(--ghost-bg)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>🎓 {r.carrera}</span>}
                    {r.ciclo && <span style={{ padding: "3px 8px", background: "var(--ghost-bg)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>📅 Ciclo {r.ciclo}</span>}
                    {r.semestre && <span style={{ padding: "3px 8px", background: "var(--ghost-bg)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>🗓️ {r.semestre}</span>}
                  </div>
                </div>
              </div>
              <span style={{ background: `${ratingColor(rAvg)}18`, color: ratingColor(rAvg), fontWeight: 800, fontSize: 15, padding: "6px 14px", borderRadius: 12 }}>★ {rAvg.toFixed(1)}</span>
            </div>
            
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {CRIT.map(c => <span key={c} style={{ background: "var(--card-bg-alt, #f3f6fb)", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "var(--text-muted, #5a6a80)", fontWeight: 600, border: "1px solid var(--border-color)" }}>{CRIT_ICON[c]} {CRIT_LABEL[c]}: <strong style={{ color: ratingColor(r.criterios[c]) }}>{r.criterios[c]}</strong></span>)}
            </div>
            
            <p style={{ fontSize: 15, color: "var(--text-dark)", lineHeight: 1.75 }}>{r.texto}</p>
            
            <Divider />
            
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 600 }}>¿Te fue útil?</span>
              {(() => {
                const voto = votados[r.id];
                const yaVoto = !!voto;
                return (<>
                  <button className="util-btn" onClick={(e) => {
                      e.currentTarget.classList.add("pop-animation");
                      const btn = e.currentTarget;
                      setTimeout(() => btn.classList.remove("pop-animation"), 300);
                      toggleUtil(selProf.id, r.id, "util");
                    }}
                    disabled={yaVoto}
                    style={voto === "util" ? { background: "var(--light-blue)", borderColor: B, color: B, cursor: "default" } : yaVoto ? { opacity: 0.45, cursor: "not-allowed" } : {}}>
                    👍 {r.util || 0}{voto === "util" && <span style={{ fontSize: 11, fontWeight: 800 }}> ✓</span>}
                  </button>
                  <button className="util-btn" onClick={(e) => {
                      e.currentTarget.classList.add("pop-animation");
                      const btn = e.currentTarget;
                      setTimeout(() => btn.classList.remove("pop-animation"), 300);
                      toggleUtil(selProf.id, r.id, "noUtil");
                    }}
                    disabled={yaVoto}
                    style={voto === "noUtil" ? { background: "#fef2f2", borderColor: "#DC2626", color: "#DC2626", cursor: "default" } : yaVoto ? { opacity: 0.45, cursor: "not-allowed" } : {}}>
                    👎 {r.noUtil || 0}{voto === "noUtil" && <span style={{ fontSize: 11, fontWeight: 800 }}> ✓</span>}
                  </button>
                </>);
              })()}
              <button className="util-btn" onClick={() => reportarResena(selProf.id, r.id, r.texto, selProf.nombre)}
                style={{ marginLeft: "auto", color: "#DC2626", borderColor: "#fecaca", opacity: reportes.some(x => x.resId === r.id) ? 0.5 : 1, background: reportes.some(x => x.resId === r.id) ? "#fef2f2" : "transparent" }}
                disabled={reportes.some(x => x.resId === r.id)}>
                🚨 {reportes.some(x => x.resId === r.id) ? "Reportada" : "Reportar"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
