// ==========================================
// INTERFACES Y DATOS DE MONITOREO
// ==========================================

export interface RegistroHistorico {
  id?: string | number; // Supabase usa bigint o uuid
  user_id?: string;     // Obligatorio para filtrar
  dia?: string;         // Esto es la fecha en formato string (ej: "2026-06-12")
  fecha?: string;       // Mantén esto si lo usas para el renderizado visual
  nivel?: number;       // Mapea a 'valor_numerico' de Supabase
  emoji?: string;       
  estado?: string;      // Mapea a 'estado' de Supabase
  nota?: string | null;
}

export interface TipAntiEstres {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

// Datos de simulación para la interfaz
export const historialEmocionalInicial: RegistroHistorico[] = [
  { dia: "L", fecha: "25 Mayo", nivel: 2, emoji: "😔", estado: "Mal" },
  { dia: "M", fecha: "26 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "M", fecha: "27 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "J", fecha: "28 Mayo", nivel: 5, emoji: "🤩", estado: "Muy bien" },
  { dia: "V", fecha: "29 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "S", fecha: "30 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "D", fecha: "31 Mayo", nivel: 4, emoji: "😊", estado: "Bien" }, 
];

export const registrosAnterioresSimulados: RegistroHistorico[] = [
  { dia: "Dom", fecha: "24 Mayo", nivel: 5, emoji: "🤩", estado: "Muy bien" },
  { dia: "Sáb", fecha: "23 Mayo", nivel: 4, emoji: "😊", estado: "Bien" },
  { dia: "Vie", fecha: "22 Mayo", nivel: 3, emoji: "😐", estado: "Regular" },
  { dia: "Jue", fecha: "21 Mayo", nivel: 1, emoji: "😩", estado: "Muy mal" },
  { dia: "Mié", fecha: "20 Mayo", nivel: 2, emoji: "😔", estado: "Mal" },
];

export const bcoTipsAntiEstres: TipAntiEstres[] = [
  { id: 1, titulo: "Toma un respiro 4-7-8", descripcion: "Inhala durante 4 segundos, mantén 7 y exhala completamente en 8 segundos para calmar tu sistema nervioso.", icono: "🌬️" },
  { id: 2, titulo: "Estiramiento rápido", descripcion: "Levántate de la silla, estira tus brazos hacia el techo y rota los hombros hacia atrás durante 1 minuto.", icono: "🧘‍♀️" },
  { id: 3, titulo: "Desconexión digital", descripcion: "Aparta la vista de todas tus pantallas por los próximos 10 minutos. Deja que tus ojos y mente descansen.", icono: "📴" },
  { id: 4, titulo: "Un sorbo de calma", descripcion: "Bebe un vaso de agua despacio, saboreándolo y enfocándote únicamente en esa sensación física de hidratación.", icono: "💧" },
  { id: 5, titulo: "Escucha el entorno", descripcion: "Cierra los ojos e intenta identificar 3 sonidos diferentes a tu alrededor que normalmente ignoras.", icono: "🎧" }
];