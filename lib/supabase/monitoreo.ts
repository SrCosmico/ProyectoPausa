// ============================================================
// Tabla: historial_emociones
// ============================================================

import { createClient } from '@/lib/supabase/client'
import type { RegistroHistorico } from '@/models/monitoreo'

const supabase = createClient()

type NuevoRegistroEmocional = Omit<RegistroHistorico, 'id'>
type ActualizarRegistroEmocional = Partial<NuevoRegistroEmocional>

/**
 * ============================================================
 * C - CREATE
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

export async function insertarRegistro(registro: Record<string, unknown>) {
  try {
    const { data, error } = await supabase
      .from('historial_emociones')
      .insert([registro])
      .select()

    return { data, error }
  } catch (error) {
    console.error('Error inesperado al insertar registro:', error)
    return { data: null, error }
  }
}

/**
 * ============================================================
 * R - READ (Conectado a Supabase)
 * ============================================================
 */
export async function leerHistorialEmocionalSemanal(): Promise<RegistroHistorico[]> {
  try {
    const { data, error } = await supabase
      .from('historial_emociones')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) {
      console.error('Error al leer historial:', error.message)
      return []
    }
    return data as RegistroHistorico[] || []
  } catch (error) {
    console.error('Error inesperado al leer historial:', error)
    return []
  }
}

/**
 * ============================================================
 * U - UPDATE
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