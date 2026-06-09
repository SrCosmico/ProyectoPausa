export type VistaDiario = 'bienvenida' | 'bloqueo' | 'listaNotas' | 'crearNota' | 'verNota';

export interface Nota {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  emoji?: string;
}

export interface EstadoDia {
  emoji: string;
  label: string;
}