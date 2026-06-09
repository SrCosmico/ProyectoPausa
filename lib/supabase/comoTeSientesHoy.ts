//PANTALLA comoTesienteshoy

import { EstadoEmocionalId } from "@/models/estadoActual";
import { createClient } from "../supabase";
import { FrecuenciaId } from "@/models/frecuencia";
import { FactorId } from "@/models/factoresImpacto";
import { NivelEmocional } from "@/models/home";

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
