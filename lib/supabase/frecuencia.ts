import { createClient } from '@/lib/supabase/client';
import { FrecuenciaId, opcionesFrecuenciaData, type OpcionFrecuencia } from '@/models/frecuencia';

const getSupabase = () => createClient();

/** C/U — Upsert de frecuencia de estrés en el cuestionario de onboarding */
export const insertarFrecuenciaEstresAnsiedad = async (
  userId: string,
  frecuenciaId: FrecuenciaId
) => {
  const { data, error } = await getSupabase()
    .from('cuestionario_onboarding')
    .upsert(
      { user_id: userId, frecuencia_estres: frecuenciaId },
      { onConflict: 'user_id' }
    )
    .select();

  if (error) {
    console.error('Error al guardar frecuencia de estrés:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── R ─────────────────────────────────────────────────────────────────────

export function leerOpcionesFrecuencia(seleccionadoId: FrecuenciaId | null): OpcionFrecuencia[] {
  return opcionesFrecuenciaData.map((item) => ({
    ...item,
    seleccionado: item.id === seleccionadoId,
  }));
}