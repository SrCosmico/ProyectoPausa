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
import { NivelEmocional } from '@/models/home'
import {
  emojiEstadosData,
  accesoRapidoData,
  navegacionData,
  type AccesoRapido,
  type EmojiEstado,
  type ItemNavegacion,
} from '@/models/home'

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

/**
 * LETRA C: PANTALLA HOME (CHECK-IN EMOCIONAL)
 * Persiste el estado de ánimo seleccionado en localStorage para monitoreo diario.
 */
export const insertarCheckInEmocionalHome = async (
  userId: string,
  estadoEmocional: NivelEmocional
) => {
  if (typeof window !== 'undefined') {
    const historial = JSON.parse(
      localStorage.getItem(`checkin_home_${userId}`) ?? '[]'
    ) as Array<{ estado: NivelEmocional; registrado_at: string }>
    historial.push({
      estado: estadoEmocional,
      registrado_at: new Date().toISOString(),
    })
    localStorage.setItem(`checkin_home_${userId}`, JSON.stringify(historial))
    localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString())
  }

  return [{ user_id: userId, estado: estadoEmocional }]
}

async function actualizarRegistroEmocional(
  registroId: string,
  nuevoEstado: string,
  nuevaDescripcion: string
) {
  if (typeof window !== 'undefined') {
    const registros = JSON.parse(
      localStorage.getItem('registros_emocionales') ?? '[]'
    ) as Array<{ id: string; estado: string; descripcion: string }>
    const actualizados = registros.map((r) =>
      r.id === registroId
        ? { ...r, estado: nuevoEstado, descripcion: nuevaDescripcion }
        : r
    )
    localStorage.setItem('registros_emocionales', JSON.stringify(actualizados))
    return { data: actualizados, error: null }
  }
  return { data: null, error: null }
}

// ============================================================
// CRUD: Letra "R" pantalla de home
// ============================================================

/** Lee el nombre del usuario activo desde localStorage. */
export function leerNombreUsuarioHome(): string {
  return obtenerNombreUsuarioLocal()
}

/** Verifica si el usuario ya hizo un check-in emocional hoy. */
export function leerYaRegistroHoy(): boolean {
  if (typeof window === 'undefined') return false
  return (
    localStorage.getItem('fechaUltimoRegistro') ===
    new Date().toLocaleDateString()
  )
}

/** Devuelve las opciones de emoji para el check-in emocional rápido del Home. */
export function leerOpcionesEmojiHome(): EmojiEstado[] {
  return emojiEstadosData
}

/** Devuelve el listado de herramientas de acceso rápido del Home. */
export function leerAccesoRapidoHome(): AccesoRapido[] {
  return accesoRapidoData
}

/** Devuelve los ítems de la barra de navegación inferior con "inicio" activo. */
export function leerNavegacionHome(): ItemNavegacion[] {
  return navegacionData.map((item) => ({
    ...item,
    activo: item.id === 'inicio',
  }))
}

async function actualizarFotoPerfil(userId: string, newAvatarUrl: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`avatar_${userId}`, newAvatarUrl)
    return { data: { avatar_url: newAvatarUrl }, error: null }
  }
  return { data: null, error: null }
}

export { actualizarRegistroEmocional, actualizarFotoPerfil }
