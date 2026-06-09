// app/services/emocionesService.ts
import { createClient } from '@/lib/supabase';
import { RegistroEmocion, Recomendacion } from '@/app/types';

const supabase = createClient();

/**
 * FUNCIÓN 1: Guardar una nueva emoción en Supabase
 * (La usará tu equipo cuando el usuario registre cómo se siente)
 */
export const guardarEmocion = async (emocion: RegistroEmocion) => {
  const { data, error } = await supabase
    .from('historial_emociones') // Nombre exacto con el que guardaste la tabla en Supabase
    .insert([emocion]);

  if (error) {
    console.error('Error al guardar en Supabase:', error.message);
    return { success: false, error };
  }
  return { success: true, data };
};

/**
 * FUNCIÓN 2: Obtener todo el historial de un usuario específico
 * (La usará tu equipo para pintar las gráficas y el calendario)
 */
export const obtenerHistorialUsuario = async (userId: string) => {
  const { data, error } = await supabase
    .from('historial_emociones') // Nombre exacto con el que guardaste la tabla en Supabase
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }); // Ordena del más antiguo al más reciente

  if (error) {
    console.error('Error al obtener el historial:', error.message);
    return [];
  }
  return data as RegistroEmocion[];
};

/**
 * FUNCIÓN 3: Obtener recomendaciones basadas en el estado de ánimo actual
 */
export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  const { data, error } = await supabase
    .from('recomendaciones')
    .select('*')
    .eq('estado_animo', estadoAnimo)
    .limit(1); // Trae solo una recomendación que coincida

  if (error) {
    console.error('Error al obtener la recomendación:', error.message);
    return null;
  }
  return data && data.length > 0 ? (data[0] as Recomendacion) : null;
};
