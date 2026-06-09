//pantalla evaluacion 
import {
  type PreguntaPSS4,
  type OpcionRespuestaEstres,
  type RecomendacionDinamica,
} from "@/models/evaluacion";
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
  const resultado = {
    user_id: userId,
    puntaje_total: puntajeTotal,
    nivel_estres: nivelEstres,
    respuestas_json: respuestasIndividuales,
    evaluado_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const historial = JSON.parse(
      localStorage.getItem(`evaluaciones_estres_${userId}`) ?? '[]'
    ) as Array<typeof resultado>;
    historial.push(resultado);
    localStorage.setItem(
      `evaluaciones_estres_${userId}`,
      JSON.stringify(historial)
    );
  }

  return [resultado];
};

// ============================================================
// CRUD: Letra "R" pantalla de evaluacion (PSS-4)
// ============================================================

// Datos definidos localmente porque viven en la page, no en models/evaluacion.ts
const _preguntasPSS4: PreguntaPSS4[] = [
  {
    id: "p1",
    enunciado:
      "En el último mes, ¿con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?",
    esInversa: false,
  },
  {
    id: "p2",
    enunciado:
      "En el último mes, ¿con qué frecuencia te has sentido seguro de tu capacidad para manejar tus problemas personales?",
    esInversa: true,
  },
  {
    id: "p3",
    enunciado:
      "En el último mes, ¿con qué frecuencia has sentido que las cosas salían como tú querías?",
    esInversa: true,
  },
  {
    id: "p4",
    enunciado:
      "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulaban tanto que no podías superarlas?",
    esInversa: false,
  },
];

const _opcionesPSS4: OpcionRespuestaEstres[] = [
  { texto: "Nunca",        puntosBase: 0 },
  { texto: "Casi nunca",   puntosBase: 1 },
  { texto: "A veces",      puntosBase: 2 },
  { texto: "A menudo",     puntosBase: 3 },
  { texto: "Muy a menudo", puntosBase: 4 },
];

/** Devuelve las 4 preguntas del test PSS-4. */
export function leerPreguntasPSS4(): PreguntaPSS4[] {
  return _preguntasPSS4;
}

/** Devuelve la pregunta activa del PSS-4 según el paso actual (base 1). */
export function leerPreguntaActualPSS4(paso: number): PreguntaPSS4 | undefined {
  return _preguntasPSS4[paso - 1];
}

/** Devuelve las opciones de respuesta del PSS-4 marcando cuál seleccionó el usuario. */
export function leerOpcionesRespuestaPSS4(
  preguntaId: string,
  respuestas: Record<string, number>
): (OpcionRespuestaEstres & { seleccionado: boolean })[] {
  return _opcionesPSS4.map((opt) => ({
    ...opt,
    seleccionado: respuestas[preguntaId] === opt.puntosBase,
  }));
}

/**
 * Calcula el puntaje PSS-4 (aplica inversión donde corresponde) y
 * devuelve el nivel de estrés percibido con sus recomendaciones.
 */
export function leerResultadoPSS4(respuestas: Record<string, number>): {
  puntaje: number;
  nivel: "Bajo" | "Moderado" | "Alto";
  porcentajeBarra: string;
  recomendaciones: RecomendacionDinamica[];
} {
  let total = 0;
  _preguntasPSS4.forEach((p) => {
    const pts = respuestas[p.id] ?? 0;
    total += p.esInversa ? 4 - pts : pts;
  });

  if (total <= 5) {
    return {
      puntaje: total,
      nivel: "Bajo",
      porcentajeBarra: "15%",
      recomendaciones: [
        { icono: "🌱", texto: "Registra tu gratitud de hoy en tu diario personal" },
        { icono: "🚀", texto: "¡Gran balance! Sigue manteniendo tus hábitos actuales" },
      ],
    };
  }

  if (total <= 12) {
    return {
      puntaje: total,
      nivel: "Moderado",
      porcentajeBarra: "52%",
      recomendaciones: [
        { icono: "🧘", texto: "Prueba una meditación de 5 minutos" },
        { icono: "🍃", texto: "Revisa tus técnicas anti-estrés" },
      ],
    };
  }

  return {
    puntaje: total,
    nivel: "Alto",
    porcentajeBarra: "88%",
    recomendaciones: [
      { icono: "😮‍💨", texto: "Realiza una respiración consciente profunda ahora" },
      { icono: "🚨", texto: "Prueba el modo crisis para asistencia inmediata" },
    ],
  };
}
