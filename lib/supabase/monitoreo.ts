// ============================================================
// CRUD: Letra "R" pantalla de monitoreo
// ============================================================

import {
  historialEmocionalInicial,
  registrosAnterioresSimulados,
  bcoTipsAntiEstres,
  type RegistroHistorico,
  type TipAntiEstres,
} from "@/models/monitoreo";

/** Devuelve el historial emocional de los últimos 7 días. */
export function leerHistorialEmocionalSemanal(): RegistroHistorico[] {
  return historialEmocionalInicial;
}

/** Devuelve los registros emocionales anteriores a la semana actual. */
export function leerRegistrosAnteriores(): RegistroHistorico[] {
  return registrosAnterioresSimulados;
}

/** Devuelve un tip anti-estrés aleatorio del banco de tips. */
export function leerTipAntiEstresAleatorio(): TipAntiEstres {
  return bcoTipsAntiEstres[
    Math.floor(Math.random() * bcoTipsAntiEstres.length)
  ];
}

/** Devuelve el estado emocional más reciente del historial semanal. */
export function leerEstadoEmocionalActual(): RegistroHistorico {
  return historialEmocionalInicial[historialEmocionalInicial.length - 1];
}
