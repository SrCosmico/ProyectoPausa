// app/services/emocionesService.ts
import { supabase } from '@/lib/supabase'; 
import { RegistroEmocion } from '@/app/types';

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