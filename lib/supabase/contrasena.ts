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
      fecha:     new Date().toISOString(), // ISO -> ordena bien cronológicamente
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

/** Formatea una fecha ISO guardada en Supabase a un string legible en español. */
export function formatearFechaNota(fechaISO: string): string {
  try {
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fechaISO;
  }
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

// ============================================================
// PATRÓN DE BLOQUEO DEL DIARIO
// Guardamos solo un hash SHA-256 del patrón, nunca el patrón en claro.
// ============================================================

/** Calcula el hash SHA-256 (hex) de una secuencia de puntos del patrón. */
export async function hashPatron(patron: number[]): Promise<string> {
  const texto = patron.join('-');
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Devuelve el hash del patrón guardado del usuario, o null si no tiene uno. */
export async function obtenerPatronGuardado(userId: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('patrones_diario')
    .select('patron_hash')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error al leer el patrón guardado:', error.message);
    return null;
  }
  return data?.patron_hash ?? null;
}

/** Crea o actualiza (upsert) el hash del patrón del usuario. */
export async function guardarPatronUsuario(userId: string, patronHash: string) {
  const { error } = await getSupabase()
    .from('patrones_diario')
    .upsert(
      {
        user_id: userId,
        patron_hash: patronHash,
        actualizado_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Error al guardar el patrón:', error.message);
    return { error };
  }
  return { error: null };
}

/** Elimina el patrón guardado del usuario (para "Olvidé mi patrón"). */
export async function eliminarPatronUsuario(userId: string) {
  const { error } = await getSupabase()
    .from('patrones_diario')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error al eliminar el patrón:', error.message);
    return { error };
  }
  return { error: null };
}