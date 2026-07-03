import { createClient } from '@/lib/supabase/client';
import { EstadoEmocionalId, opcionesEstadoData, type OpcionEstadoActual } from '@/models/estadoActual';

const getSupabase = () => createClient();

/** C/U — Upsert del estado emocional en el cuestionario de onboarding */
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const { data, error } = await getSupabase()
    .from('cuestionario_onboarding')
    .upsert(
      { user_id: userId, estado_emocional_id: estadoId },
      { onConflict: 'user_id' }
    )
    .select();

  if (error) {
    console.error('Error al guardar estado emocional:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── R ─────────────────────────────────────────────────────────────────────

export function leerOpcionesEstadoActual(seleccionadoId: EstadoEmocionalId): OpcionEstadoActual[] {
  return opcionesEstadoData.map((opt) => ({
    ...opt,
    seleccionado: opt.id === seleccionadoId,
  }));
}

/** Sin localStorage: devuelve null; la UI debe leer de Supabase si necesita persistir. */
export function leerSeleccionEstadoActualGuardada(): EstadoEmocionalId | null {
  return null;
}