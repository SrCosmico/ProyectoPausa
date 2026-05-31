// Pantalla 5 del cuestionario — Paso 4 de 6: Preferencias de apoyo

export type PreferenciaId =
  | "ejercicios_calma"
  | "tips_antistres"
  | "organizacion"
  | "motivacion_habitos"
  | "acompanamiento"
  | "chat_ia";

export interface OpcionPreferencia {
  id: PreferenciaId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaPreferenciasApoyo {
  paso: number;
  totalPasos: number;
  pregunta: string;       // "¿Qué tipo de apoyo te gustaría recibir en Pausa?"
  instruccion: string;    // "Elige lo que más te gustaría usar"
  opciones: OpcionPreferencia[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesPreferenciasData: Omit<OpcionPreferencia, "seleccionado">[] = [
  { id: "ejercicios_calma",    label: "Ejercicios para calmarme" },
  { id: "tips_antistres",      label: "Consejos y tips anti-estrés" },
  { id: "organizacion",        label: "Organización académica" },
  { id: "motivacion_habitos",  label: "Motivación y hábitos" },
  { id: "acompanamiento",      label: "Acompañamiento emocional" },
  { id: "chat_ia",             label: "Hablar con alguien (IA)" },
];
