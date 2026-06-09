// pantalla motivos
import { createClient } from "../supabase";
/**
 * LETRA C: PANTALLA MOTIVOS
 * Registra por primera vez los motivos seleccionados por el estudiante
 * durante su proceso de inducción u onboarding en la aplicación.
 */
export const insertarMotivosOnboarding = async (
  userId: string,
  motivosSeleccionados: string[], // Arreglo de los IDs seleccionados (ej: ["estres", "dormir"])
  otroTextoEspecificado?: string  // Texto opcional en caso de marcar "Otro"
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('motivos_registro_usuario') // Tabla asignada para capturar las preferencias de onboarding
    .insert({
      user_id: userId,
      motivos: motivosSeleccionados,
      otro_motivo_texto: otroTextoEspecificado || null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};