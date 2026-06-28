export type TipoActividad = 'Clase' | 'Estudio' | 'Tarea' | 'Examen';

export interface CronogramaConfig {
  id: string;
  user_id: string;
  nombre: string;
  color: "blue" | "purple" | "emerald" | "orange" | "rose";
  recordatorios: boolean;
}

export interface BloqueHorario {
  id: string;
  fecha: string; // ISO YYYY-MM-DD
  tipo: TipoActividad;
  horaInicio: string;
  horaFin: string;
  titulo: string;
  ubicacion: string;
}