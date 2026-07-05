// ==========================================
// MODELO: Racha en pareja
// ==========================================

export interface Pareja {
  id: string;
  user_id_1: string;
  user_id_2: string | null;
  correo_invitado: string | null;
  estado: "pendiente" | "activa";
  creado_at: string;
}

export interface CheckinDia {
  fecha: string; // YYYY-MM-DD
  yoRegistre: boolean;
  parejaRegistro: boolean;
  completo: boolean; // ambos registraron ese día
  protegido: boolean; // se cubrió con un protector de racha
}

export interface EstadoRachaPareja {
  parejaId: string | null;
  tieneParejaActiva: boolean;
  esperandoAceptacion: boolean; // invitación enviada, pareja aún no acepta
  correoInvitado: string | null;
  rachaActual: number;
  rachaMaxima: number;
  protectoresDisponibles: number;
  protectoresUsadosEsteMes: number;
  activadaHoy: boolean; // true si hoy ambos ya registraron su emoción
  historialDias: CheckinDia[]; // últimos 7 días, del más antiguo al más reciente
  mensajeMotivador: string | null; // solo presente cuando activadaHoy es true
}

export const MAX_PROTECTORES_MES = 4;

export const mensajesMotivadoresData: string[] = [
  "¡Su conexión sigue firme! Un día más compartiendo cómo se sienten. 💜",
  "La constancia construye intimidad. ¡Gran trabajo en equipo! 🔥",
  "Cada check-in es un pequeño 'te escucho'. Sigan así. 🤝",
  "Esto es lo que se siente crecer juntos, un día a la vez. 🌱",
  "¡Racha activada! Su comunicación emocional está en su mejor momento. ✨",
  "Compartir cómo se sienten hoy fortalece su relación mañana. 💞",
  "Pequeños hábitos, grandes vínculos. ¡Felicidades por hoy! 🎉",
];

export function obtenerMensajeMotivadorAleatorio(): string {
  return mensajesMotivadoresData[
    Math.floor(Math.random() * mensajesMotivadoresData.length)
  ];
}

/** Devuelve el mes en formato "YYYY-MM" para agrupar protectores. */
export function obtenerMesActual(fecha: Date = new Date()): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Fecha local (no UTC) en formato YYYY-MM-DD. */
export function obtenerFechaLocalISO(fecha: Date = new Date()): string {
  const offset = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - offset).toISOString().split("T")[0];
}