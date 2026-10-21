import { CRIT } from "../constants.js";

export const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// Títulos académicos comunes que los alumnos suelen anteponer por error al nombre del profesor
const ACADEMIC_TITLES = new Set([
  "dr", "dra", "doctor", "doctora", "ing", "ingeniero", "ingeniera",
  "mg", "mag", "magister", "msc", "phd", "lic", "licenciado", "licenciada",
  "prof", "profe", "profesor", "profesora", "docente", "arq", "arquitecto", "arquitecta",
  "cd", "abog", "abogado", "abogada", "cpc", "psi", "psic", "obst"
]);

export const normalizeText = text => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
};

// Limpia títulos ("Dr.", "Ing.", etc.) y capitaliza correctamente el nombre del profesor
export const capitalizeName = name => {
  if (!name) return "";
  const rawWords = name.trim().replace(/\s+/g, " ").split(" ");
  const filteredWords = rawWords.filter((w, idx) => {
    const cleanToken = normalizeText(w).replace(/[.,]/g, "");
    if (idx === 0 && rawWords.length > 1 && ACADEMIC_TITLES.has(cleanToken)) return false;
    return true;
  });
  return filteredWords
    .map(w => w.toLowerCase())
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Diccionario académico de tildes automáticas para cursos universitarios
const ACADEMIC_ACCENTS = {
  calculo: "Cálculo",
  matematica: "Matemática",
  matematicas: "Matemáticas",
  quimica: "Química",
  fisica: "Física",
  biologia: "Biología",
  etica: "Ética",
  estadistica: "Estadística",
  psicologia: "Psicología",
  anatomia: "Anatomía",
  fisiologia: "Fisiología",
  histologia: "Histología",
  embriologia: "Embriología",
  patologia: "Patología",
  fisiopatologia: "Fisiopatología",
  farmacologia: "Farmacología",
  semiologia: "Semiología",
  ecologia: "Ecología",
  economia: "Economía",
  filosofia: "Filosofía",
  sociologia: "Sociología",
  metodologia: "Metodología",
  investigacion: "Investigación",
  redaccion: "Redacción",
  comunicacion: "Comunicación",
  introduccion: "Introducción",
  administracion: "Administración",
  gestion: "Gestión",
  ingenieria: "Ingeniería",
  organica: "Orgánica",
  inorganica: "Inorgánica",
  analitica: "Analítica",
  bioquimica: "Bioquímica",
  genetica: "Genética",
  microbiologia: "Microbiología",
  parasitologia: "Parasitología",
  inmunologia: "Inmunología",
  epidemiologia: "Epidemiología",
  clinica: "Clínica",
  clinico: "Clínico",
  quirurgica: "Quirúrgica",
  quirurgico: "Quirúrgico",
  pediatria: "Pediatría",
  ginecologia: "Ginecología",
  psiquiatria: "Psiquiatría",
  neurologia: "Neurología",
  cardiologia: "Cardiología",
  dermatologia: "Dermatología",
  oftalmologia: "Oftalmología",
  otorrinolaringologia: "Otorrinolaringología",
  traumatologia: "Traumatología",
  urologia: "Urología",
  oncologia: "Oncología",
  geriatria: "Geriatría",
  nutricion: "Nutrición",
  bromatologia: "Bromatología",
  toxicologia: "Toxicología",
  topografia: "Topografía",
  geologia: "Geología",
  hidrologia: "Hidrología",
  mecanica: "Mecánica",
  estatica: "Estática",
  dinamica: "Dinámica",
  termodinamica: "Termodinámica",
  electronica: "Electrónica",
  electrica: "Eléctrica",
  programacion: "Programación",
  computacion: "Computación",
  informatica: "Informática",
  logistica: "Logística",
  produccion: "Producción",
  legislacion: "Legislación",
  constitucion: "Constitución",
  juridica: "Jurídica",
  politica: "Política",
  teoria: "Teoría",
  practica: "Práctica",
  basica: "Básica",
  basico: "Básico",
  medica: "Médica",
  medico: "Médico",
  estomatologia: "Estomatología",
  odontologia: "Odontología",
  protesis: "Prótesis",
  cirugia: "Cirugía",
  zoologia: "Zoología",
  botanica: "Botánica",
  imagenologia: "Imagenología",
  radiologia: "Radiología",
  deontologia: "Deontología",
  ingles: "Inglés",
  logica: "Lógica",
  bioestadistica: "Bioestadística",
  biofisica: "Biofísica",
  bioetica: "Bioética"
};

const LOWERCASE_CONNECTORS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "a", "en", "con", "para", "por", "al"]);
const ROMAN_NUMERALS = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"]);
const ARABIC_TO_ROMAN = { "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", "6": "VI", "7": "VII", "8": "VIII", "9": "IX", "10": "X" };
const ROMAN_TO_ARABIC = { "i": "1", "ii": "2", "iii": "3", "iv": "4", "v": "5", "vi": "6", "vii": "7", "viii": "8", "ix": "9", "x": "10" };

