import { EstadoEmocionalId } from "@/models/estadoActual";
import { createClient } from "../supabase";

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