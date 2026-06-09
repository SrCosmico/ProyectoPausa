// pantalla meditacion
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
export async function insertarSesionBienestarCompletada(
  userId: string,
  tipoPractica: SessionType,
  duracionMinutos: number
) {
  const sesion = {
    user_id: userId,
    tipo: tipoPractica,
    duracion_minutos: duracionMinutos,
    completado_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const historial = JSON.parse(
      localStorage.getItem(`sesiones_bienestar_${userId}`) ?? '[]'
    ) as Array<typeof sesion & { id: string }>;
    historial.push({ ...sesion, id: Date.now().toString() });
    localStorage.setItem(
      `sesiones_bienestar_${userId}`,
      JSON.stringify(historial)
    );
    return historial;
  }

  return [sesion];
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
  if (typeof window !== 'undefined') {
    const sesiones = JSON.parse(
      localStorage.getItem('meditaciones_sesiones') ?? '[]'
    ) as Array<{ id: string; estado: string; duracion_real: number }>;
    const actualizadas = sesiones.map((s) =>
      s.id === sesionId
        ? { ...s, estado: 'completada', duracion_real: tiempoReal }
        : s
    );
    localStorage.setItem('meditaciones_sesiones', JSON.stringify(actualizadas));
    return { data: actualizadas, error: null };
  }
  return { data: null, error: null };
}

export { finalizarSesionMeditacion };