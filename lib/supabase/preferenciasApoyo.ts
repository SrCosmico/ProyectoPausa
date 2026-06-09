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

// pantalla preferencias de apoyo
import {
  opcionesPreferenciasData,
  mapeoIconos as iconosPreferencias,
  type OpcionPreferencia,
} from '@/models/preferenciasApoyo'

/**
 * LETRA C: PANTALLA PREFERENCIAS DE APOYO
 * Registra los tipos de apoyo seleccionados por el estudiante
 * durante su proceso de inducción y configuración inicial.
 */
export const insertarPreferenciasApoyo = async (
  userId: string,
  preferenciasSeleccionadas: string[]
) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `preferencias_apoyo_${userId}`,
      JSON.stringify({
        preferencias: preferenciasSeleccionadas,
        creado_at: new Date().toISOString(),
      })
    )
  }

  return [
    {
      user_id: userId,
      preferencias: preferenciasSeleccionadas,
      creado_at: new Date().toISOString(),
    },
  ]
}

// ============================================================
// CRUD: Letra "R" pantalla de preferenciasApoyo
// ============================================================

/** Devuelve las preferencias de apoyo con emoji y estado de selección. */
export function leerOpcionesPreferenciasApoyo(
  seleccionados: Record<string, boolean>
): OpcionPreferencia[] {
  return opcionesPreferenciasData.map((item) => ({
    ...item,
    icono: iconosPreferencias[item.id],
    seleccionado: seleccionados[item.id] ?? false,
  }))
}
