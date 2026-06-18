// app/services/emocionesService.ts — Sistema de puntuación numérica de bienestar
import supabase from '@/lib/supabase';
import { RegistroEmocion, Recomendacion } from '@/app/types';
import { ESTADO_A_NIVEL, NIVEL_A_EMOJI, NivelBienestar } from '@/models/monitoreo';

const RECOMENDACIONES_DUMMY: Recomendacion[] = [
  { estado_animo: 'bien',    consejo: '¡Vas por buen camino! Sigue con tus hábitos de bienestar.' },
  { estado_animo: 'regular', consejo: 'Prueba una respiración consciente de 5 minutos.' },
  { estado_animo: 'mal',     consejo: 'Tómate un momento para descansar y hablar con alguien de confianza.' },
  { estado_animo: 'triste',  consejo: 'Escribe en tu diario lo que sientes. Liberar emociones ayuda.' },
  { estado_animo: 'ansioso', consejo: 'Realiza el ejercicio 4-7-8 para calmar tu sistema nervioso.' },
];

export const guardarEmocion = async (emocion: RegistroEmocion) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{
      user_id: emocion.user_id,
      dia: emocion.dia,
      estado: emocion.estado,
      valor_numerico: emocion.valor_numerico,
    }])
    .select();

  if (error) console.error("Error de Supabase:", error);
  return { success: !error, data, error };
};

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

export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  const recomendacion = RECOMENDACIONES_DUMMY.find(
    (r) => r.estado_animo === estadoAnimo.toLowerCase()
  );
  return recomendacion ?? RECOMENDACIONES_DUMMY[0];
};

export const leerHistorialEmocionalSemanal = async (userId: string) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error al leer:", error);
    return [];
  }
  return data || [];
};

/**
 * Inserta un registro con nivel numérico (1-5) en lugar de emoji.
 * El emoji se deriva del nivel para mantener compatibilidad visual.
 */
export const insertarRegistros = async (registro: {
  user_id: string;
  fecha: string;
  nivel: NivelBienestar;
  estado: string;
  nota?: string | null;
}) => {
  // Derivamos el emoji del nivel para visualización, pero guardamos el número en la BD
  const emojiDinamico = NIVEL_A_EMOJI[registro.nivel];

  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{
      user_id:  registro.user_id,
      dia:      registro.fecha,
      nivel:    registro.nivel,      // Número 1-5 (clave del sistema)
      estado:   registro.estado,     // Texto legible ("Bien", "Mal", etc.)
      emoji:    emojiDinamico,       // Derivado, nunca guardado manualmente
      nota:     registro.nota ?? null,
    }])
    .select();

  if (error) {
    console.error("Error en Supabase al insertar:", JSON.stringify(error, null, 2));
  }
  return { data, error };
};

export const eliminarRegistroEmocional = async (id: string) => {
  const { error } = await supabase
    .from('historial_emociones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error al eliminar registro:", JSON.stringify(error, null, 2));
    return false;
  }
  return true;
};

export const actualizarRegistroEmocional = async (id: string, cambios: {
  fecha?: string;
  nivel?: NivelBienestar;
  estado?: string;
  nota?: string | null;
}) => {
  // Recalculamos el emoji al actualizar para mantener consistencia
  const emojiDinamico = cambios.nivel ? NIVEL_A_EMOJI[cambios.nivel] : undefined;

  const { data, error } = await supabase
    .from('historial_emociones')
    .update({
      dia:   cambios.fecha,
      nivel: cambios.nivel,
      estado: cambios.estado,
      ...(emojiDinamico ? { emoji: emojiDinamico } : {}),
      nota:  cambios.nota,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error al actualizar:", JSON.stringify(error, null, 2));
  }
  return { data, error };
};