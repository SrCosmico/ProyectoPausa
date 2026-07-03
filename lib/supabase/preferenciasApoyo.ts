import { createClient } from '@/lib/supabase/client';
import {
  opcionesPreferenciasData,
  mapeoIconos as iconosPreferencias,
  type OpcionPreferencia,
} from '@/models/preferenciasApoyo';

const getSupabase = () => createClient();

// Mantiene compatibilidad con import existente en preferenciasApoyo.2
export const deleteItem = (list: string[], item: string): string[] =>
  list.filter((i) => i !== item);

/** C/U — Upsert de preferencias de apoyo en el cuestionario de onboarding */
export const insertarPreferenciasApoyo = async (
  userId: string,
  preferenciasSeleccionadas: string[]
) => {
  const { data, error } = await getSupabase()
    .from('cuestionario_onboarding')
    .upsert(
      { user_id: userId, preferencias: preferenciasSeleccionadas },
      { onConflict: 'user_id' }
    )
    .select();

  if (error) {
    console.error('Error al guardar preferencias de apoyo:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── R ─────────────────────────────────────────────────────────────────────

export function leerOpcionesPreferenciasApoyo(
  seleccionados: Record<string, boolean>
): OpcionPreferencia[] {
  return opcionesPreferenciasData.map((item) => ({
    ...item,
    icono: iconosPreferencias[item.id],
    seleccionado: seleccionados[item.id] ?? false,
  }));
}