import { createClient } from '@/lib/supabase/client';
import { type Nota } from '@/models/contrasena';

const getSupabase = () => createClient();

// Helper DELATE — opera sobre estado local de React (no BD)
export const deleteNota = (notas: Nota[], id: number): Nota[] =>
  notas.filter((n) => n.id !== id);

/** C — Insertar nueva nota en notas_diario */
export const insertarNotaDiario = async (
  userId: string,
  titulo: string,
  contenido: string,
  emojiDia: string | null,
  labelDia: string | null
) => {
  const { data, error } = await getSupabase()
    .from('notas_diario')
    .insert([{
      user_id:   userId,
      titulo:    titulo.trim() || 'Sin título',
      contenido: contenido.trim(),
      emoji_dia: emojiDia,
      label_dia: labelDia,
      fecha:     new Date().toLocaleDateString(),
    }])
    .select();

  if (error) {
    console.error('Error al insertar nota de diario:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

/** R — Sin datos hardcodeados: el fetch real ocurre en el useEffect de la page */
export function leerNotasDiarioInicial(): Nota[] {
  return [];
}

export function leerNotaDiarioPorId(notas: Nota[], id: number): Nota | undefined {
  return notas.find((n) => n.id === id);
}

export function leerNotasDiarioOrdenadas(notas: Nota[]): Nota[] {
  return [...notas].sort((a, b) => b.id - a.id);
}

/** U — Actualizar título y contenido de una nota */
export async function actualizarEntradaDiario(
  diarioId: string,
  nuevoTexto: string,
  nuevoTitulo: string
) {
  const { data, error } = await getSupabase()
    .from('notas_diario')
    .update({ titulo: nuevoTitulo, contenido: nuevoTexto })
    .eq('id', diarioId)
    .select();

  if (error) {
    console.error('Error al actualizar nota de diario:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
}