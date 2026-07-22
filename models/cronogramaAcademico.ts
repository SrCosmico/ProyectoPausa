// ==========================================
// MÓDULO: Materias, Parciales, Semáforo de Estrés
// ==========================================

export type NivelDificultad = 1 | 2 | 3 | 4 | 5;

export interface Materia {
  id: string;
  user_id: string;
  nombre: string;
  dificultad: NivelDificultad;
  color: string;
  creado_at?: string;
}

export type TipoParcial = "parcial" | "examen" | "entrega" | "exposicion";

export interface Parcial {
  id: string;
  user_id: string;
  materia_id: string;
  titulo: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
  tipo: TipoParcial;
  peso: NivelDificultad;
  notas?: string | null;
  creado_at?: string;
}

export interface ParcialConMateria extends Parcial {
  materia: Materia;
}

export type NivelSemaforo = "verde" | "amarillo" | "rojo";

export interface SemanaCarga {
  /** Lunes de la semana, YYYY-MM-DD */
  inicioSemana: string;
  /** Domingo de la semana, YYYY-MM-DD */
  finSemana: string;
  puntajeCarga: number;
  nivel: NivelSemaforo;
  parciales: ParcialConMateria[];
}

export interface TecnicaEstudio {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  aplicaPara: NivelSemaforo[];
}

export const MAPEO_ICONOS_TIPO_PARCIAL: Record<TipoParcial, string> = {
  parcial: "📝",
  examen: "📚",
  entrega: "📤",
  exposicion: "🎤",
};

export const MAPEO_LABEL_TIPO_PARCIAL: Record<TipoParcial, string> = {
  parcial: "Parcial",
  examen: "Examen",
  entrega: "Entrega",
  exposicion: "Exposición",
};

export const COLORES_MATERIA: string[] = [
  "#4A72A6", "#7C3AED", "#059669", "#EA580C", "#E11D48", "#0891B2", "#CA8A04",
];