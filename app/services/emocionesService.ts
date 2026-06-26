// app/services/emocionesService.ts
import supabase from '@/lib/supabase';
import { RegistroEmocion, Recomendacion } from '@/app/types';
import { NIVEL_A_EMOJI, NivelBienestar } from '@/models/monitoreo';

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
  if (error) console.error('Error de Supabase:', error);
  return { success: !error, data, error };
};

export const obtenerHistorialUsuario = async (userId: string) => {
  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
  return data ?? [];
};

export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  return (
    RECOMENDACIONES_DUMMY.find((r) => r.estado_animo === estadoAnimo.toLowerCase())
    ?? RECOMENDACIONES_DUMMY[0]
  );
};

// ── TAREA 2: filtro 7 días + orden descendente ──────────────────────────────
export const leerHistorialEmocionalSemanal = async (userId: string) => {
  const hace7dias = new Date();
  hace7dias.setDate(hace7dias.getDate() - 7);
  const fechaInicio = hace7dias.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const { data, error } = await supabase
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId)
    .gte('dia', fechaInicio)                               // solo últimos 7 días
    .order('created_at', { ascending: false });            // más reciente primero

  if (error) {
    console.error('Error al leer historial semanal:', error);
    return [];
  }
  return data ?? [];
};

// ── TAREA 1: UPSERT para evitar duplicados por (user_id, dia) ───────────────
// Requiere en BD: UNIQUE(user_id, dia)  →  ver comentario de migración en repo.
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
    .upsert(
      [{
        user_id: registro.user_id,
        dia:     registro.fecha,
        nivel:   registro.nivel,
        estado:  registro.estado,
        emoji:   emojiDinamico,
        nota:    registro.nota ?? null,
      }],
      { onConflict: 'user_id,dia' }   // actualiza si ya existe el par
    )
    .select();

  if (error) {
    console.error('Error en upsert historial_emociones:', JSON.stringify(error, null, 2));
  }
  return { data, error };
};

export const eliminarRegistroEmocional = async (id: string) => {
  const { error } = await supabase
    .from('historial_emociones')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error al eliminar registro:', JSON.stringify(error, null, 2));
    return false;
  }
  return true;
};

export const actualizarRegistroEmocional = async (
  id: string,
  cambios: {
    fecha?: string;
    nivel?: NivelBienestar;
    estado?: string;
    nota?: string | null;
  }
) => {
  const emojiDinamico = cambios.nivel ? NIVEL_A_EMOJI[cambios.nivel] : undefined;

  const { data, error } = await supabase
    .from('historial_emociones')
    .update({
      dia:    cambios.fecha,
      nivel:  cambios.nivel,
      estado: cambios.estado,
      ...(emojiDinamico ? { emoji: emojiDinamico } : {}),
      nota:   cambios.nota,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error al actualizar:', JSON.stringify(error, null, 2));
  }
  return { data, error };
};