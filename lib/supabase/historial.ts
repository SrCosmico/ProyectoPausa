import { createClient } from '@/lib/supabase/client';

const getSupabase = () => createClient();

export interface RegistroEmocionalCalendario {
  id: number;
  user_id: string;
  dia: string; // texto en formato YYYY-MM-DD
  estado: string;
  nivel: number;
  emoji: string | null;
  nota: string | null;
}

/** Lee el historial emocional de un usuario dentro de un rango de fechas (para el calendario mensual). */
export async function leerHistorialEmocionalPorRango(
  userId: string,
  fechaDesde: string,
  fechaHasta: string
): Promise<RegistroEmocionalCalendario[]> {
  const { data, error } = await getSupabase()
    .from('historial_emociones')
    .select('*')
    .eq('user_id', userId)
    .gte('dia', fechaDesde)
    .lte('dia', fechaHasta)
    .order('dia', { ascending: true });

  if (error) {
    console.error('Error al leer historial emocional por rango:', error.message);
    return [];
  }

  return (data ?? []) as RegistroEmocionalCalendario[];
}