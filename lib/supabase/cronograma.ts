import { createClient } from '@/lib/supabase/client';
import { EstadoEmocionalId } from '@/models/estadoActual';
import { type BloqueHorario } from '@/models/cronograma';

const getSupabase = () => createClient();

// ── Helpers DELATE (operan sobre estado local, sin BD) ─────────────────────
export const deleteSelectedDay = (days: string[], day: string) =>
  days.filter((d) => d !== day);

export const deleteSelectedActivity = (activities: string[], activity: string) =>
  activities.filter((a) => a !== activity);

interface CronogramaActivity { id: string; name: string; location?: string; startTime: string; endTime: string; }

export const deleteCronogramaActivity = (
  activities: CronogramaActivity[],
  id: string
): CronogramaActivity[] => activities.filter((a) => a.id !== id);

// ── C — Insertar actividad en actividades_cronograma ──────────────────────
export const insertarCronogramaActividad = async (
  userId: string,
  cronogramaId: string,
  titulo: string,
  ubicacion: string,
  tipoActividad: string
) => {
  const { data, error } = await getSupabase()
    .from('actividades_cronograma')
    .insert([{
      user_id:        userId,
      cronograma_id:  cronogramaId,
      titulo:         titulo.trim() || 'Actividad sin título',
      ubicacion:      ubicacion.trim() || null,
      tipo_actividad: tipoActividad,
    }])
    .select();

  if (error) {
    console.error('Error al insertar actividad de cronograma:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── C — Estado emocional del cuestionario (paso 2) ────────────────────────
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const { data, error } = await getSupabase()
    .from('cuestionario_onboarding')
    .upsert({ user_id: userId, estado_emocional_id: estadoId }, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('Error al guardar estado emocional en onboarding:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
};

// ── R — Bloques de ejemplo (datos estáticos de presentación) ──────────────
const _bloquesCronograma: BloqueHorario[] = [
  { id: '1', hora: '07:00', titulo: 'Cálculo diferencial', subtitulo: 'Aula 201 (07:00 - 08:30)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: '2', hora: '09:00', titulo: 'Física I',            subtitulo: 'Aula 102 (08:40 - 10:10)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: '3', hora: '10:30', titulo: 'Estudio personal',   subtitulo: 'Repaso de ejercicios',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: '4', hora: '12:00', titulo: 'Almuerzo',           subtitulo: 'Descanso y comida',          color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: '5', hora: '13:00', titulo: 'Química general',    subtitulo: 'Lab 3 (13:10 - 14:40)',      color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export const leerBloquesCronograma   = (): BloqueHorario[]           => _bloquesCronograma;
export const leerBloquePorId          = (id: string)                  => _bloquesCronograma.find((b) => b.id === id);
export const leerBloquesPorTipo       = (tipo: string): BloqueHorario[] =>
  _bloquesCronograma.filter((b) => b.titulo.toLowerCase().includes(tipo.toLowerCase()));

// ── U — Sin tabla dedicada aún (no-op documentado) ───────────────────────
export async function actualizarTarea(
  tareaId: string,
  nuevosDatos: { hora?: string; estado?: string; descripcion?: string }
) {
  console.warn('[cronograma] actualizarTarea requiere tabla tareas_cronograma. Pendiente de crear.', tareaId, nuevosDatos);
  return { data: null, error: null };
}