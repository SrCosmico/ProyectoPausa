// pantalla frecuencia
import { FrecuenciaId } from "@/models/frecuencia";
import { createClient } from "../supabase";
import {
  opcionesFrecuenciaData,
  type OpcionFrecuencia,
} from "@/models/frecuencia";
/**
 * LETRA C: PANTALLA FRECUENCIA (PASO 5)
 * Almacena la respuesta del usuario referente a la frecuencia de sus síntomas de estrés o ansiedad.
 */
export const insertarFrecuenciaEstresAnsiedad = async (
  userId: string,
  frecuenciaId: FrecuenciaId
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('respuestas_cuestionario') // Se asocia a la tabla común de respuestas del perfil inicial
    .insert({
      user_id: userId,
      paso: 5,
      frecuencia_estres_id: frecuenciaId, // Almacena el identificador único: "todos_los_dias", "varias_semana", etc.
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// ============================================================
// CRUD: Letra "R" pantalla de frecuencia
// ============================================================

/** Devuelve las opciones de frecuencia marcando cuál está seleccionada. */
export function leerOpcionesFrecuencia(
  seleccionadoId: FrecuenciaId | null
): OpcionFrecuencia[] {
  return opcionesFrecuenciaData.map((item) => ({
    ...item,
    seleccionado: item.id === seleccionadoId,
  }));
}