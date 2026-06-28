import { createClient } from '@/lib/supabase/client';
import { type BloqueHorario, type CronogramaConfig, type TipoActividad } from '@/models/cronograma';
import { EstadoEmocionalId } from '@/models/estadoActual';

const getSupabase = () => createClient();

// ── R — Obtener Configuración del Cronograma ──────────────────────────────
export const obtenerCronogramaUsuario = async (): Promise<CronogramaConfig | null> => {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cronogramas')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error al obtener cronograma:', error.message);
    return null;
  }
  return data as CronogramaConfig | null;
};

// ── C — Crear Configuración del Cronograma (Onboarding) ───────────────────
export const crearCronograma = async (nombre: string, color: string, recordatorios: boolean) => {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('cronogramas')
    .insert([{ user_id: user.id, nombre, color, recordatorios }])
    .select()
    .single();

  if (error) throw error;
  return data as CronogramaConfig;
};

// ── R — Leer Todas las Actividades ────────────────────────────────────────
export const obtenerActividadesCronograma = async (): Promise<BloqueHorario[]> => {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('actividades_cronograma')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error obteniendo actividades:', error.message);
    return [];
  }

  // Mapeamos de base de datos (snake_case) al formato del frontend (camelCase)
  return data.map((act: any) => ({
    id: act.id,
    fecha: act.fecha,
    tipo: act.tipo_actividad as TipoActividad,
    horaInicio: act.hora_inicio,
    horaFin: act.hora_fin,
    titulo: act.titulo,
    ubicacion: act.ubicacion || '',
  }));
};

// ── C — Insertar Actividad ────────────────────────────────────────────────
export const insertarActividad = async (
  cronogramaId: string,
  actividad: Omit<BloqueHorario, 'id'>
): Promise<BloqueHorario | null> => {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('actividades_cronograma')
    .insert([{
      cronograma_id: cronogramaId,
      user_id: user.id,
      titulo: actividad.titulo.trim() || 'Sin título',
      ubicacion: actividad.ubicacion.trim() || null,
      tipo_actividad: actividad.tipo,
      fecha: actividad.fecha,
      hora_inicio: actividad.horaInicio,
      hora_fin: actividad.horaFin,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error insertando actividad:', error.message);
    return null;
  }

  return {
    id: data.id,
    fecha: data.fecha,
    tipo: data.tipo_actividad as TipoActividad,
    horaInicio: data.hora_inicio,
    horaFin: data.hora_fin,
    titulo: data.titulo,
    ubicacion: data.ubicacion || '',
  };
};

// ── U — Actualizar Actividad ──────────────────────────────────────────────
export const actualizarActividad = async (
  id: string,
  actividad: Partial<Omit<BloqueHorario, 'id'>>
) => {
  const supabase = getSupabase();
  
  const actualizacion: any = {};
  if (actividad.titulo) actualizacion.titulo = actividad.titulo;
  if (actividad.ubicacion !== undefined) actualizacion.ubicacion = actividad.ubicacion;
  if (actividad.tipo) actualizacion.tipo_actividad = actividad.tipo;
  if (actividad.fecha) actualizacion.fecha = actividad.fecha;
  if (actividad.horaInicio) actualizacion.hora_inicio = actividad.horaInicio;
  if (actividad.horaFin) actualizacion.hora_fin = actividad.horaFin;

  const { data, error } = await supabase
    .from('actividades_cronograma')
    .update(actualizacion)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando actividad:', error.message);
    return null;
  }

  return {
    id: data.id,
    fecha: data.fecha,
    tipo: data.tipo_actividad as TipoActividad,
    horaInicio: data.hora_inicio,
    horaFin: data.hora_fin,
    titulo: data.titulo,
    ubicacion: data.ubicacion || '',
  };
};

// ── D — Eliminar Actividad ────────────────────────────────────────────────
export const eliminarActividad = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('actividades_cronograma')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar actividad:', error.message);
    return false;
  }
  return true;
};

// ── C — Estado emocional del cuestionario (Mantenido) ─────────────────────
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('cuestionario_onboarding')
    .upsert({ user_id: userId, estado_emocional_id: estadoId }, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('Error al guardar estado emocional:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};