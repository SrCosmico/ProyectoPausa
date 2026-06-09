import { EstadoEmocionalId } from "@/models/estadoActual";
import { createClient } from "../supabase";
import {
  opcionesEstadoData,
  type OpcionEstadoActual,
} from "@/models/estadoActual";

//Pantalla estadoactual
/**
 * LETRA C: PANTALLA ESTADO ACTUAL (PASO 2)
 * Registra la respuesta del usuario sobre cómo se ha sentido últimamente en el cuestionario de diagnóstico inicial.
 */
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('respuestas_cuestionario') // Nombre sugerido para la tabla de respuestas generales o perfil inicial
    .insert({
      user_id: userId,
      paso: 2,
      estado_emocional_id: estadoId, // Almacena el ID seleccionado: "muy_mal", "mal", "regular", "bien", "muy_bien"
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// ============================================================
// CRUD: Letra "R" pantalla de estadoActual
// ============================================================

/** Devuelve las opciones del estado emocional marcando cuál está seleccionada. */
export function leerOpcionesEstadoActual(
  seleccionadoId: EstadoEmocionalId
): OpcionEstadoActual[] {
  return opcionesEstadoData.map((opt) => ({
    ...opt,
    seleccionado: opt.id === seleccionadoId,
  }));
}

/**
 * Lee desde localStorage la selección de estado emocional previa del usuario.
 * Útil para pre-seleccionar si el usuario regresa a la pantalla.
 */
export function leerSeleccionEstadoActualGuardada(): EstadoEmocionalId | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("estadoActualId") as EstadoEmocionalId) ?? null;
}