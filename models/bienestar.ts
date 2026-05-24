// pantalla 7
export type TipoSentimiento = "excelente" | "bien" | "neutral" | "bajo" | "mal";
export type DiaSemana = "L" | "M" | "X" | "J" | "V" | "S" | "D";

export interface PuntoHistorial {
  dia: DiaSemana;
  estado: TipoSentimiento;
  valorNumerico: number;
}

export interface PantallaBienestar {
  usuario: {
    nombre: string;
    avatarUrl: string;
  };
  estadoActual: {
    titulo: string;
    mensajeInspirador: string;
    identificadorIcono: string;
  };
  historialSemanal: PuntoHistorial[];
  recomendacion: {
    titulo: string;
    descripcion: string;
    imagenUrl?: string;
  };
}