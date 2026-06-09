// pantalla meditacion
import { createClient } from '../supabase';

type SessionType = 'respiracion' | 'meditacion';
/**
 * LETRA C: PANTALLA MEDITACIÓN Y RESPIRACIÓN
 * Registra una sesión de relajación o respiración completada con éxito
 * para el seguimiento de minutos de bienestar acumulados por el alumno.
 */
export async function insertarSesionBienestarCompletada(userId: string,
    tipoPractica: SessionType, // "respiracion" | "meditacion"
    duracionMinutos: number // 2, 5, 10, 15, 20
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('historial_sesiones_bienestar') // Tabla asignada para el registro de minutos acumulados
        .insert({
            user_id: userId,
            tipo: tipoPractica,
            duracion_minutos: duracionMinutos,
            completado_at: new Date().toISOString()
        })
        .select();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}


//U

// Función de UPDATE para finalizar sesión de meditación

async function finalizarSesionMeditacion(sesionId: string, tiempoReal: number) {
  const supabase = createClient();
  
  // Realizamos el update cambiando el estado a 'completada' 
  // y guardando el tiempo real de meditación.
  // CRÍTICO: .eq() es obligatorio para afectar SOLO esta sesión.
  const { data, error } = await supabase
    .from('meditaciones')
    .update({ 
      estado: 'completada', 
      duracion_real: tiempoReal 
    })
    .eq('id', sesionId); // Filtro obligatorio según "WhatsApp Image 2026-06-08 at 4.56.27 PM.jpeg"
    
  return { data, error };
}