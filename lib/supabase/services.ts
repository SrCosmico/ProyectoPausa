import { createClient } from './client';

const supabase = createClient();

// Interface estricta para definir qué es una Nota en TypeScript
export interface NotaDiario {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

// ========================================================
// CAPA DE SERVICIOS: DIARIO EMOCIONAL (CRUD COMPLETO)
// ========================================================

/**
 * LETRA C (Create): Inserta una nueva nota escrita por el alumno
 */
export const crearNotaDiario = async (userId: string, titulo: string, contenido: string): Promise<NotaDiario[]> => {
  const { data, error } = await supabase
    .from('diario_notas')
    .insert({
      user_id: userId,
      titulo: titulo.trim() || 'Sin título',
      contenido: contenido.trim(),
      fecha: new Date().toISOString()
    })
    .select();

  if (error) throw new Error(error.message);
  return data as NotaDiario[];
};

/**
 * LETRA R (Read): Lee todas las notas guardadas de un alumno específico
 */
export const obtenerNotasDiario = async (userId: string): Promise<NotaDiario[]> => {
  const { data, error } = await supabase
    .from('diario_notas')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return data as NotaDiario[];
};

/**
 * LETRA U (Update): Actualiza el título o contenido de una nota existente
 */
export const actualizarNotaDiario = async (notaId: string, nuevoTitulo: string, nuevoContenido: string): Promise<NotaDiario[]> => {
  const { data, error } = await supabase
    .from('diario_notas')
    .update({
      titulo: nuevoTitulo.trim(),
      contenido: nuevoContenido.trim()
    })
    .eq('id', notaId)
    .select();

  if (error) throw new Error(error.message);
  return data as NotaDiario[];
};

/**
 * LETRA D (Delete): Elimina una nota permanentemente mediante su ID
 */
export const borrarNotaDiario = async (notaId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('diario_notas')
    .delete()
    .eq('id', notaId);

  if (error) throw new Error(error.message);
  return true;
};
