export interface RegistroEmocion {
  id?: number;              // Opcional, Supabase lo genera solo
  created_at?: string;      // Opcional, Supabase lo genera solo
  user_id: string;          // El ID del usuario que viene de la autenticación
  dia: string;              // Ejemplo: "L", "M", "X"
  estado: string;           // Ejemplo: "bien", "excelente", "neutral"
  valor_numerico: number;   // Ejemplo: 7, 10, 5
}