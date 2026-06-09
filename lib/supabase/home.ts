export const PREGUNTAS_CHECKIN = [
  '¿Cómo te sientes hoy?',
  '¿Cómo te sientes ahora?',
  '¿Qué emoción te deja este día?',
] as const

export const TIEMPO_ESPERA_MS = 5000

export {
  MAX_CHECKINS_DIARIOS,
  cargarQuizState,
  getQuizStorageKey,
  guardarEmocionTemporal,
  guardarQuizState,
  hayGuardadoReciente,
  limpiarSenalGuardadoReciente,
  obtenerCurrentQuestionIndex,
  obtenerEmocionTemporal,
  obtenerUsuarioIdLocal,
} from './quizState'

import {
  MAX_CHECKINS_DIARIOS,
  cargarQuizState,
  obtenerUsuarioIdLocal,
} from './quizState'

export function obtenerPreguntaPorPaso(paso: number): string {
  if (paso >= MAX_CHECKINS_DIARIOS) return ''
  return PREGUNTAS_CHECKIN[paso] ?? PREGUNTAS_CHECKIN[0]
}

export async function obtenerEstadoPreguntaDiaria(usuarioId: string) {
  const id = usuarioId || obtenerUsuarioIdLocal()
  const paso = cargarQuizState(id).currentQuestionIndex

  return {
    data: { pasoActual: paso },
    error: null,
  }
}

export function obtenerNombreUsuarioLocal(): string {
  if (typeof window === 'undefined') return 'Valeria'

  const nombre =
    localStorage.getItem('alumnoNombre') ||
    localStorage.getItem('alumnoEmail') ||
    'Valeria'

  if (nombre.includes('@')) {
    const parte = nombre.split('@')[0]
    return parte.charAt(0).toUpperCase() + parte.slice(1)
  }

  return nombre
}

export function debeMostrarCheckin(paso: number, esperando: boolean): boolean {
  return paso < MAX_CHECKINS_DIARIOS && !esperando
}
