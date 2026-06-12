// app/services/emocionesService.ts
import supabase from '@/lib/supabase';
import { RegistroEmocion, Recomendacion } from '@/app/types';

const RECOMENDACIONES_DUMMY: Recomendacion[] = [
  { estado_animo: 'bien', consejo: '¡Vas por buen camino! Sigue con tus hábitos de bienestar.' },
  { estado_animo: 'regular', consejo: 'Prueba una respiración consciente de 5 minutos.' },
  { estado_animo: 'mal', consejo: 'Tómate un momento para descansar y hablar con alguien de confianza.' },
  { estado_animo: 'triste', consejo: 'Escribe en tu diario lo que sientes. Liberar emociones ayuda.' },
  { estado_animo: 'ansioso', consejo: 'Realiza el ejercicio 4-7-8 para calmar tu sistema nervioso.' },
];

/**
 * FUNCIÓN 1: Guardar una nueva emoción en Supabase
 */
export const guardarEmocion = async (emocion: RegistroEmocion) => {
  console.log("Intentando guardar emoción en Supabase:", emocion); // <-- AÑADE ESTO
  
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{ 
        user_id: emocion.user_id, 
        dia: emocion.dia, 
        estado: emocion.estado, 
        valor_numerico: emocion.valor_numerico 
    }])
    .select();
  
  if (error) console.error("Error de Supabase:", error); // <-- AÑADE ESTO TAMBIÉN
  
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
 * FUNCIÓN 3: Obtener recomendaciones (estáticas por ahora)
 */
export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  const recomendacion = RECOMENDACIONES_DUMMY.find(
    (r) => r.estado_animo === estadoAnimo.toLowerCase()
  );
  return recomendacion ?? RECOMENDACIONES_DUMMY[0];
};

// Asegúrate de que el parámetro (userId: string) esté presente
export const leerHistorialEmocionalSemanal = async (userId: string) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId); // El filtro es necesario

  if (error) {
    console.error("Error al leer:", error);
    return [];
  }
  return data || [];
};

export const insertarRegistros = async (registro: any) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{
      user_id: registro.user_id,
      dia: registro.fecha,        // <--- CLAVE: El frontend envía 'fecha', BD recibe 'dia'
      nivel: registro.nivel,      // La columna en tu BD es 'nivel'
      estado: registro.estado,
      emoji: registro.emoji,
      nota: registro.nota
    }])
    .select(); // .select() es obligatorio para que te devuelva el ID creado

  if (error) {
    console.error("Error en Supabase:", JSON.stringify(error, null, 2));
  }
  
  return { data, error };
};

// ... mantén tus otras funciones aquí (leerHistorialEmocionalSemanal, etc.)

export const eliminarRegistroEmocional = async (id: string) => {
  const { error } = await supabase
    .from('historial_emociones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error al eliminar registro:", error);
    return false;
  }
  return true;
};