// pantalla preferencias de apoyo
import { createClient } from "../supabase";
/**
 * LETRA C: PANTALLA PREFERENCIAS DE APOYO
 * Registra los tipos de apoyo seleccionados por el estudiante
 * durante su proceso de inducción y configuración inicial.
 */
export const insertarPreferenciasApoyo = async (
  userId: string,
  preferenciasSeleccionadas: string[] // Arreglo de IDs elegidos (ej: ["ejercicios_calma", "chat_ia"])
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('preferencias_apoyo_usuario') // Tabla asignada para guardar los pilares de apoyo elegidos
    .insert({
      user_id: userId,
      preferencias: preferenciasSeleccionadas,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};