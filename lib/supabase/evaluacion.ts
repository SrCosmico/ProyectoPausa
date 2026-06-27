//pantalla evaluacion
import { createClient } from '@/lib/supabase/client';
import {
  type PreguntaPSS4,
  type OpcionRespuestaEstres,
  type RecomendacionDinamica,
} from "@/models/evaluacion";

const supabase = createClient();

export interface ResultadoEvaluacionDB {
  id: string;
  user_id: string;
  puntaje_total: number;
  nivel_estres: "Bajo" | "Moderado" | "Alto";
  respuestas_json: Record<string, number>;
  evaluado_at: string;
}

/**
 * LETRA C: PANTALLA EVALUACIÓN (TEST PSS-4)
 * Persiste el resultado en la tabla `evaluaciones_estres` de Supabase
 * (antes solo escribía en localStorage). Requiere RLS por user_id.
 */
export const insertarResultadoEvaluacionEstres = async (
  userId: string,
  puntajeTotal: number,
  nivelEstres: "Bajo" | "Moderado" | "Alto",
  respuestasIndividuales: Record<string, number>
): Promise<ResultadoEvaluacionDB[]> => {
  const { data, error } = await supabase
    .from('evaluaciones_estres')
    .insert([
      {
        user_id: userId,
        puntaje_total: puntajeTotal,
        nivel_estres: nivelEstres,
        respuestas_json: respuestasIndividuales,
      },
    ])
    .select();

  if (error) {
    console.error('Error al guardar la evaluación PSS-4 en Supabase:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as ResultadoEvaluacionDB[];
};

/** LETRA R: Historial de evaluaciones PSS-4, de la más reciente a la más antigua. */
export const leerHistorialEvaluacionesEstres = async (
  userId: string
): Promise<ResultadoEvaluacionDB[]> => {
  const { data, error } = await supabase
    .from('evaluaciones_estres')
    .select('*')
    .eq('user_id', userId)
    .order('evaluado_at', { ascending: false });

  if (error) {
    console.error('Error al leer evaluaciones PSS-4:', error.message);
    return [];
  }

  return (data ?? []) as ResultadoEvaluacionDB[];
};

// ============================================================
// CRUD: Letra "R" pantalla de evaluacion (PSS-4) — sin cambios
// ============================================================

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

export function leerPreguntasPSS4(): PreguntaPSS4[] {
  return _preguntasPSS4;
}

export function leerPreguntaActualPSS4(paso: number): PreguntaPSS4 | undefined {
  return _preguntasPSS4[paso - 1];
}

export function leerOpcionesRespuestaPSS4(
  preguntaId: string,
  respuestas: Record<string, number>
): (OpcionRespuestaEstres & { seleccionado: boolean })[] {
  return _opcionesPSS4.map((opt) => ({
    ...opt,
    seleccionado: respuestas[preguntaId] === opt.puntosBase,
  }));
}

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