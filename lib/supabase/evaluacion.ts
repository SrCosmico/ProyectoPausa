//pantalla evaluacion 
import { createClient } from "../supabase";

/**
 * LETRA C: PANTALLA EVALUACIÓN (TEST PSS-4)
 * Almacena de manera permanente el puntaje total obtenido, el nivel de estrés clasificado
 * y la clave-valor de las respuestas individuales para el seguimiento clínico e histórico.
 */
export const insertarResultadoEvaluacionEstres = async (
  userId: string,
  puntajeTotal: number,
  nivelEstres: "Bajo" | "Moderado" | "Alto",
  respuestasIndividuales: Record<string, number>
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('evaluaciones_estres') // Nombre recomendado para la tabla de tests psicológicos históricos
    .insert({
      user_id: userId,
      puntaje_total: puntajeTotal,       // De 0 a 16 puntos
      nivel_estres: nivelEstres,         // "Bajo", "Moderado" o "Alto"
      respuestas_json: respuestasIndividuales, // Guarda un objeto como { p1: 2, p2: 1, p3: 4, p4: 0 }
      evaluado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
