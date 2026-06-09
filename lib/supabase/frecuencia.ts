// pantalla frecuencia
import { FrecuenciaId } from "@/models/frecuencia";
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
  const registro = {
    user_id: userId,
    paso: 5,
    frecuencia_estres_id: frecuenciaId,
    creado_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('frecuenciaEstresId', frecuenciaId);
    localStorage.setItem(
      `frecuencia_estres_${userId}`,
      JSON.stringify(registro)
    );
  }

  return [registro];
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