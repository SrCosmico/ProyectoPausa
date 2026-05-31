// Pantalla 2 del cuestionario — Paso 1 de 6: Motivos

export type MotivoId =
  | "estres"
  | "bienestar"
  | "dormir"
  | "academico"
  | "motivacion"
  | "otro";

export interface OpcionMotivo {
  id: MotivoId;
  label: string;
  icono?: string;
  seleccionado: boolean;
}

export interface PantallaMotivos {
  paso: number;
  totalPasos: number;
  pregunta: string;         // "¿Cuál es tu principal motivo para usar Pausa?"
  instruccion: string;      // "Puedes elegir más de una opción"
  opciones: OpcionMotivo[];
  otroTexto: string;        // valor del campo libre "Otro"
  botonContinuar: string;
}

export const opcionesMotivosData: Omit<OpcionMotivo, "seleccionado">[] = [
  { id: "estres",      label: "Manejar el estrés" },
  { id: "bienestar",   label: "Mejorar mi bienestar emocional" },
  { id: "dormir",      label: "Dormir mejor" },
  { id: "academico",   label: "Organizarme mejor académicamente" },
  { id: "motivacion",  label: "Sentirme más motivado/a" },
  { id: "otro",        label: "Otro (especificar)" },
];
