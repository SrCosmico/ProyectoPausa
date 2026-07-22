import { createClient } from '@/lib/supabase/client';
import type {
  Materia,
  NivelDificultad,
  Parcial,
  ParcialConMateria,
  TipoParcial,
} from '@/models/cronogramaAcademico';

const getSupabase = () => createClient();

// ============================================================
// MATERIAS
// ============================================================

export async function crearMateria(
  userId: string,
  nombre: string,
  dificultad: NivelDificultad,
  color: string
): Promise<{ data: Materia | null; error: string | null }> {
  const { data, error } = await getSupabase()
    .from('materias')
    .insert([{ user_id: userId, nombre: nombre.trim(), dificultad, color }])
    .select()
    .single();

  if (error) {
    console.error('Error al crear materia:', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Materia, error: null };
}

export async function leerMateriasUsuario(userId: string): Promise<Materia[]> {
  const { data, error } = await getSupabase()
    .from('materias')
    .select('*')
    .eq('user_id', userId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al leer materias:', error.message);
    return [];
  }
  return (data ?? []) as Materia[];
}

export async function actualizarMateria(
  materiaId: string,
  cambios: Partial<Pick<Materia, 'nombre' | 'dificultad' | 'color'>>
): Promise<{ error: string | null }> {
  const { error } = await getSupabase()
    .from('materias')
    .update(cambios)
    .eq('id', materiaId);

  if (error) console.error('Error al actualizar materia:', error.message);
  return { error: error?.message ?? null };
}

export async function eliminarMateria(materiaId: string): Promise<{ error: string | null }> {
  const { error } = await getSupabase().from('materias').delete().eq('id', materiaId);
  if (error) console.error('Error al eliminar materia:', error.message);
  return { error: error?.message ?? null };
}

// ============================================================
// PARCIALES
// ============================================================

export async function crearParcial(
  userId: string,
  materiaId: string,
  titulo: string,
  fecha: string,
  tipo: TipoParcial,
  peso: NivelDificultad,
  notas?: string
): Promise<{ data: Parcial | null; error: string | null }> {
  const { data, error } = await getSupabase()
    .from('parciales')
    .insert([{
      user_id: userId,
      materia_id: materiaId,
      titulo: titulo.trim() || 'Sin título',
      fecha,
      tipo,
      peso,
      notas: notas?.trim() || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error al crear parcial:', error.message);
    return { data: null, error: error.message };
  }
  return { data: data as Parcial, error: null };
}

/** Trae todos los parciales del usuario, con su materia embebida. */
export async function leerParcialesConMateria(userId: string): Promise<ParcialConMateria[]> {
  const { data, error } = await getSupabase()
    .from('parciales')
    .select('*, materia:materias(*)')
    .eq('user_id', userId)
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error al leer parciales:', error.message);
    return [];
  }
  return (data ?? []) as unknown as ParcialConMateria[];
}

/** Parciales entre hoy y hoy + `dias`, ordenados por proximidad. */
export async function leerParcialesProximos(
  userId: string,
  dias: number
): Promise<ParcialConMateria[]> {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + dias);

  const fechaHoyISO = hoy.toISOString().split('T')[0];
  const fechaLimiteISO = limite.toISOString().split('T')[0];

  const { data, error } = await getSupabase()
    .from('parciales')
    .select('*, materia:materias(*)')
    .eq('user_id', userId)
    .gte('fecha', fechaHoyISO)
    .lte('fecha', fechaLimiteISO)
    .order('fecha', { ascending: true });

  if (error) {
    console.error('Error al leer parciales próximos:', error.message);
    return [];
  }
  return (data ?? []) as unknown as ParcialConMateria[];
}

export async function actualizarParcial(
  parcialId: string,
  cambios: Partial<Pick<Parcial, 'titulo' | 'fecha' | 'tipo' | 'peso' | 'notas' | 'materia_id'>>
): Promise<{ error: string | null }> {
  const { error } = await getSupabase()
    .from('parciales')
    .update(cambios)
    .eq('id', parcialId);

  if (error) console.error('Error al actualizar parcial:', error.message);
  return { error: error?.message ?? null };
}

export async function eliminarParcial(parcialId: string): Promise<{ error: string | null }> {
  const { error } = await getSupabase().from('parciales').delete().eq('id', parcialId);
  if (error) console.error('Error al eliminar parcial:', error.message);
  return { error: error?.message ?? null };
}