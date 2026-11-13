import { useEffect, useMemo, useState } from "react";
import { useNavigate as useRouterNav } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FACULTADES_FORM, FAC_COLOR, FAC_EMOJI, B, OR, CRIT, CRIT_LABEL, CRIT_ICON, SEMESTRES } from "../constants.js";
import { Avatar } from "../components/UI/Avatar.jsx";
import { RatingChip } from "../components/UI/RatingChip.jsx";
import { Stars } from "../components/UI/Stars.jsx";
import { CritBar } from "../components/UI/CritBar.jsx";
import { Divider } from "../components/UI/Divider.jsx";
import { formatFecha, avg, ratingColor, ratingLabel } from "../utils/helpers.js";

const normText = (str) =>
  (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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
  reportadosLocal = {},
  reportarResena,
  formRef,
  recomendarFacultad,
  savedIds = [],
  toggleSaveProf,
  onSelectCourse
}) => {
  const routerNav = useRouterNav();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recFacultad, setRecFacultad] = useState("");
  const [revSearch, setRevSearch] = useState("");
  const [revSort, setRevSort] = useState("recientes");
  const [visibleReviews, setVisibleReviews] = useState(10);

  useEffect(() => {
    setRevSearch("");
    setRevSort("recientes");
    setVisibleReviews(10);
    setShowReviewForm(false);
    setShowRecommend(false);
  }, [selProf?.id]);

  const reviewMetrics = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let recommended = 0;

    allR.forEach((r) => {
      const score = avg(CRIT.map((c) => Number(r.criterios?.[c] || 0)));
      if (score >= 3.5) recommended += 1;
      const bucket = Math.min(5, Math.max(1, Math.round(score)));
      counts[bucket] += 1;
    });

    return {
      counts,
      recommendPct: allR.length > 0 ? Math.round((recommended / allR.length) * 100) : 0,
    };
  }, [allR]);

  const filteredReviews = useMemo(() => {
    const q = normText(revSearch.trim());
    const indexed = allR.map((r, originalIdx) => ({
      ...r,
      _idx: originalIdx,
      _avg: avg(CRIT.map((c) => Number(r.criterios?.[c] || 0))),
    }));

    const matched = q
      ? indexed.filter((r) =>
          normText(`${r.texto || ""} ${r.carrera || ""} ${r.facultadAlumno || ""} ${r.semestre || ""} ciclo ${r.ciclo || ""}`).includes(q)
        )
      : indexed;

    if (revSort === "utiles") {
      return [...matched].sort((a, b) => (b.util || 0) - (a.util || 0) || a._idx - b._idx);
    }
    if (revSort === "rating_desc") {
      return [...matched].sort((a, b) => b._avg - a._avg || a._idx - b._idx);
    }
    if (revSort === "rating_asc") {
      return [...matched].sort((a, b) => a._avg - b._avg || a._idx - b._idx);
    }
    return matched;
  }, [allR, revSearch, revSort]);

  if (!selProf) return null;

  const facColor = FAC_COLOR[selProf.facultad] || B;
  const isSaved = savedIds.includes(selProf.id);

  const availableFaculties = FACULTADES_FORM.filter(
    (f) =>
      !(selProf.facultades || [selProf.facultad]).includes(f) &&
      localStorage.getItem(`rec_fac_${selProf.id}_${f}`) !== "true"
  );

  const getCourseRank = (curso) => {
    if (!profesores || (selProf.totalReseñas || 0) === 0) return null;
    const teaching = profesores.filter((p) => (p.cursos || []).includes(curso) && (p.totalReseñas || 0) > 0);
    teaching.sort((a, b) => b.rating - a.rating);
    const idx = teaching.findIndex((p) => p.id === selProf.id);
    return idx !== -1 && idx < 5 ? idx + 1 : null;
  };

  const shownReviews = filteredReviews.slice(0, visibleReviews);

  return (
    <div className="page-shell" style={{ maxWidth: 840 }}>
      <Helmet>
        <title>{selProf.nombre} | ProfesoresUCSUR</title>
        <meta
          name="description"
          content={`Lee las reseñas de ${selProf.nombre}, profesor de la facultad de ${selProf.facultad} en la Universidad Científica del Sur.`}
        />
      </Helmet>

      {/* Barra superior de acciones */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={() => routerNav(-1)} style={{ fontSize: 13, padding: "9px 16px" }}>
          ← Volver
        </button>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          {toggleSaveProf && (
            <button
              type="button"
              className="btn"
              title="Se guarda localmente en tu navegador (100% anónimo, sin cuenta)"
              onClick={() => toggleSaveProf(selProf.id, selProf.nombre)}
              style={{
                fontSize: 13,
                padding: "9px 15px",
                background: isSaved ? "rgba(232, 119, 34, 0.14)" : "var(--card-bg)",
                color: isSaved ? "var(--primary-orange)" : "var(--text-dark)",
                border: `1.5px solid ${isSaved ? "rgba(232, 119, 34, 0.45)" : "var(--border-color)"}`,
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isSaved ? "Guardado" : "Guardar profe"}
            </button>
          )}

          <button
            className="btn"
            style={{
              fontSize: 13,
              padding: "9px 16px",
              background: "#25D366",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 14px rgba(37, 211, 102, 0.25)",
            }}
            onClick={(e) => {
              e.preventDefault();
              const url = window.location.href;
              const text = `¿Conoces a ${selProf.nombre}? Mira sus reseñas en ProfesoresUCSUR 👇`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Compartir
          </button>
        </div>
      </div>

      {/* Alerta de moderación */}
      {selProf.alerta && (
        <div
          className="card fade-in"
          style={{
            marginBottom: 20,
            padding: 16,
            borderLeft: "5px solid var(--danger-text)",
            borderColor: "var(--danger-border)",
            background: "var(--danger-bg)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--danger-text)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
                Alerta de Moderación
              </div>
              <div style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.5, fontWeight: 500 }}>{selProf.alerta}</div>
            </div>
          </div>
        </div>
      )}

      {/* Card principal del profesor */}
      <div className="card fade-in" style={{ marginBottom: 20, overflow: "hidden", border: `1.5px solid ${facColor}35` }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${facColor}, ${OR})` }} />
        <div
          className="card-pad"
          style={{
            background: `linear-gradient(135deg, ${facColor}16 0%, rgba(232, 119, 34, 0.06) 100%)`,
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 15, flexWrap: "wrap", marginBottom: 16 }}>
            <Avatar name={selProf.nombre} fac={selProf.facultad} size={70} />
            <div style={{ flex: 1, minWidth: 175 }}>
              <h1 style={{ fontSize: "clamp(21px, 3.5vw, 27px)", fontWeight: 800, color: "var(--text-dark)", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 10 }}>
                {selProf.nombre}
              </h1>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {(selProf.facultades || [selProf.facultad]).map((f) => {
                  const fc = FAC_COLOR[f] || B;
                  return (
                    <span
                      key={f}
                      className="pill"
                      style={{
                        background: "var(--card-bg)",
                        color: "var(--text-dark)",
                        border: `1px solid ${fc}45`,
                        fontSize: 12.5,
                        padding: "5px 12px",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: fc }} />
                      {FAC_EMOJI[f] || ""} {f}
                    </span>
                  );
                })}
                {(selProf.sedes || [selProf.sede].filter(Boolean)).map((s) => (
                  <span
                    key={s}
                    className="pill"
                    style={{
                      background: "var(--surface-subtle)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-color)",
                      fontSize: 12.5,
                      padding: "5px 12px",
                    }}
                  >
                    📍 {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cursos dictados (clicables hacia Ranking por curso) */}
          {(selProf.cursos || []).length > 0 && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: selProf.bio ? 14 : 0 }}>
              {selProf.cursos.map((c) => {
                const rank = getCourseRank(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSelectCourse?.(c)}
                    title={onSelectCourse ? `Ver ranking del curso ${c}` : undefined}
                    className="pill"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--text-medium)",
                      fontSize: 12.5,
                      padding: "6px 12px",
                      border: "1px solid var(--border-color)",
                      cursor: onSelectCourse ? "pointer" : "default",
                      fontFamily: "inherit",
                      transition: "border-color 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (onSelectCourse) {
                        e.currentTarget.style.borderColor = "var(--primary-blue)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <span>📚 {c}</span>
                    {rank && (
                      <span
                        className="tabular-nums"
                        style={{
                          color: rank === 1 ? "#d97706" : rank === 2 ? "#64748b" : rank === 3 ? "#b45309" : "var(--primary-blue)",
                          fontWeight: 800,
                          marginLeft: 2,
                        }}
                      >
                        Top #{rank}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selProf.bio && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 10 }}>{selProf.bio}</p>
          )}

          {/* Acciones colaborativas */}
          <div style={{ marginTop: 16 }}>
            {!showRecommend ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("agregar", selProf)}
                  style={{ fontSize: 13, padding: "8px 15px", background: "var(--card-bg)" }}
                >
                  ➕ Añadir o sugerir curso
                </button>
                {availableFaculties.length > 0 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowRecommend(true)}
                    style={{
                      fontSize: 13,
                      padding: "8px 15px",
                      background: "var(--light-blue)",
                      color: "var(--primary-blue)",
                      border: "1px solid rgba(59, 130, 246, 0.28)",
                    }}
                  >
                    💡 Sugerir otra facultad
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                  background: "var(--card-bg)",
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1.5px solid var(--primary-blue)",
                }}
              >
                <select
                  className="input"
                  style={{ padding: "9px 12px", fontSize: 13.5, flex: 1, minWidth: 170 }}
                  value={recFacultad}
                  onChange={(e) => setRecFacultad(e.target.value)}
                >
                  <option value="">Seleccionar otra facultad...</option>
                  {availableFaculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-blue"
                  disabled={!recFacultad}
                  style={{ padding: "9px 16px", fontSize: 13.5 }}
                  onClick={() => {
                    recomendarFacultad(selProf.id, recFacultad);
                    setRecFacultad("");
                    setShowRecommend(false);
                  }}
                >
                  Enviar sugerencia
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "9px 12px", fontSize: 13.5 }}
                  onClick={() => setShowRecommend(false)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel de métricas en 2 columnas */}
        <div style={{ padding: "22px 26px 26px" }}>
          <div className="perfil-metrics-grid">
            {/* Columna izquierda: Score global */}
            <div
              style={{
                background: "var(--surface-subtle)",
                borderRadius: 18,
                padding: "18px 16px",
                border: "1px solid var(--border-color)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <RatingChip r={globalRating} large />
              <Stars value={globalRating} size={17} gap={3} />
              <div className="tabular-nums" style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 700 }}>
                {allR.length} {allR.length === 1 ? "reseña" : "reseñas"}
              </div>
              {allR.length > 0 && (
                <div
                  className="pill tabular-nums"
                  style={{
                    marginTop: 2,
                    background:
                      reviewMetrics.recommendPct >= 70
                        ? "rgba(16, 185, 129, 0.14)"
                        : reviewMetrics.recommendPct >= 45
                        ? "rgba(245, 158, 11, 0.14)"
                        : "var(--danger-bg)",
                    color:
                      reviewMetrics.recommendPct >= 70
                        ? "#10b981"
                        : reviewMetrics.recommendPct >= 45
                        ? "#f59e0b"
                        : "var(--danger-text)",
                    fontSize: 11.5,
                    padding: "4px 10px",
                  }}
                >
                  👍 {reviewMetrics.recommendPct}% lo recomienda
                </div>
              )}
            </div>

            {/* Columna derecha: Barras por criterio + distribución */}
            <div>
              {CRIT.map((c, i) => (
                <CritBar key={c} label={CRIT_LABEL[c]} icon={CRIT_ICON[c]} value={critAvg[c]} delay={i * 0.05} />
              ))}

              {allR.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px dashed var(--border-color)",
                    display: "grid",
                    gap: 5,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 }}>
                    Distribución de notas
                  </div>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewMetrics.counts[star];
                    const pct = Math.round((count / allR.length) * 100);
                    return (
                      <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", width: 26 }}>
                          {star}★
                        </span>
                        <div style={{ flex: 1, height: 6, background: "var(--surface-subtle)", borderRadius: 99, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              borderRadius: 99,
                              background: star >= 4 ? "#10b981" : star === 3 ? "#f59e0b" : "#ef4444",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", width: 28, textAlign: "right" }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner: dejar reseña */}
      <div
        style={{
          backgroundColor: OR,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.065) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.065) 1px, transparent 1px), linear-gradient(135deg, ${OR}, #d96518)`,
          backgroundSize: "26px 26px, 26px 26px, 100% 100%",
          borderRadius: 20,
          padding: "20px 24px",
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 10px 30px rgba(232,119,34,.32)",
          cursor: "pointer",
          transition: "transform .2s, box-shadow .2s",
          flexWrap: "wrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 14px 36px rgba(232,119,34,.42)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(232,119,34,.32)";
        }}
        onClick={() => {
          setShowReviewForm((prev) => !prev);
          setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          ✍️
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16.5, marginBottom: 3 }}>
            ¿Tuviste a {selProf.nombre.split(" ")[0]}?
          </div>
          <div style={{ color: "rgba(255,255,255,.9)", fontSize: 13, fontWeight: 500 }}>
            Deja tu reseña 100% anónima y ayuda a otros alumnos en su matrícula.
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            color: "#c95c0c",
            borderRadius: 12,
            padding: "10px 18px",
            fontWeight: 800,
            fontSize: 13.5,
            flexShrink: 0,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {showReviewForm ? "Cerrar ✕" : "Calificar ↓"}
        </div>
      </div>

      {/* Formulario de reseña */}
      {showReviewForm && (
        <div ref={formRef} className="card fade-in" style={{ padding: 26, marginBottom: 24, border: `2px solid ${OR}45`, boxShadow: `0 10px 32px ${OR}18` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ background: `${OR}18`, borderRadius: 12, padding: "8px 12px", fontSize: 20 }}>✍️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "var(--heading-blue)", fontSize: 18 }}>Dejar una reseña anónima</div>
              <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 500, marginTop: 2 }}>
                🔒 Sin nombre, sin cuenta, 100% privado
              </div>
            </div>
          </div>

          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* SECCIÓN 1: CRITERIOS */}
            <div style={{ background: "var(--surface-subtle)", padding: 18, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: OR, color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>
                  1
                </span>
                CALIFICA ESTOS CRITERIOS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                {CRIT.map((c) => (
                  <div key={c} className={`crit-box${form[c] > 0 ? " active" : ""}`} style={{ background: "var(--card-bg)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>
                      {CRIT_ICON[c]} {CRIT_LABEL[c]}
                    </div>
                    <Stars value={form[c]} onChange={(v) => setForm((prev) => ({ ...prev, [c]: v }))} size={24} gap={4} />
                    {form[c] > 0 && (
                      <div style={{ fontSize: 12, color: ratingColor(form[c]), fontWeight: 800, marginTop: 6 }}>
                        {ratingLabel(form[c])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN */}
            <div style={{ background: "var(--surface-subtle)", padding: 18, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "var(--text-light)", color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>
                  2
                </span>
                TU INFORMACIÓN <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>(opcional)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🏫 Tu facultad</label>
                  <select
                    className="input"
                    style={{ padding: "11px 14px", fontSize: 14, cursor: "pointer" }}
                    value={form.facultadAlumno}
                    onChange={(e) => setForm((prev) => ({ ...prev, facultadAlumno: e.target.value, carrera: "" }))}
                  >
                    <option value="">Selecciona tu facultad</option>
                    {FACULTADES_FORM.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🎓 Tu carrera</label>
                  <select
                    className="input"
                    style={{ padding: "11px 14px", fontSize: 14, cursor: "pointer" }}
                    value={form.carrera}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchFac = Object.keys(carreras || {}).find((fac) => carreras[fac].includes(val));
                      setForm((prev) => ({
                        ...prev,
                        carrera: val,
                        ...(matchFac && !prev.facultadAlumno ? { facultadAlumno: matchFac } : {}),
                      }));
                    }}
                    disabled={carrerasForm.length === 0}
                  >
                    <option value="">Selecciona tu carrera</option>
                    {carrerasForm.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8, fontWeight: 700 }}>📅 Ciclo cursado</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setForm((prev) => ({ ...prev, ciclo: prev.ciclo === String(n) ? "" : String(n) }))}
                      style={{
                        padding: "7px 15px",
                        borderRadius: 20,
                        border: "1.5px solid",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: form.ciclo === String(n) ? B : "var(--card-bg)",
                        color: form.ciclo === String(n) ? "#fff" : "var(--text-light)",
                        borderColor: form.ciclo === String(n) ? B : "var(--border-color)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 700 }}>🗓️ Semestre cursado</label>
                <select
                  className="input"
                  style={{ padding: "11px 14px", fontSize: 14, cursor: "pointer" }}
                  value={form.semestre || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, semestre: e.target.value }))}
                >
                  <option value="">No especificar</option>
                  {SEMESTRES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECCIÓN 3: OPINIÓN */}
            <div style={{ background: "var(--surface-subtle)", padding: 18, borderRadius: 16, border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", marginBottom: 14, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: OR, color: "#fff", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12 }}>
                  3
                </span>
                TU OPINIÓN
              </div>
              <textarea
                className="textarea"
                style={{ fontSize: 14, padding: 16, minHeight: 120 }}
                value={form.texto}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setForm((prev) => ({ ...prev, texto: e.target.value }));
                }}
                placeholder="Cuéntales a otros alumnos cómo es este profesor: sus clases, su trato, los exámenes..."
                maxLength={500}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span className="tabular-nums" style={{ fontSize: 12, color: form.texto.length >= 450 ? "var(--danger-text)" : "var(--text-light)", fontWeight: 600 }}>
                  {form.texto.length} / 500
                </span>
                {form.texto.length < 20 && form.texto.length > 0 && (
                  <span style={{ fontSize: 12, color: "var(--primary-orange)", fontWeight: 600 }}>Mínimo 20 caracteres</span>
                )}
              </div>
            </div>

            {formErr && (
              <div
                style={{
                  color: "var(--danger-text)",
                  fontSize: 13,
                  background: "var(--danger-bg)",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--danger-border)",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {formErr}
              </div>
            )}

            <button
              className="btn-cta"
              onClick={() => {
                if (CRIT.some((c) => form[c] === 0)) {
                  setFormErr("Califica todos los criterios primero.");
                  return;
                }
                if (form.texto.length < 20) {
                  setFormErr("Escribe al menos 20 caracteres en tu opinión.");
                  return;
                }
                setFormErr("");
                submitResena();
                setShowReviewForm(false);
              }}
              style={{ width: "100%", fontSize: 16, padding: 16, marginTop: 4 }}
            >
              🔒 Publicar reseña anónima
            </button>
          </div>
        </div>
      )}

      {/* Encabezado y controles de reseñas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--heading-blue)" }}>
          Reseñas ({filteredReviews.length}
          {filteredReviews.length !== allR.length ? ` de ${allR.length}` : ""})
        </h2>

        {allR.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flex: "1 1 300px", justifyContent: "flex-end" }}>
            <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 260 }}>
              <input
                className="input"
                value={revSearch}
                onChange={(e) => {
                  setRevSearch(e.target.value);
                  setVisibleReviews(10);
                }}
                placeholder="Buscar en reseñas..."
                style={{ padding: "8px 30px 8px 12px", fontSize: 13, borderRadius: 10 }}
              />
              {revSearch && (
                <button
                  type="button"
                  onClick={() => setRevSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "var(--text-light)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <select
              className="input"
              value={revSort}
              onChange={(e) => setRevSort(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: "pointer" }}
            >
              <option value="recientes">🕒 Más recientes</option>
              <option value="utiles">👍 Más útiles</option>
              <option value="rating_desc">⭐ Mejor puntaje</option>
              <option value="rating_asc">📉 Menor puntaje</option>
            </select>
          </div>
        )}
      </div>

      {allR.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 50, marginBottom: 14 }}>📝</div>
          <div style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 20, fontWeight: 500 }}>
            ¡Sé el primero en dejar una reseña para este profesor!
          </div>
          <button
            className="btn-cta"
            style={{ fontSize: 14, padding: "12px 24px" }}
            onClick={() => {
              setShowReviewForm(true);
              setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }}
          >
            ✍️ Dejar la primera reseña
          </button>
        </div>
      )}

      {allR.length > 0 && filteredReviews.length === 0 && (
        <div className="card" style={{ padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔎</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>
            No hay reseñas que coincidan con “{revSearch}”.
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }} onClick={() => setRevSearch("")}>
            Limpiar búsqueda
          </button>
        </div>
      )}

      {shownReviews.map((r, idx) => {
        const rAvg = r._avg;
        const yaReportada = !!reportadosLocal[r.id] || reportes.some((x) => x.resId === r.id);
        return (
          <div key={r.id} className="card fade-in" style={{ padding: "20px 22px", marginBottom: 14, animationDelay: `${Math.min(idx, 6) * 0.04}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 13,
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🎓
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-dark)" }}>
                    Estudiante anónimo
                    {r.facultadAlumno && (
                      <span style={{ fontWeight: 600, color: "var(--text-light)", fontSize: 12 }}>
                        {" "}
                        · {r.facultadAlumno.replace("Ciencias de la ", "").replace("Ciencias ", "")}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <span className="pill" style={{ background: "var(--surface-subtle)", border: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", padding: "3px 8px" }}>
                      🕐 {formatFecha(r.createdAt)}
                    </span>
                    {r.carrera && (
                      <span className="pill" style={{ background: "var(--surface-subtle)", border: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", padding: "3px 8px" }}>
                        🎓 {r.carrera}
                      </span>
                    )}
                    {r.ciclo && (
                      <span className="pill" style={{ background: "var(--surface-subtle)", border: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", padding: "3px 8px" }}>
                        📅 Ciclo {r.ciclo}
                      </span>
                    )}
                    {r.semestre && (
                      <span className="pill" style={{ background: "var(--surface-subtle)", border: "1px solid var(--border-color)", fontSize: 11, color: "var(--text-muted)", padding: "3px 8px" }}>
                        🗓️ {r.semestre}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <RatingChip r={rAvg} />
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {CRIT.map((c) => (
                <span
                  key={c}
                  className="tabular-nums"
                  style={{
                    background: "var(--surface-subtle)",
                    borderRadius: 9,
                    padding: "4px 10px",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {CRIT_ICON[c]} {CRIT_LABEL[c]}: <strong style={{ color: ratingColor(r.criterios?.[c] || 0) }}>{r.criterios?.[c] || 0}</strong>
                </span>
              ))}
            </div>

            <p style={{ fontSize: 15, color: "var(--text-dark)", lineHeight: 1.72, whiteSpace: "pre-line" }}>{r.texto}</p>

            <Divider />

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: "var(--text-light)", fontWeight: 600 }}>¿Te fue útil?</span>
              {(() => {
                const voto = votados[r.id];
                const yaVoto = !!voto;
                return (
                  <>
                    <button
                      className="util-btn tabular-nums"
                      onClick={(e) => {
                        e.currentTarget.classList.add("pop-animation");
                        const btn = e.currentTarget;
                        setTimeout(() => btn.classList.remove("pop-animation"), 300);
                        toggleUtil(selProf.id, r.id, "util");
                      }}
                      disabled={yaVoto}
                      style={voto === "util" ? { background: "var(--light-blue)", borderColor: B, color: B, cursor: "default" } : yaVoto ? { opacity: 0.45, cursor: "not-allowed" } : {}}
                    >
                      👍 {r.util || 0}
                      {voto === "util" && <span style={{ fontSize: 11, fontWeight: 800 }}> ✓</span>}
                    </button>
                    <button
                      className="util-btn tabular-nums"
                      onClick={(e) => {
                        e.currentTarget.classList.add("pop-animation");
                        const btn = e.currentTarget;
                        setTimeout(() => btn.classList.remove("pop-animation"), 300);
                        toggleUtil(selProf.id, r.id, "noUtil");
                      }}
                      disabled={yaVoto}
                      style={
                        voto === "noUtil"
                          ? { background: "var(--danger-bg)", borderColor: "var(--danger-border)", color: "var(--danger-text)", cursor: "default" }
                          : yaVoto
                          ? { opacity: 0.45, cursor: "not-allowed" }
                          : {}
                      }
                    >
                      👎 {r.noUtil || 0}
                      {voto === "noUtil" && <span style={{ fontSize: 11, fontWeight: 800 }}> ✓</span>}
                    </button>
                  </>
                );
              })()}
              <button
                className="util-btn"
                onClick={() => reportarResena(selProf.id, r.id, r.texto, selProf.nombre)}
                style={{
                  marginLeft: "auto",
                  color: "var(--danger-text)",
                  borderColor: "var(--danger-border)",
                  opacity: yaReportada ? 0.55 : 1,
                  background: yaReportada ? "var(--danger-bg)" : "transparent",
                }}
                disabled={yaReportada}
              >
                🚨 {yaReportada ? "Reportada" : "Reportar"}
              </button>
            </div>
          </div>
        );
      })}

      {visibleReviews < filteredReviews.length && (
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <button className="btn btn-blue" style={{ padding: "12px 26px", fontSize: 14, borderRadius: 999 }} onClick={() => setVisibleReviews((v) => v + 10)}>
            ⬇️ Mostrar más reseñas ({filteredReviews.length - visibleReviews} restantes)
          </button>
        </div>
      )}
    </div>
  );
};
