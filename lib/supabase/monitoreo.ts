// ============================================================
// Tabla: historial_emociones
// ============================================================

import { createClient } from '@/lib/supabase/client'
import type { RegistroHistorico } from '@/models/monitoreo'

const supabase = createClient()

/**
 * Ajusta este tipo según los campos reales de tu tabla.
 * Si tu tabla tiene más columnas, agrégalas aquí.
 */
type NuevoRegistroEmocional = Omit<RegistroHistorico, 'id'>
type ActualizarRegistroEmocional = Partial<NuevoRegistroEmocional>

/**
 * ============================================================
 * C - CREATE
 * Crear un nuevo registro emocional
 * ============================================================
 */
export async function crearRegistroEmocional(
  nuevoRegistro: NuevoRegistroEmocional
): Promise<RegistroHistorico | null> {
  try {
    const { data, error } = await supabase
      .from('historial_emociones')
      .insert([nuevoRegistro])
      .select()
      .single()

    if (error) {
      console.error('Error al crear el registro emocional:', error.message)
      return null
    }

    return data as RegistroHistorico
  } catch (error) {
    console.error('Error inesperado al crear el registro emocional:', error)
    return null
  }
}

// ============================================================
// CRUD: Letra "R" pantalla de monitoreo
// ============================================================

import {
  historialEmocionalInicial,
  registrosAnterioresSimulados,
  bcoTipsAntiEstres,
  type TipAntiEstres,
} from '@/models/monitoreo'

/** Devuelve el historial emocional de los últimos 7 días. */
export function leerHistorialEmocionalSemanal(): RegistroHistorico[] {
  return historialEmocionalInicial
}

/** Devuelve los registros emocionales anteriores a la semana actual. */
export function leerRegistrosAnteriores(): RegistroHistorico[] {
  return registrosAnterioresSimulados
}

/** Devuelve un tip anti-estrés aleatorio del banco de tips. */
export function leerTipAntiEstresAleatorio(): TipAntiEstres {
  return bcoTipsAntiEstres[
    Math.floor(Math.random() * bcoTipsAntiEstres.length)
  ]
}

/** Devuelve el estado emocional más reciente del historial semanal. */
export function leerEstadoEmocionalActual(): RegistroHistorico {
  return historialEmocionalInicial[historialEmocionalInicial.length - 1]
}


/**
 * ============================================================
 * U - UPDATE
 * Actualizar un registro emocional existente
 * IMPORTANTE: usar .eq('id', registroId)
 * ============================================================
 */
export async function actualizarRegistroEmocional(
  registroId: string | number,
  cambios: ActualizarRegistroEmocional
): Promise<RegistroHistorico | null> {
  try {
    const { data, error } = await supabase
      .from('historial_emociones')
      .update(cambios)
      .eq('id', registroId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar el registro emocional:', error.message)
      return null
    }

    return data as RegistroHistorico
  } catch (error) {
    console.error('Error inesperado al actualizar el registro emocional:', error)
    return null
  }
}

/**
 * ============================================================
 * D - DELETE
 * Eliminar un registro emocional específico
 * IMPORTANTE: usar .eq('id', registroId)
 * ============================================================
 */
export async function eliminarRegistroEmocional(
  registroId: string | number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('historial_emociones')
      .delete()
      .eq('id', registroId)

    if (error) {
      console.error('Error al eliminar el registro emocional:', error.message)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al eliminar el registro emocional:', error)
    return false
  }
}