export const formatCourseName = course => {
  if (!course) return "";
  const words = course.trim().replace(/\s+/g, " ").split(" ");
  return words.map((rawWord, idx) => {
    const lower = rawWord.toLowerCase();
    const norm = normalizeText(lower);

    if (idx > 0 && ARABIC_TO_ROMAN[norm]) {
      return ARABIC_TO_ROMAN[norm];
    }
    if (ROMAN_NUMERALS.has(norm)) {
      return norm.toUpperCase();
    }
    if (idx > 0 && LOWERCASE_CONNECTORS.has(norm)) {
      return norm;
    }
    if (ACADEMIC_ACCENTS[norm]) {
      return ACADEMIC_ACCENTS[norm];
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
};

export const normalizeCourseKey = course => {
  if (!course) return "";
  const cleaned = normalizeText(course)
    .replace(/[.,\-_/():;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  const tokens = cleaned.split(" ").filter(Boolean);
  const canonicalTokens = tokens
    .filter((t, idx) => idx === 0 || !LOWERCASE_CONNECTORS.has(t))
    .map(t => ROMAN_TO_ARABIC[t] || t);

  return canonicalTokens.join(" ");
};

export const scoreCourseQuality = course => {
  if (!course) return 0;
  let score = 0;
  const trimmed = course.trim().replace(/\s+/g, " ");
  if (trimmed === course) score += 2;
  const accents = (course.match(/[áéíóúÁÉÍÓÚñÑ]/g) || []).length;
  score += accents * 5;
  if (/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix)\b/.test(course)) score -= 10;
  if (/\b(I|II|III|IV|V|VI|VII|VIII|IX|X)$/.test(trimmed)) score += 4;
  if (course === course.toUpperCase() || course === course.toLowerCase()) score -= 6;
  return score;
};

export const resolveCanonicalCourse = (inputCourse, existingCourses = []) => {
  const formatted = formatCourseName(inputCourse);
  if (!formatted) return "";
  const targetKey = normalizeCourseKey(formatted);
  const matches = existingCourses.filter(c => normalizeCourseKey(c) === targetKey);
  if (matches.length === 0) return formatted;

  const bestExisting = [...matches].sort((a, b) => scoreCourseQuality(b) - scoreCourseQuality(a))[0];
  if (scoreCourseQuality(formatted) > scoreCourseQuality(bestExisting)) {
    return formatted;
  }
  return bestExisting;
};

export const initials = n => {
  if (!n) return "";
  return n.split(" ").map(x => x[0]).slice(0, 2).join("");
};

export const ratingColor = r => r >= 4.5 ? "#059669" : r >= 3.5 ? "#1560AA" : r >= 2.5 ? "#E87722" : "#DC2626";

export const ratingLabel = r => r >= 4.5 ? "Excelente" : r >= 3.5 ? "Bueno" : r >= 2.5 ? "Regular" : "Deficiente";

export const calcRating = rs => rs.length ? parseFloat(avg(rs.map(x => avg(CRIT.map(c => x.criterios[c])))).toFixed(1)) : 0;

// Distancia de edición (Levenshtein) rápida para detectar errores ortográficos como "Velasquez" vs "Velazquez" o "Gomez" vs "Gomes"
const editDistance = (s1, s2) => {
  if (s1 === s2) return 0;
  const m = s1.length, n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
};

// Compara dos palabras tolerando equivalencias fonéticas comunes en apellidos hispanos (s/z, b/v, c/s) o 1 letra de error
const wordsMatchFuzzy = (w1, w2) => {
  if (w1 === w2) return 1;
  if (w1.length >= 4 && w2.length >= 4) {
    // Equivalencia fonética s/z, v/b
    const p1 = w1.replace(/z/g, "s").replace(/v/g, "b");
    const p2 = w2.replace(/z/g, "s").replace(/v/g, "b");
    if (p1 === p2) return 0.96;
    const dist = editDistance(w1, w2);
    if (dist === 1) return 0.9;
    if (dist === 2 && Math.min(w1.length, w2.length) >= 7) return 0.82;
  }
  if ((w1.length >= 3 && w2.startsWith(w1)) || (w2.length >= 3 && w1.startsWith(w2))) {
    return 0.78;
  }
  return 0;
};

// Extrae las palabras significativas de un nombre de profesor (sin títulos como Dr./Ing. ni conectores cortos)
export const getNameTokens = name => {
  if (!name) return [];
  return normalizeText(name)
    .replace(/[.,\-_/():;]/g, " ")
    .split(" ")
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !ACADEMIC_TITLES.has(w) && !LOWERCASE_CONNECTORS.has(w));
};

// Validador inteligente de similitud para nombres de profesores y cursos:
// Detecta nombres parciales ("Juan Perez" vs "Juan Carlos Perez Gomez"), apellidos invertidos ("Perez Gomez Juan") y errores de tipeo
export const similarity = (a, b) => {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const wa = getNameTokens(a);
  const wb = getNameTokens(b);
  if (wa.length === 0 || wb.length === 0) return 0;

  const shorter = wa.length <= wb.length ? wa : wb;
  const longer = wa.length <= wb.length ? wb : wa;

  // Para cada palabra del nombre más corto, buscamos su mejor coincidencia en el nombre más largo (sin importar el orden)
  let matchedScore = 0;
  let exactOrNearMatches = 0;
  const usedLongerIdx = new Set();

  for (const sw of shorter) {
    let bestScore = 0;
    let bestIdx = -1;
    for (let i = 0; i < longer.length; i++) {
      if (usedLongerIdx.has(i)) continue;
      const s = wordsMatchFuzzy(sw, longer[i]);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
      }
    }
    if (bestIdx !== -1 && bestScore >= 0.75) {
      usedLongerIdx.add(bestIdx);
      matchedScore += bestScore;
      if (bestScore >= 0.88) exactOrNearMatches++;
    }
  }

  // Si alguien escribe nombre + apellido (2+ palabras) y TODAS coinciden dentro de un nombre completo de 3 o 4 palabras (ej. "Juan Perez" en "Juan Carlos Perez Gomez"), es altamente probable que sea el mismo profesor
  if (shorter.length >= 2 && exactOrNearMatches === shorter.length) {
    const avgQuality = matchedScore / shorter.length;
    return Math.max(0.88, avgQuality * 0.95);
  }

  // Si tienen al menos 2 palabras en común de 3 (ej. "Juan Perez Lopez" vs "Juan Perez")
  if (exactOrNearMatches >= 2 && shorter.length >= 2) {
    return Math.max(0.75, matchedScore / Math.max(wa.length, wb.length));
  }

  if (na.includes(nb) || nb.includes(na)) return 0.85;

  return matchedScore / Math.max(wa.length, wb.length);
};

export const formatFecha = d => {
  if (!d) return "";
  const date = d?.toDate ? d.toDate() : new Date(d);
  const ahora = new Date();
  const diff = (ahora - date) / 1000;
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

export const formatFechaExacta = d => {
  if (!d) return "";
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) +
    " a las " + date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
};
