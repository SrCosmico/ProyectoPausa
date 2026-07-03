// app/services/emocionesService.ts — Sistema de puntuación numérica de bienestar
import supabase from '@/lib/supabase';
import { RegistroEmocion, Recomendacion } from '@/app/types';
import { ESTADO_A_NIVEL, NIVEL_A_EMOJI, NivelBienestar, obtenerFechaLocalHoy } from '@/models/monitoreo';

const RECOMENDACIONES_DUMMY: Recomendacion[] = [
  { estado_animo: 'bien',    consejo: '¡Vas por buen camino! Sigue con tus hábitos de bienestar.' },
  { estado_animo: 'regular', consejo: 'Prueba una respiración consciente de 5 minutos.' },
  { estado_animo: 'mal',     consejo: 'Tómate un momento para descansar y hablar con alguien de confianza.' },
  { estado_animo: 'triste',  consejo: 'Escribe en tu diario lo que sientes. Liberar emociones ayuda.' },
  { estado_animo: 'ansioso', consejo: 'Realiza el ejercicio 4-7-8 para calmar tu sistema nervioso.' },
];

/** Igual que obtenerFechaLocalHoy() de models/monitoreo.ts pero para N días atrás,
 *  corrigiendo el offset de zona horaria local antes de convertir a "YYYY-MM-DD". */
function obtenerFechaLocalHaceNDias(n: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  const offset = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - offset).toISOString().split('T')[0];
}

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

/**
 * LETRA R: HISTORIAL SEMANAL (ÚNICA FUENTE DE VERDAD)
 * Devuelve solo los registros de los últimos 7 días (incluyendo hoy),
 * ordenados del más reciente al más antiguo. Reemplaza por completo a
 * la versión simulada que existía en lib/supabase/monitoreo.ts.
 */
export const leerHistorialEmocionalSemanal = async (userId: string) => {
  const fechaDesde = obtenerFechaLocalHaceNDias(6); // hoy + 6 atrás = ventana de 7 días
  const fechaHasta = obtenerFechaLocalHoy();

  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId)
    .gte('dia', fechaDesde)
    .lte('dia', fechaHasta)
    .order('dia', { ascending: false });

  if (error) {
    console.error("Error al leer historial semanal:", error);
    return [];
  }
  return data ?? [];
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
  const emojiDinamico = NIVEL_A_EMOJI[registro.nivel];

  const { data, error } = await supabase
    .from('historial_emociones')
    .insert([{
      user_id:  registro.user_id,
      dia:      registro.fecha,
      nivel:    registro.nivel,
      estado:   registro.estado,
      emoji:    emojiDinamico,
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