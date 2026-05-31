// Pantalla 7 — Tu bienestar (monitoreo)

export type TipoSentimiento = "excelente" | "bien" | "neutral" | "bajo" | "mal";
export type DiaSemana = "L" | "M" | "X" | "J" | "V" | "S" | "D";
export type TabNavegacionId = "inicio" | "evaluacion" | "recursos" | "perfil";

export interface PuntoHistorial {
  dia: DiaSemana;
  estado: TipoSentimiento;
  valorNumerico: number;   // 1–5
}

export interface ItemNavegacion {
  id: TabNavegacionId;
  label: string;
  icono?: string;
  activo: boolean;
}

export interface PantallaBienestar {
  usuario: {
    nombre: string;
    avatarUrl?: string;
  };
  estadoActual: {
    titulo: string;              // "Bien"
    mensajeInspirador: string;   // "¡Vas por buen camino!"
    emoji: string;
  };
  historialEmocional: {
    titulo: string;              // "Historial emocional"
    rango: string;               // "Últimos 7 días"
    puntos: PuntoHistorial[];
    expandido: boolean;
  };
  recomendacionHoy: {
    titulo: string;              // "Recomendación para hoy"
    descripcion: string;
    ilustracionUrl?: string;
  };
  navegacion: ItemNavegacion[];
}

export const historialSemanalData: PuntoHistorial[] = [
  { dia: "L", estado: "neutral",    valorNumerico: 3 },
  { dia: "M", estado: "bajo",       valorNumerico: 2 },
  { dia: "X", estado: "neutral",    valorNumerico: 3 },
  { dia: "J", estado: "bien",       valorNumerico: 4 },
  { dia: "V", estado: "bien",       valorNumerico: 4 },
  { dia: "S", estado: "excelente",  valorNumerico: 5 },
  { dia: "D", estado: "bien",       valorNumerico: 4 },
];
