// ==========================================
// MÓDULO DE REGISTRO EMOCIONAL
// ==========================================

export interface Emocion {
  emoji: string;
  label: string;
}

export const listaEmociones: Emocion[] = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😰", label: "Ansioso" },
  { emoji: "😡", label: "Enojado" },
  { emoji: "😴", label: "Cansado" }
];