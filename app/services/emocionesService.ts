// app/services/emocionesService.ts
import supabase from '@/lib/supabase'; // Asegúrate de que esta ruta sea correcta

import { RegistroEmocion, Recomendacion } from '@/app/types';

const RECOMENDACIONES_DUMMY: Recomendacion[] = [
  { id: 1, created_at: '', estado_animo: 'bien', consejo: '¡Vas por buen camino! Sigue con tus hábitos de bienestar.' },
  { id: 2, created_at: '', estado_animo: 'regular', consejo: 'Prueba una respiración consciente de 5 minutos.' },
  { id: 3, created_at: '', estado_animo: 'mal', consejo: 'Tómate un momento para descansar y hablar con alguien de confianza.' },
  { id: 4, created_at: '', estado_animo: 'triste', consejo: 'Escribe en tu diario lo que sientes. Liberar emociones ayuda.' },
  { id: 5, created_at: '', estado_animo: 'ansioso', consejo: 'Realiza el ejercicio 4-7-8 para calmar tu sistema nervioso.' },
];

/**
 * FUNCIÓN 1: Guardar una nueva emoción en Supabase
 */
export const guardarEmocion = async (emocion: RegistroEmocion) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{ 
        user_id: emocion.user_id, 
        dia: emocion.dia, // Asegúrate de que coincida con el nombre en tu tabla
        estado: emocion.estado, 
        valor_numerico: emocion.valor_numerico 
    }])
    .select();
  
  return { success: !error, data, error };
};

/**
 * FUNCIÓN 2: Obtener todo el historial de un usuario desde Supabase
 */
export const obtenerHistorialUsuario = async (userId: string) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
    
  return data ?? [];
};

/**
 * FUNCIÓN 3: Obtener recomendaciones (se mantiene igual por ahora)
 */
export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  const recomendacion = RECOMENDACIONES_DUMMY.find(
    (r) => r.estado_animo === estadoAnimo.toLowerCase()
  );
  return recomendacion ?? RECOMENDACIONES_DUMMY[0];
};