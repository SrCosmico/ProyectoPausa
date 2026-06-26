import { createClient } from '@/lib/supabase/client';

export interface NotaDiario {
  id: string;          // UUID de Supabase
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji_dia?: string | null;
  label_dia?: string | null;
}

const getSupabase = () => createClient();

/** C — Crear nota en notas_diario */
export const crearNotaDiario = async (
  userId: string,
  titulo: string,
  contenido: string,
  emojiDia?: string | null,
  labelDia?: string | null
): Promise<NotaDiario[]> => {
  const { data, error } = await getSupabase()
    .from('notas_diario')
    .insert([{
      user_id:   userId,
      titulo:    titulo.trim() || 'Sin título',
      contenido: contenido.trim(),
      fecha:     new Date().toISOString(),
      emoji_dia: emojiDia  ?? null,
      label_dia: labelDia  ?? null,
    }])
    .select();

  if (error) throw new Error(error.message);
  return (data ?? []) as NotaDiario[];
};

/** R — Obtener todas las notas de un usuario */
export const obtenerNotasDiario = async (userId: string): Promise<NotaDiario[]> => {
  const { data, error } = await getSupabase()
    .from('notas_diario')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as NotaDiario[];
};

/** U — Actualizar título y contenido de una nota */
export const actualizarNotaDiario = async (
  notaId: string,
  nuevoTitulo: string,
  nuevoContenido: string
): Promise<NotaDiario[]> => {
  const { data, error } = await getSupabase()
    .from('notas_diario')
    .update({ titulo: nuevoTitulo.trim(), contenido: nuevoContenido.trim() })
    .eq('id', notaId)
    .select();

  if (error) throw new Error(error.message);
  return (data ?? []) as NotaDiario[];
};

/** D — Eliminar nota */
export const borrarNotaDiario = async (notaId: string): Promise<boolean> => {
  const { error } = await getSupabase()
    .from('notas_diario')
    .delete()
    .eq('id', notaId);

  if (error) throw new Error(error.message);
  return true;
};