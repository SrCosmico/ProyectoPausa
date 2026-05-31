// Pantalla 6 del cuestionario — Paso 5 de 6: Frecuencia

export type FrecuenciaId =
  | "todos_los_dias"
  | "varias_semana"
  | "algunas_mes"
  | "rara_vez"
  | "casi_nunca";

export interface OpcionFrecuencia {
  id: FrecuenciaId;
  label: string;
  seleccionado: boolean;
}

export interface PantallaFrecuencia {
  paso: number;
  totalPasos: number;
  pregunta: string;       // "¿Con qué frecuencia sientes estrés o ansiedad?"
  instruccion: string;    // "Elige la opción que mejor te represente"
  opciones: OpcionFrecuencia[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesFrecuenciaData: Omit<OpcionFrecuencia, "seleccionado">[] = [
  { id: "todos_los_dias", label: "Todos los días" },
  { id: "varias_semana",  label: "Varias veces por semana" },
  { id: "algunas_mes",    label: "Algunas veces al mes" },
  { id: "rara_vez",       label: "Rara vez" },
  { id: "casi_nunca",     label: "Casi nunca" },
];
