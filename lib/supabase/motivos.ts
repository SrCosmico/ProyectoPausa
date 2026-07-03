import { createClient } from '@/lib/supabase/client';
import { opcionesMotivosData, type OpcionMotivo } from '@/models/motivos';

const getSupabase = () => createClient();

// Mantiene compatibilidad con import existente en motivos.2
export const deleteItem = (list: string[], item: string): string[] =>
  list.filter((i) => i !== item);

/** C/U — Upsert de motivos en el cuestionario de onboarding */
export const insertarMotivosOnboarding = async (
  userId: string,
  motivosSeleccionados: string[],
  otroTextoEspecificado?: string
) => {
  const { data, error } = await getSupabase()
    .from('cuestionario_onboarding')
    .upsert(
      {
        user_id:      userId,
        motivos:      motivosSeleccionados,
        otro_motivo:  otroTextoEspecificado ?? null,
      },
      { onConflict: 'user_id' }
    )
    .select();

  if (error) {
    console.error('Error al guardar motivos de onboarding:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── R ─────────────────────────────────────────────────────────────────────

const _iconosMotivos: Record<string, string> = {
  estres:     '🧘',
  bienestar:  '🌸',
  dormir:     '🌙',
  academico:  '📚',
  motivacion: '✨',
  otro:       '✏️',
};

export function leerOpcionesMotivos(seleccionados: Record<string, boolean>): OpcionMotivo[] {
  return opcionesMotivosData.map((item) => ({
    ...item,
    icono:       _iconosMotivos[item.id] ?? '❓',
    seleccionado: seleccionados[item.id] ?? false,
  }));
}