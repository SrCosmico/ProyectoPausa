//PANTALLA comoTesienteshoy
import { createClient } from "../supabase";
import {
  opcionesEmocionalesData,
  herramientasSugeridasData,
  type NivelEmocionalHoy,
  type OpcionEmocionalHoy,
  type HerramientaSugerida,
} from "@/models/comoTeSientesHoy";


/**
 * LETRA C: PANTALLA CÓMO TE SIENTES HOY
 * Inserta el estado de ánimo seleccionado y el comentario opcional en la tabla 'historial_emociones'.
 */
export const insertarEstadoEmocional = async (userId: string, estado: string, comentario: string) => {
  const supabase = createClient();

  // Obtenemos de forma automática el día actual de la semana en español
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[new Date().getDay()];

  const { data, error } = await supabase
    .from('historial_emociones') // Nombre sugerido para la tabla en Supabase
    .insert({
      user_id: userId,
      estado: estado.toLowerCase(), // Se estandariza a minúsculas
      comentario: comentario.trim() || null, // Guarda null si el campo está vacío
      dia: diaActual
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// ============================================================
// CRUD: Letra "R" pantalla de comoTeSientesHoy
// ============================================================

/** Devuelve las opciones emocionales del check-in marcando cuál está activa. */
export function leerOpcionesComoTeSientesHoy(
  estadoSeleccionado: NivelEmocionalHoy | null
): OpcionEmocionalHoy[] {
  return opcionesEmocionalesData.map((opt) => ({
    ...opt,
    seleccionado: opt.estado === estadoSeleccionado,
  }));
}

/**
 * Determina si la acción del usuario será "Guardar" (primera vez hoy)
 * o "Actualizar" (ya existe un registro del día).
 */
export function leerEsActualizacionEmocionalHoy(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("fechaUltimoRegistro") ===
    new Date().toLocaleDateString()
  );
}

/** Devuelve las herramientas sugeridas para la pantalla de check-in. */
export function leerHerramientasSugeridasHoy(): HerramientaSugerida[] {
  return herramientasSugeridasData;
}


