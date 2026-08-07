import { CRIT } from "../constants.js";

export const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const capitalizeName = name => {
  if (!name) return "";
  return name.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export const initials = n => {
  if (!n) return "";
  return n.split(" ").map(x => x[0]).slice(0, 2).join("");
};

export const ratingColor = r => r >= 4.5 ? "#059669" : r >= 3.5 ? "#1560AA" : r >= 2.5 ? "#E87722" : "#DC2626";

export const ratingLabel = r => r >= 4.5 ? "Excelente" : r >= 3.5 ? "Bueno" : r >= 2.5 ? "Regular" : "Deficiente";

export const calcRating = rs => rs.length ? parseFloat(avg(rs.map(x => avg(CRIT.map(c => x.criterios[c])))).toFixed(1)) : 0;

export const similarity = (a, b) => {
  a = a.toLowerCase().trim(); b = b.toLowerCase().trim();
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
