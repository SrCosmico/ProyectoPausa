// ==========================================
// SISTEMA DE INSIGHTS DE BIENESTAR
// Frases motivadoras + tips anti-estrés + umbrales de clasificación
// Escala usada: 1 (Muy mal) a 5 (Muy bien)
// ==========================================

export interface FraseMotivadora {
  id: string;
  texto: string;
  icono: string;
}

export interface TipBienestar {
  id: string;
  texto: string;
  icono: string;
}

// ----------------------------------------------------
// UMBRALES (sobre el promedio de los últimos 7 días)
// ----------------------------------------------------
/** Promedio <= este valor => se considera situación de crisis (redirige a Modo Crisis) */
export const UMBRAL_CRISIS = 1.8;
/** Promedio <= este valor (y > UMBRAL_CRISIS) => se muestran tips anti-estrés */
export const UMBRAL_BAJO = 2.6;
/** Promedio >= este valor => se muestran frases motivadoras */
export const UMBRAL_ALTO = 3.8;

export type ClasificacionBienestar = "crisis" | "bajo" | "moderado" | "alto";

/**
 * Clasifica un promedio numérico (1-5) en una categoría de bienestar.
 */
export function clasificarPromedio(promedio: number): ClasificacionBienestar {
  if (promedio <= UMBRAL_CRISIS) return "crisis";
  if (promedio <= UMBRAL_BAJO) return "bajo";
  if (promedio < UMBRAL_ALTO) return "moderado";
  return "alto";
}

// ----------------------------------------------------
// BANCO DE FRASES MOTIVADORAS (promedio alto)
// ----------------------------------------------------
export const FRASES_MOTIVADORAS: FraseMotivadora[] = [
  { id: "fm1", texto: "Vas por muy buen camino, sigue confiando en tu proceso.", icono: "🌟" },
  { id: "fm2", texto: "Tu constancia esta semana habla de tu fortaleza.", icono: "💪" },
  { id: "fm3", texto: "Disfruta este momento de calma, te lo has ganado.", icono: "🌈" },
  { id: "fm4", texto: "Cada día que cuidas tu bienestar, inviertes en tu futuro.", icono: "🌱" },
  { id: "fm5", texto: "Tu energía positiva también ayuda a quienes te rodean.", icono: "✨" },
  { id: "fm6", texto: "Sigue así, el equilibrio que tienes hoy es muy valioso.", icono: "🦋" },
  { id: "fm7", texto: "Pequeños hábitos constantes están construyendo tu bienestar.", icono: "🧩" },
];

// ----------------------------------------------------
// BANCO DE TIPS ANTI-ESTRÉS (promedio bajo o moderado-bajo)
// ----------------------------------------------------
export const TIPS_ANIMO_BAJO: TipBienestar[] = [
  { id: "tb1", texto: "Tómate 5 minutos para respirar profundo: inhala 4s, sostén 4s, exhala 4s.", icono: "🌬️" },
  { id: "tb2", texto: "Sal a caminar unos minutos, el movimiento ayuda a despejar la mente.", icono: "🚶" },
  { id: "tb3", texto: "Escríbele a alguien de confianza cómo te sientes hoy.", icono: "💬" },
  { id: "tb4", texto: "Reduce por hoy una tarea de tu lista; no tienes que hacerlo todo.", icono: "📝" },
  { id: "tb5", texto: "Hidrátate y descansa un poco la vista de las pantallas.", icono: "💧" },
  { id: "tb6", texto: "Prueba la técnica 5-4-3-2-1: nombra cosas que ves, tocas, oyes, hueles y saboreas.", icono: "🌀" },
];

/** Devuelve un elemento aleatorio de una lista (frase o tip). */
export function obtenerInsightAleatorio<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}