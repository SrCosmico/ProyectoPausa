// lib/supabase/cronograma.ts

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
import { createClient } from './client'

const supabase = createClient()

// ============================================================
// CONFIGURACIÓN GLOBAL DEL CRONOGRAMA (NUEVO)
// ============================================================

export async function guardarConfiguracionCronograma(userId: string, data: any) {
  // Verificamos si ya existe un cronograma para este usuario
  const { data: existente } = await supabase
    .from('cronogramas')
    .select('id')
    .eq('user_id', userId)
    .single()

  const payload = {
    user_id: userId,
    nombre: data.nombre,
    color: data.color,
    dias_activos: data.dias,
    hora_inicio: data.horaInicio,
    hora_fin: data.horaFin,
    actividades_preferidas: data.actividades,
    recordatorios: data.recordatorios
  }

  if (existente) {
    // Si existe, actualizamos
    return await supabase
      .from('cronogramas')
      .update(payload)
      .eq('id', existente.id)
  } else {
    // Si no existe, creamos uno nuevo
    return await supabase
      .from('cronogramas')
      .insert([payload])
  }
}

export async function obtenerConfiguracionCronograma(userId: string) {
  const { data, error } = await supabase
    .from('cronogramas')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle() // maybeSingle evita errores si el usuario es nuevo y no tiene config

  return { data, error }
}

/**
 * LETRA C: PANTALLA CRONOGRAMA ACADÉMICO - AGREGAR ACTIVIDAD
 * Inserta un bloque horario o evento específico asignado a un cronograma (versión local/legacy).
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

// ============================================================
// CONVERSIÓN DE HORA EN ESPAÑOL -> FORMATO 24H PARA POSTGRES
// ============================================================

export function convertirHoraAFormato24(horaTexto: string): string {
  const match = horaTexto
    .trim()
    .toLowerCase()
    .match(/(\d{1,2}):(\d{2})\s*([ap])\.?\s*m\.?/i)

  if (!match) {
    const matchSimple = horaTexto.trim().match(/^(\d{1,2}):(\d{2})(:\d{2})?$/)
    if (matchSimple) {
      const [, h, m] = matchSimple
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`
    }
    throw new Error(`Formato de hora no reconocido: "${horaTexto}"`)
  }

  const [, horasStr, minutosStr, meridiano] = match
  let horas = parseInt(horasStr, 10)
  const minutos = parseInt(minutosStr, 10)
  const esPM = meridiano === 'p'

  if (esPM && horas < 12) horas += 12
  if (!esPM && horas === 12) horas = 0

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`
}

// ============================================================
// INSERT / READ / UPDATE / DELETE REAL EN SUPABASE: "actividades_cronograma"
// ============================================================

export interface NuevaActividadCronograma {
  user_id: string
  titulo: string
  ubicacion?: string | null
  tipo_actividad: string
  /** Formato "YYYY-MM-DD" */
  fecha: string
  /** Acepta formato español "07:00 a. m." o ya en 24h "07:00" */
  hora_inicio: string
  hora_fin: string
  dias_semana?: string[]
}

export interface ActividadCronogramaGuardada {
  id: string
  user_id: string
  titulo: string
  ubicacion: string | null
  tipo_actividad: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  dias_semana: string[]
  created_at?: string
}

export async function crearActividadCronograma(
  actividad: NuevaActividadCronograma
): Promise<{ data: ActividadCronogramaGuardada[] | null; error: Error | null }> {
  try {
    const horaInicioFormateada = convertirHoraAFormato24(actividad.hora_inicio)
    const horaFinFormateada = convertirHoraAFormato24(actividad.hora_fin)

    const payload = {
      user_id: actividad.user_id,
      titulo: actividad.titulo.trim() || 'Actividad sin título',
      ubicacion: actividad.ubicacion?.trim() || null,
      tipo_actividad: actividad.tipo_actividad,
      fecha: actividad.fecha,
      hora_inicio: horaInicioFormateada,
      hora_fin: horaFinFormateada,
      dias_semana: actividad.dias_semana ?? [],
    }

    const { data, error } = await supabase
      .from('actividades_cronograma')
      .insert([payload])
      .select()

    if (error) {
      console.error('Error al insertar actividad en Supabase:', error.message)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as ActividadCronogramaGuardada[], error: null }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error al preparar la actividad para guardar:', mensaje)
    return { data: null, error: new Error(mensaje) }
  }
}

export async function actualizarActividadCronograma(
  actividadId: string,
  actividad: Partial<NuevaActividadCronograma>
): Promise<{ data: ActividadCronogramaGuardada[] | null; error: Error | null }> {
  try {
    const payload: any = { ...actividad }
    if (actividad.titulo) payload.titulo = actividad.titulo.trim()
    if (actividad.ubicacion !== undefined) payload.ubicacion = actividad.ubicacion?.trim() || null
    if (actividad.hora_inicio) payload.hora_inicio = convertirHoraAFormato24(actividad.hora_inicio)
    if (actividad.hora_fin) payload.hora_fin = convertirHoraAFormato24(actividad.hora_fin)

    const { data, error } = await supabase
      .from('actividades_cronograma')
      .update(payload)
      .eq('id', actividadId)
      .select()

    if (error) {
      console.error('Error al actualizar la actividad en Supabase:', error.message)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as ActividadCronogramaGuardada[], error: null }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error al procesar actualización:', mensaje)
    return { data: null, error: new Error(mensaje) }
  }
}

export async function leerActividadesCronogramaUsuario(
  userId: string
): Promise<ActividadCronogramaGuardada[]> {
  const { data, error } = await supabase
    .from('actividades_cronograma')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error) {
    console.error('Error al leer actividades del cronograma:', error.message)
    return []
  }

  return (data ?? []) as ActividadCronogramaGuardada[]
}

export async function eliminarActividadCronograma(
  actividadId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('actividades_cronograma')
    .delete()
    .eq('id', actividadId)

  if (error) {
    console.error('Error al eliminar actividad del cronograma:', error.message)
    return false
  }

  return true
}

/**
 * LETRA C: PANTALLA ESTADO ACTUAL (PASO 2)
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
// CRUD: Letra "R" pantalla de cronograma (datos de ejemplo legacy)
// ============================================================

const _bloquesCronograma: BloqueHorario[] = [
  { id: '1', hora: '07:00', titulo: 'Cálculo diferencial', subtitulo: 'Aula 201 (07:00 - 08:30)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: '2', hora: '09:00', titulo: 'Física I', subtitulo: 'Aula 102 (08:40 - 10:10)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: '3', hora: '10:30', titulo: 'Estudio personal', subtitulo: 'Repaso de ejercicios', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: '4', hora: '12:00', titulo: 'Almuerzo', subtitulo: 'Descanso y comida', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: '5', hora: '13:00', titulo: 'Química general', subtitulo: 'Laboratorio 3 (13:10 - 14:40)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

export function leerBloquesCronograma(): BloqueHorario[] {
  return _bloquesCronograma
}

export function leerBloquePorId(id: string): BloqueHorario | undefined {
  return _bloquesCronograma.find((b) => b.id === id)
}

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