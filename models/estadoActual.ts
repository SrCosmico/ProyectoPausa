// Pantalla 3 del cuestionario — Paso 2 de 6: Estado actual

export type EstadoEmocionalId =
  | "muy_mal"
  | "mal"
  | "regular"
  | "bien"
  | "muy_bien";

export interface OpcionEstadoActual {
  id: EstadoEmocionalId;
  label: string;          // "Muy mal", "Mal", etc.
  descripcion: string;    // "Me siento abrumado/a", etc.
  emoji: string;
  seleccionado: boolean;
}

export interface PantallaEstadoActual {
  paso: number;
  totalPasos: number;
  pregunta: string;       // "¿Cómo te has sentido últimamente?"
  instruccion: string;    // "Elige la opción que mejor te represente"
  opciones: OpcionEstadoActual[];
  botonContinuar: string;
  botonVolver: string;
}

export const opcionesEstadoData: Omit<OpcionEstadoActual, "seleccionado">[] = [
  { id: "muy_mal",  label: "Muy mal",  descripcion: "Me siento abrumado/a",     emoji: "😩" },
  { id: "mal",      label: "Mal",      descripcion: "He tenido días difíciles", emoji: "😔" },
  { id: "regular",  label: "Regular",  descripcion: "Ni bien ni mal",           emoji: "😐" },
  { id: "bien",     label: "Bien",     descripcion: "Me he sentido bien",       emoji: "😊" },
  { id: "muy_bien", label: "Muy bien", descripcion: "Me siento excelente",      emoji: "😄" },
];
