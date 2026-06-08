export type FrecuenciaEstres = 
  | "Nunca" 
  | "Casi nunca" 
  | "A veces" 
  | "A menudo" 
  | "Muy a menudo";

export interface PreguntaPSS4 {
  id: string;
  enunciado: string;
  esInversa: boolean; 
}

export interface OpcionRespuestaEstres {
  texto: FrecuenciaEstres;
  puntosBase: number; 
}

export interface RecomendacionDinamica {
  icono: string;
  texto: string;
}

// Interfaz para el objeto de resultado calculado internamente en el componente
export interface ResultadoEstres {
  puntaje: number;
  nivel: string;
  colorText: string;
  colorBg: string;
  porcentajeBarra: string;
  mensaje: string;
  emoji: string;
  recomendaciones: RecomendacionDinamica[];
}