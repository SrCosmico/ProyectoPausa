export interface RegistroEmocion {
  id?: number;              // Opcional, Supabase lo genera solo
  created_at?: string;      // Opcional, Supabase lo genera solo
  user_id: string;          // El ID del usuario que viene de la autenticación
  dia: string;              // Ejemplo: "L", "M", "X"
  estado: string;           // Ejemplo: "bien", "excelente", "neutral"
  valor_numerico: number;   // Ejemplo: 7, 10, 5
}

export interface Recomendacion {
  id?: number;
  created_at?: string;
  estado_animo: string; // "triste", "ansioso", "feliz", "cansado"
  consejo: string;      // Las frases que guardamos en Supabase
}
export interface TipAntiestres {
  id: number;
  contenido: string;
  categoria?: string;
}