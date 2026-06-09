// DELATE

/**
 * Función para borrar un elemento del estado local.
 */
export const deleteItem = (
  currentList: string[],
  itemToRemove: string
): string[] => {
  return currentList.filter((item) => item !== itemToRemove)
}

// pantalla factores de impacto

import { FactorId } from '@/models/factoresImpacto'
import {
  opcionesFactoresData,
  type OpcionFactor,
} from '@/models/factoresImpacto'

/**
 * LETRA C: PANTALLA FACTORES DE IMPACTO (PASO 3)
 * Registra de forma masiva los factores que afectan el bienestar del usuario,
 * incluyendo soporte para un texto libre personalizado si seleccionó "Otro".
 */
export const insertarFactoresImpactoBienestar = async (
  userId: string,
  factoresIds: FactorId[],
  otroTextoEspecificado?: string
) => {
  const registro = {
    user_id: userId,
    paso: 3,
    factores_seleccionados: factoresIds,
    otro_especificar_texto: factoresIds.includes('otro')
      ? otroTextoEspecificado
      : null,
    creado_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `factores_impacto_${userId}`,
      JSON.stringify(registro)
    )
  }

  return [registro]
}

// ============================================================
// CRUD: Letra "R" pantalla de factoresImpacto
// ============================================================

const _iconosFactores: Record<string, string> = {
  estres_academico: '🎓',
  sobrecarga_tareas: '📝',
  falta_tiempo: '⏳',
  problemas_personales: '👥',
  ansiedad: '🧠',
  motivacion_baja: '📉',
  otro: '✏️',
}

/** Devuelve los factores de impacto con emoji y estado de selección. */
export function leerOpcionesFactoresImpacto(
  seleccionados: Record<string, boolean>
): OpcionFactor[] {
  return opcionesFactoresData.map((item) => ({
    ...item,
    icono: _iconosFactores[item.id] ?? '❓',
    seleccionado: seleccionados[item.id] ?? false,
  }))
}
