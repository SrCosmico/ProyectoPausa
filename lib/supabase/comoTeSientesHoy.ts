//PANTALLA comoTesienteshoy
import supabase from '@/lib/supabase';
import { ESTADO_A_NIVEL, NIVEL_A_EMOJI } from '@/models/monitoreo';
import {
  opcionesEmocionalesData,
  herramientasSugeridasData,
  type NivelEmocionalHoy,
  type OpcionEmocionalHoy,
  type HerramientaSugerida,
} from "@/models/comoTeSientesHoy";

export interface ResultadoGuardadoEmocional {
  error: string | null;
  fueActualizacion: boolean;
}

/** Devuelve la fecha local de hoy en formato YYYY-MM-DD (mismo formato usado en monitoreo.2). */
function obtenerFechaLocalHoy(): string {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().split('T')[0];
}

/**
 * LETRA C/U: PANTALLA CÓMO TE SIENTES HOY
 * Realiza un "upsert" manual contra `historial_emociones`:
 * - Si ya existe un registro para este user_id en la fecha de hoy → lo actualiza.
 * - Si no existe → inserta uno nuevo.
 */
export const insertarEstadoEmocional = async (
  userId: string,
  estado: NivelEmocionalHoy,
  comentario: string
): Promise<ResultadoGuardadoEmocional> => {
  const hoy = obtenerFechaLocalHoy();
  const nivel = ESTADO_A_NIVEL[estado];
  const emoji = NIVEL_A_EMOJI[nivel];
  const notaLimpia = comentario.trim() || null;

  try {
    // 1. Buscar si ya existe un registro de hoy para este usuario
    const { data: registroExistente, error: errorBusqueda } = await supabase
      .from('historial_emociones')
      .select('id')
      .eq('user_id', userId)
      .eq('dia', hoy)
      .maybeSingle();

    if (errorBusqueda) {
      console.error('Error al buscar registro emocional de hoy:', errorBusqueda.message);
      return { error: errorBusqueda.message, fueActualizacion: false };
    }

    if (registroExistente) {
      // 2a. UPDATE: ya existe un check-in hoy, lo actualizamos
      const { error: errorUpdate } = await supabase
        .from('historial_emociones')
        .update({ estado, nivel, emoji, nota: notaLimpia })
        .eq('id', registroExistente.id);

      if (errorUpdate) {
        console.error('Error al actualizar estado emocional:', errorUpdate.message);
        return { error: errorUpdate.message, fueActualizacion: false };
      }

      return { error: null, fueActualizacion: true };
    }

    // 2b. INSERT: no había registro de hoy todavía
    const { error: errorInsert } = await supabase
      .from('historial_emociones')
      .insert([
        {
          user_id: userId,
          dia: hoy,
          estado,
          nivel,
          emoji,
          nota: notaLimpia,
        },
      ]);

    if (errorInsert) {
      console.error('Error al insertar estado emocional:', errorInsert.message);
      return { error: errorInsert.message, fueActualizacion: false };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString());
    }

    return { error: null, fueActualizacion: false };
  } catch (err) {
    console.error('Error inesperado al guardar estado emocional:', err);
    return { error: 'Ocurrió un error inesperado. Intenta de nuevo.', fueActualizacion: false };
  }
};

// ============================================================
// CRUD: Letra "R" pantalla de comoTeSientesHoy — sin cambios
// ============================================================

export function leerOpcionesComoTeSientesHoy(
  estadoSeleccionado: NivelEmocionalHoy | null
): OpcionEmocionalHoy[] {
  return opcionesEmocionalesData.map((opt) => ({
    ...opt,
    seleccionado: opt.estado === estadoSeleccionado,
  }));
}

export function leerEsActualizacionEmocionalHoy(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("fechaUltimoRegistro") ===
    new Date().toLocaleDateString()
  );
}

export function leerHerramientasSugeridasHoy(): HerramientaSugerida[] {
  return herramientasSugeridasData;
}