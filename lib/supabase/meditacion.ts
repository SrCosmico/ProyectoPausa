// pantalla meditacion
import { createClient } from '../supabase';
import {
  opcionesSesionData,
  meditacionFrasesData,
  duracionesDisponibles,
  type OpcionSesion,
  type FraseMeditacion,
} from "@/models/meditacion";


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

// ============================================================
// CRUD: Letra "R" pantalla de meditacion
// ============================================================

/** Devuelve las opciones de tipo de sesión disponibles (respiración y meditación). */
export function leerOpcionesSesionMeditacion(): OpcionSesion[] {
  return opcionesSesionData;
}

/** Devuelve la configuración de sesión para el tipo indicado. */
export function leerConfiguracionSesion(tipo: SessionType): OpcionSesion | undefined {
  return opcionesSesionData.find((s) => s.id === tipo);
}

/** Devuelve los valores de duración disponibles para configurar una sesión. */
export function leerDuracionesDisponibles(): number[] {
  return duracionesDisponibles;
}

/**
 * Devuelve la frase de meditación guiada correspondiente al índice de fase.
 * Cicla automáticamente si el índice supera el total de frases.
 */
export function leerFraseMeditacionActual(indice: number): FraseMeditacion {
  return meditacionFrasesData[indice % meditacionFrasesData.length];
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