import { CRIT } from "../constants.js";

export const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const capitalizeName = name => {
  if (!name) return "";
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const normalizeText = text => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
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

// Formatea inteligentemente el nombre de un curso (respeta números romanos, conectores y restaura tildes comunes)
export const formatCourseName = course => {
  if (!course) return "";
  const words = course.trim().replace(/\s+/g, " ").split(" ");
  return words.map((rawWord, idx) => {
    const lower = rawWord.toLowerCase();
    const norm = normalizeText(lower);

    // Si es el último token y es un número arábigo (1-10) o romano (I-X), estandarizar a Romano en mayúsculas
    if (idx > 0 && ARABIC_TO_ROMAN[norm]) {
      return ARABIC_TO_ROMAN[norm];
    }
    if (ROMAN_NUMERALS.has(norm)) {
      return norm.toUpperCase();
    }

    // Conectores en minúscula (excepto si es la primera palabra)
    if (idx > 0 && LOWERCASE_CONNECTORS.has(norm)) {
      return norm;
    }

    // Si el usuario no puso tilde pero está en nuestro diccionario académico, ponemos la versión con tilde
    if (ACADEMIC_ACCENTS[norm]) {
      return ACADEMIC_ACCENTS[norm];
    }

    // Capitalizar primera letra manteniendo tildes que el usuario ya haya puesto
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
};

// Genera una clave canónica para detectar si dos cursos son el mismo aunque varíen en tildes, conectores o "I" vs "1"
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

// Puntúa qué tan "bien escrito" está un nombre de curso (prefiere tildes, romanos en mayúscula y formato limpio)
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

// Dado un curso ingresado y la lista de cursos existentes, devuelve el nombre canónico ideal
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

export const similarity = (a, b) => {
  a = normalizeText(a); b = normalizeText(b);
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const wa = a.split(" "), wb = b.split(" ");
  return wa.filter(w => wb.some(x => x.startsWith(w) || w.startsWith(x))).length / Math.max(wa.length, wb.length);
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
