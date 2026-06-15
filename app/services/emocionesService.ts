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

export const guardarEmocion = async (emocion: RegistroEmocion) => {
  console.log("Intentando guardar emoción en Supabase:", emocion);
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{ 
        user_id: emocion.user_id, 
        dia: emocion.dia, 
        estado: emocion.estado, 
        valor_numerico: emocion.valor_numerico 
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

export const insertarRegistros = async (registro: any) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{
      user_id: registro.user_id,
      dia: registro.fecha,        // Mapeo correcto de campos de frontend a base de datos
      nivel: registro.nivel,      
      estado: registro.estado,
      emoji: registro.emoji,
      nota: registro.nota
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

export const actualizarRegistroEmocional = async (id: string, cambios: any) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .update({
      dia: cambios.fecha,   // <-- antes faltaba: si editabas la fecha, no se guardaba
      nivel: cambios.nivel,
      estado: cambios.estado,
      emoji: cambios.emoji,
      nota: cambios.nota
    })
    .eq('id', id)
    .select();
    
  if (error) {
    console.error("Error al actualizar:", JSON.stringify(error, null, 2));
  }
  return { data, error };
};