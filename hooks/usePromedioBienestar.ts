"use client";

import { useMemo } from "react";
import {
  calcularPromedioUltimos7Dias,
  type RegistroBienestarInput,
} from "@/lib/bienestar/promedio";
import {
  clasificarPromedio,
  obtenerInsightAleatorio,
  FRASES_MOTIVADORAS,
  TIPS_ANIMO_BAJO,
  type ClasificacionBienestar,
  type FraseMotivadora,
  type TipBienestar,
} from "@/models/bienestarInsights";

export interface UsePromedioBienestarResultado {
  /** Promedio exacto (sin redondear), o null si no hay registros en los últimos 7 días */
  promedio: number | null;
  /** Promedio redondeado a 1 decimal, para mostrar en UI */
  promedioRedondeado: number | null;
  cantidadRegistros: number;
  clasificacion: ClasificacionBienestar | "sin_datos";
  /** true cuando el promedio cae en zona de crisis (<= UMBRAL_CRISIS) */
  debeIrAModoCrisis: boolean;
  /** Frase motivadora aleatoria, solo presente si la clasificación es "alto" */
  frase: FraseMotivadora | null;
  /** Tip anti-estrés aleatorio, presente si la clasificación es "bajo" o "crisis" */
  tip: TipBienestar | null;
}

/**
 * Hook que recibe el historial de registros emocionales del usuario
 * (nivel 1-5 + fecha), filtra los de los últimos 7 días, calcula el
 * promedio EXACTO y devuelve la clasificación junto con el insight
 * (frase motivadora o tip anti-estrés) que corresponde mostrar, además
 * de la bandera para sugerir/redirigir a Modo Crisis.
 *
 * Uso:
 * ```tsx
 * const resultado = usePromedioBienestar(
 *   registros.map(r => ({ nivel: r.nivel, fecha: r.fecha }))
 * );
 * ```
 */
export function usePromedioBienestar(
  registros: RegistroBienestarInput[]
): UsePromedioBienestarResultado {
  return useMemo(() => {
    const { promedio, cantidadRegistros } = calcularPromedioUltimos7Dias(registros);

    if (promedio === null) {
      return {
        promedio: null,
        promedioRedondeado: null,
        cantidadRegistros: 0,
        clasificacion: "sin_datos",
        debeIrAModoCrisis: false,
        frase: null,
        tip: null,
      };
    }

    const clasificacion = clasificarPromedio(promedio);
    const esBajoOCrisis = clasificacion === "crisis" || clasificacion === "bajo";

    return {
      promedio,
      promedioRedondeado: Math.round(promedio * 10) / 10,
      cantidadRegistros,
      clasificacion,
      debeIrAModoCrisis: clasificacion === "crisis",
      frase: clasificacion === "alto" ? obtenerInsightAleatorio(FRASES_MOTIVADORAS) : null,
      tip: esBajoOCrisis ? obtenerInsightAleatorio(TIPS_ANIMO_BAJO) : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(registros)]);
}