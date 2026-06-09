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

// pantalla motivos
import { opcionesMotivosData, type OpcionMotivo } from '@/models/motivos'

/**
 * LETRA C: PANTALLA MOTIVOS
 * Registra por primera vez los motivos seleccionados por el estudiante
 * durante su proceso de inducción u onboarding en la aplicación.
 */
export const insertarMotivosOnboarding = async (
  userId: string,
  motivosSeleccionados: string[],
  otroTextoEspecificado?: string
) => {
  const registro = {
    user_id: userId,
    motivos: motivosSeleccionados,
    otro_motivo_texto: otroTextoEspecificado || null,
    creado_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`motivos_${userId}`, JSON.stringify(registro))
  }

  return [registro]
}

// ============================================================
// CRUD: Letra "R" pantalla de motivos
// ============================================================

const _iconosMotivos: Record<string, string> = {
  estres: '🧘',
  bienestar: '🌸',
  dormir: '🌙',
  academico: '📚',
  motivacion: '✨',
  otro: '✏️',
}

/**
 * Devuelve la lista de opciones de motivos con emoji y estado de selección
 * a partir del mapa de seleccionados recibido como parámetro.
 */
export function leerOpcionesMotivos(
  seleccionados: Record<string, boolean>
): OpcionMotivo[] {
  return opcionesMotivosData.map((item) => ({
    ...item,
    icono: _iconosMotivos[item.id] ?? '❓',
    seleccionado: seleccionados[item.id] ?? false,
  }))
}
