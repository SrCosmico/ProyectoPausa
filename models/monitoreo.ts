// ==========================================
// INTERFACES Y DATOS DE MONITOREO — SISTEMA DE PUNTUACIÓN NUMÉRICA
// ==========================================

// Escala numérica: muy_mal=1, mal=2, regular=3, bien=4, muy_bien=5
export type NivelBienestar = 1 | 2 | 3 | 4 | 5;

export interface RegistroHistorico {
  id?: string | number;
  user_id?: string;
  dia?: string;            // Fecha en formato "YYYY-MM-DD"
  fecha?: string;          // Para renderizado visual (alias de dia)
  nivel: NivelBienestar;  // 1–5 (antes era number, ahora tipado estrictamente)
  estado: string;          // "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien"
  nota?: string | null;
}

export interface TipAntiEstres {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

// Mapa de nivel numérico → estado textual
export const NIVEL_A_ESTADO: Record<NivelBienestar, string> = {
  1: "Muy mal",
  2: "Mal",
  3: "Regular",
  4: "Bien",
  5: "Muy bien",
};

// Mapa de estado textual → nivel numérico
export const ESTADO_A_NIVEL: Record<string, NivelBienestar> = {
  "Muy mal":  1,
  "Mal":      2,
  "Regular":  3,
  "Bien":     4,
  "Muy bien": 5,
};

// Mapa de nivel numérico → emoji visual
export const NIVEL_A_EMOJI: Record<NivelBienestar, string> = {
  1: "😩",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "🤩",
};

// Umbral por debajo del cual el sistema sugiere modo crisis
export const UMBRAL_CRISIS = 1.8;

// Calcula el promedio de los últimos 7 días
export function calcularPromedioBienestar(registros: RegistroHistorico[]): number {
  if (registros.length === 0) return 3;
  const suma = registros.reduce((acc, r) => acc + (r.nivel ?? 3), 0);
  return suma / registros.length;
}

// Determina si el promedio cae en zona de alerta o crisis
export function clasificarEstadoBienestar(promedio: number): "crisis" | "alerta" | "moderado" | "bien" {
  if (promedio <= UMBRAL_CRISIS)   return "crisis";
  if (promedio <= 2.5)              return "alerta";
  if (promedio <= 3.5)              return "moderado";
  return "bien";
}

// Datos de simulación para la interfaz
export const historialEmocionalInicial: RegistroHistorico[] = [
  { dia: "L", fecha: "25 Mayo", nivel: 2, estado: "Mal" },
  { dia: "M", fecha: "26 Mayo", nivel: 4, estado: "Bien" },
  { dia: "M", fecha: "27 Mayo", nivel: 3, estado: "Regular" },
  { dia: "J", fecha: "28 Mayo", nivel: 5, estado: "Muy bien" },
  { dia: "V", fecha: "29 Mayo", nivel: 4, estado: "Bien" },
  { dia: "S", fecha: "30 Mayo", nivel: 3, estado: "Regular" },
  { dia: "D", fecha: "31 Mayo", nivel: 4, estado: "Bien" },
];

export const registrosAnterioresSimulados: RegistroHistorico[] = [
  { dia: "Dom", fecha: "24 Mayo", nivel: 5, estado: "Muy bien" },
  { dia: "Sáb", fecha: "23 Mayo", nivel: 4, estado: "Bien" },
  { dia: "Vie", fecha: "22 Mayo", nivel: 3, estado: "Regular" },
  { dia: "Jue", fecha: "21 Mayo", nivel: 1, estado: "Muy mal" },
  { dia: "Mié", fecha: "20 Mayo", nivel: 2, estado: "Mal" },
];

export const bcoTipsAntiEstres: TipAntiEstres[] = [
  { id: 1, titulo: "Toma un respiro 4-7-8", descripcion: "Inhala durante 4 segundos, mantén 7 y exhala completamente en 8 segundos para calmar tu sistema nervioso.", icono: "🌬️" },
  { id: 2, titulo: "Estiramiento rápido", descripcion: "Levántate de la silla, estira tus brazos hacia el techo y rota los hombros hacia atrás durante 1 minuto.", icono: "🧘‍♀️" },
  { id: 3, titulo: "Desconexión digital", descripcion: "Aparta la vista de todas tus pantallas por los próximos 10 minutos. Deja que tus ojos y mente descansen.", icono: "📴" },
  { id: 4, titulo: "Un sorbo de calma", descripcion: "Bebe un vaso de agua despacio, saboreándolo y enfocándote únicamente en esa sensación física de hidratación.", icono: "💧" },
  { id: 5, titulo: "Escucha el entorno", descripcion: "Cierra los ojos e intenta identificar 3 sonidos diferentes a tu alrededor que normalmente ignoras.", icono: "🎧" },
];
