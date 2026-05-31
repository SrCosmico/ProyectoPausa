// Pantalla 4 del cuestionario — Paso 3 de 6: Factores de impacto

export type FactorId =
  | "estres_academico"
  | "sobrecarga_tareas"
  | "falta_tiempo"
  | "problemas_personales"
  | "ansiedad"
  | "motivacion_baja"
  | "otro";

export interface OpcionFactor {
  id: FactorId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaFactoresImpacto {
  paso: number;
  totalPasos: number;
  pregunta: string;       // "¿Qué situaciones afectan más tu bienestar?"
  instruccion: string;    // "Puedes elegir más de una opción"
  opciones: OpcionFactor[];
  otroTexto: string;      // valor del campo libre "Otro"
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesFactoresData: Omit<OpcionFactor, "seleccionado">[] = [
  { id: "estres_academico",     label: "Estrés académico" },
  { id: "sobrecarga_tareas",    label: "Sobrecarga de tareas" },
  { id: "falta_tiempo",         label: "Falta de tiempo" },
  { id: "problemas_personales", label: "Problemas personales" },
  { id: "ansiedad",             label: "Ansiedad / Preocupación" },
  { id: "motivacion_baja",      label: "Motivación baja" },
  { id: "otro",                 label: "Otro (especificar)" },
];
