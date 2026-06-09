// DELATE

/**
 * Función para borrar un día seleccionado del cronograma en el estado local.
 */
export const deleteSelectedDay = (
  currentDays: string[],
  dayToRemove: string
): string[] => {
  return currentDays.filter((day) => day !== dayToRemove)
}

/**
 * Función para borrar una actividad seleccionada del cronograma en el estado local.
 * Se activa al desmarcar una de las opciones en la pantalla.
 */
export const deleteSelectedActivity = (
  currentActivities: string[],
  activityToRemove: string
): string[] => {
  return currentActivities.filter((activity) => activity !== activityToRemove)
}

interface CronogramaActivity {
  id: string
  name: string
  location?: string
  startTime: string
  endTime: string
}

/**
 * Elimina una actividad específica del cronograma diario basado en su ID.
 * Se utiliza para limpiar bloques de la agenda en la pantalla.
 */
export const deleteCronogramaActivity = (
  currentActivities: CronogramaActivity[],
  activityIdToRemove: string
): CronogramaActivity[] => {
  return currentActivities.filter(
    (activity) => activity.id !== activityIdToRemove
  )
}

import { EstadoEmocionalId } from '@/models/estadoActual'
import { type BloqueHorario } from '@/models/cronograma'

/**
 * LETRA C: PANTALLA CRONOGRAMA ACADÉMICO - AGREGAR ACTIVIDAD
 * Inserta un bloque horario o evento específico asignado a un cronograma.
 */
export const insertarCronogramaActividad = async (
  userId: string,
  cronogramaId: string,
  titulo: string,
  ubicacion: string,
  tipoActividad: string
) => {
  const actividad = {
    user_id: userId,
    cronograma_id: cronogramaId,
    titulo: titulo.trim() || 'Actividad sin título',
    ubicacion: ubicacion.trim() || null,
    tipo_actividad: tipoActividad,
  }

  if (typeof window !== 'undefined') {
    const existentes = JSON.parse(
      localStorage.getItem(`cronograma_actividades_${userId}`) ?? '[]'
    ) as Array<typeof actividad & { id: string }>
    existentes.push({ ...actividad, id: Date.now().toString() })
    localStorage.setItem(
      `cronograma_actividades_${userId}`,
      JSON.stringify(existentes)
    )
    return existentes
  }

  return [actividad]
}

/**
 * LETRA C: PANTALLA ESTADO ACTUAL (PASO 2)
 * Registra la respuesta del usuario sobre cómo se ha sentido últimamente en el cuestionario de diagnóstico inicial.
 */
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const registro = {
    user_id: userId,
    paso: 2,
    estado_emocional_id: estadoId,
    creado_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('estadoActualId', estadoId)
    localStorage.setItem(
      `estado_emocional_${userId}`,
      JSON.stringify(registro)
    )
  }

  return [registro]
}

// ============================================================
// CRUD: Letra "R" pantalla de cronograma
// ============================================================

const _bloquesCronograma: BloqueHorario[] = [
  {
    id: '1',
    hora: '07:00',
    titulo: 'Cálculo diferencial',
    subtitulo: 'Aula 201 (07:00 - 08:30)',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: '2',
    hora: '09:00',
    titulo: 'Física I',
    subtitulo: 'Aula 102 (08:40 - 10:10)',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: '3',
    hora: '10:30',
    titulo: 'Estudio personal',
    subtitulo: 'Repaso de ejercicios',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: '4',
    hora: '12:00',
    titulo: 'Almuerzo',
    subtitulo: 'Descanso y comida',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: '5',
    hora: '13:00',
    titulo: 'Química general',
    subtitulo: 'Laboratorio 3 (13:10 - 14:40)',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
]

/** Devuelve todos los bloques horarios de la semana actual. */
export function leerBloquesCronograma(): BloqueHorario[] {
  return _bloquesCronograma
}

/** Busca y devuelve un bloque del cronograma por su ID. */
export function leerBloquePorId(id: string): BloqueHorario | undefined {
  return _bloquesCronograma.find((b) => b.id === id)
}

/** Filtra bloques del cronograma por tipo de actividad (match parcial en título). */
export function leerBloquesPorTipo(tipo: string): BloqueHorario[] {
  return _bloquesCronograma.filter((b) =>
    b.titulo.toLowerCase().includes(tipo.toLowerCase())
  )
}

async function actualizarTarea(
  tareaId: string,
  nuevosDatos: { hora?: string; estado?: string; descripcion?: string }
) {
  if (typeof window !== 'undefined') {
    const tareas = JSON.parse(
      localStorage.getItem('cronograma_tareas') ?? '[]'
    ) as Array<{
      id: string
      hora?: string
      estado?: string
      descripcion?: string
    }>
    const actualizadas = tareas.map((t) =>
      t.id === tareaId ? { ...t, ...nuevosDatos } : t
    )
    localStorage.setItem('cronograma_tareas', JSON.stringify(actualizadas))
    return { data: actualizadas, error: null }
  }
  return { data: null, error: null }
}

export { actualizarTarea }
