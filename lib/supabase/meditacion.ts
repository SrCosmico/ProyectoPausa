import { createClient } from '@/lib/supabase/client';
import {
  opcionesSesionData,
  meditacionFrasesData,
  duracionesDisponibles,
  type OpcionSesion,
  type FraseMeditacion,
} from '@/models/meditacion';

type SessionType = 'respiracion' | 'meditacion';

const getSupabase = () => createClient();

/** C — Registrar sesión completada en sesiones_bienestar */
export async function insertarSesionBienestarCompletada(
  userId: string,
  tipoPractica: SessionType,
  duracionMinutos: number
) {
  const { data, error } = await getSupabase()
    .from('sesiones_bienestar')
    .insert([{
      user_id:          userId,
      tipo:             tipoPractica,
      duracion_minutos: duracionMinutos,
    }])
    .select();

  if (error) {
    console.error('Error al guardar sesión de bienestar:', error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

// ============================================================
// R — Helpers de solo lectura
// ============================================================

export function leerOpcionesSesionMeditacion(): OpcionSesion[] {
  return opcionesSesionData;
}

export function leerConfiguracionSesion(tipo: SessionType): OpcionSesion | undefined {
  return opcionesSesionData.find((s) => s.id === tipo);
}

export function leerDuracionesDisponibles(): number[] {
  return duracionesDisponibles;
}

export function leerFraseMeditacionActual(indice: number): FraseMeditacion {
  return meditacionFrasesData[indice % meditacionFrasesData.length];
}

/** U — La tabla actual no tiene columna 'estado'; función no-op para compatibilidad */
export async function finalizarSesionMeditacion(sesionId: string, tiempoReal: number) {
  console.info(`[meditacion] Sesión ${sesionId} finalizada en ${tiempoReal}s (sin tabla de estado)`);
  return { data: null, error: null };
}