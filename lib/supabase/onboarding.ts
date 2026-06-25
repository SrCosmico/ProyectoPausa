// ============================================================
// Onboarding: acumula las respuestas del cuestionario en localStorage
// mientras el usuario navega entre pantallas (motivos.2 → ... → confirmacion.2)
// y las persiste como metadata del usuario en Supabase al finalizar.
// ============================================================

import { createClient } from '@/lib/supabase/client';

const PREFIX = 'onboarding_';

export interface OnboardingMetadata {
  onboarding_completado: boolean;
  motivos_principales: string[];
  motivo_otro_texto?: string | null;
  estado_actual?: string | null;
  factores_impacto: string[];
  factor_otro_texto?: string | null;
  preferencias_apoyo: string[];
  frecuencia_estres?: string | null;
  completado_at: string;
}

function guardarPaso(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
}

function leerPaso<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const guardarMotivosOnboarding = (motivos: string[], otroTexto?: string) => {
  guardarPaso('motivos', motivos);
  guardarPaso('motivo_otro', otroTexto ?? '');
};

export const guardarEstadoActualOnboarding = (estadoId: string) => {
  guardarPaso('estado_actual', estadoId);
};

export const guardarFactoresOnboarding = (factores: string[], otroTexto?: string) => {
  guardarPaso('factores', factores);
  guardarPaso('factor_otro', otroTexto ?? '');
};

export const guardarPreferenciasOnboarding = (preferencias: string[]) => {
  guardarPaso('preferencias', preferencias);
};

export const guardarFrecuenciaOnboarding = (frecuenciaId: string) => {
  guardarPaso('frecuencia', frecuenciaId);
};

/** Junta todo lo acumulado en localStorage en un solo objeto de metadata. */
export function construirMetadataOnboarding(): OnboardingMetadata {
  return {
    onboarding_completado: true,
    motivos_principales: leerPaso<string[]>('motivos', []),
    motivo_otro_texto: leerPaso<string>('motivo_otro', '') || null,
    estado_actual: leerPaso<string | null>('estado_actual', null),
    factores_impacto: leerPaso<string[]>('factores', []),
    factor_otro_texto: leerPaso<string>('factor_otro', '') || null,
    preferencias_apoyo: leerPaso<string[]>('preferencias', []),
    frecuencia_estres: leerPaso<string | null>('frecuencia', null),
    completado_at: new Date().toISOString(),
  };
}

/** Persiste la metadata acumulada en Supabase Auth (user_metadata). */
export async function guardarOnboardingEnSupabase(): Promise<{ error: string | null }> {
  const supabase = createClient();
  const metadata = construirMetadataOnboarding();

  const { error } = await supabase.auth.updateUser({ data: metadata });

  if (!error) {
    limpiarOnboardingLocal();
  }

  return { error: error?.message ?? null };
}

/** Borra las respuestas temporales una vez persistidas en Supabase. */
export function limpiarOnboardingLocal() {
  if (typeof window === 'undefined') return;
  ['motivos', 'motivo_otro', 'estado_actual', 'factores', 'factor_otro', 'preferencias', 'frecuencia'].forEach(
    (k) => localStorage.removeItem(`${PREFIX}${k}`)
  );
}