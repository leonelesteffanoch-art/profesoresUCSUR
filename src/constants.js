export const B = "#1560AA", BD = "#0C447C", BL = "#deeaf8", OR = "#E87722";

export const FAC_COLOR = {
  "Ciencias de la Arquitectura": "#B45309", "Ciencias Biológicas": "#059669",
  "Ciencias de la Comunicación y Creatividad": "#9333EA", "Ciencias Empresariales": "#0891B2",
  "Ciencias de la Ingenieria": "#1560AA", "Ciencias de la Salud": "#E87722",
  "Ciencias Políticas y Derecho": "#7C3AED", "Ciencias de la Educación": "#DB2777",
};

export const FAC_BG = {
  "Ciencias de la Arquitectura": "#fef3c7", "Ciencias Biológicas": "#d1fae5",
  "Ciencias de la Comunicación y Creatividad": "#f3e8ff", "Ciencias Empresariales": "#e0f2fe",
  "Ciencias de la Ingenieria": "#deeaf8", "Ciencias de la Salud": "#fff3e0",
  "Ciencias Políticas y Derecho": "#ede9fe", "Ciencias de la Educación": "#fce7f3",
};

export const FAC_EMOJI = {
  "Ciencias de la Arquitectura": "🏛️", "Ciencias Biológicas": "🔬",
  "Ciencias de la Comunicación y Creatividad": "🎨", "Ciencias Empresariales": "📊",
  "Ciencias de la Ingenieria": "⚙️", "Ciencias de la Salud": "🩺",
  "Ciencias Políticas y Derecho": "⚖️", "Ciencias de la Educación": "📚",
};

export const FACULTADES = ["Todas", "Ciencias de la Arquitectura", "Ciencias Biológicas", "Ciencias de la Comunicación y Creatividad", "Ciencias Empresariales", "Ciencias de la Ingenieria", "Ciencias de la Salud", "Ciencias Políticas y Derecho", "Ciencias de la Educación"];
export const FACULTADES_FORM = FACULTADES.filter(f => f !== "Todas");

export const SEMESTRES = ["2026-1", "2025-2", "2025-1", "2024-2", "2024-1", "2023-2", "2023-1", "2022-2", "2022-1", "Anterior"];

export const CRIT = ["claridad", "puntualidad", "trato", "examenes"];
export const CRIT_LABEL = { claridad: "Claridad", puntualidad: "Puntualidad", trato: "Trato", examenes: "Exámenes" };
export const CRIT_ICON = { claridad: "💡", puntualidad: "⏰", trato: "🤝", examenes: "📝" };

export const FORM_EMPTY = { texto: "", claridad: 0, puntualidad: 0, trato: 0, examenes: 0, facultadAlumno: "", carrera: "", ciclo: "", semestre: "" };
export const ADD_EMPTY = { nombre: "", facultad: "Ciencias de la Ingenieria", curso: "", ...FORM_EMPTY };

export const FRASES_INICIO = [
  "Opiniones reales de estudiantes de la Científica del Sur.",
  "Descubre quiénes son los mejores profes este ciclo.",
  "Tu guía de supervivencia para armar tu horario.",
  "Califica, comparte y ayuda a otros estudiantes.",
  "La verdad sobre tus profes, contada por estudiantes.",
  "Elige tus cursos sabiamente."
];
