//PANTALLA comoTesienteshoy
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
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[new Date().getDay()];

  const registro = {
    user_id: userId,
    estado: estado.toLowerCase(),
    comentario: comentario.trim() || null,
    dia: diaActual,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const historial = JSON.parse(
      localStorage.getItem('historial_emociones_local') ?? '[]'
    ) as Array<typeof registro & { id: number }>;
    historial.push({ ...registro, id: Date.now() });
    localStorage.setItem('historial_emociones_local', JSON.stringify(historial));
    localStorage.setItem('fechaUltimoRegistro', new Date().toLocaleDateString());
    return historial;
  }

  return [registro];
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


