// ==========================================
// INTERFACES
// ==========================================

export type NivelEmocional = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";

export type TabNavegacionId = "inicio" | "evaluacion" | "recursos" | "perfil";

export interface EmojiEstado {
  estado: NivelEmocional;
  emoji: string;
}

export interface AccesoRapido {
  id: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  ruta: string;
}

export interface ItemNavegacion {
  id: TabNavegacionId;
  label: string;
  icono?: string;
  activo: boolean;
}

// ==========================================
// DATOS ADMINISTRADOS POR EL USUARIO
// ==========================================

export const emojiEstadosData: EmojiEstado[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "🤩" },
];

export const accesoRapidoData: AccesoRapido[] = [
  { id: "evaluacion",  titulo: "Evaluación rápida",        descripcion: "Conoce tu bienestar",               ruta: "/evaluacion.2" },
  { id: "meditacion",  titulo: "Meditación y respiración",  descripcion: "Encuentra tu calma",               ruta: "/meditacion.2" },
  { id: "antistres",   titulo: "Tips anti-estrés",          descripcion: "Pequeñas acciones, grandes cambios", ruta: "/monitoreo.2" },
  { id: "cronograma",  titulo: "Cronograma académico",      descripcion: "Organiza tu semana",               ruta: "/cronograma.2" },
  { id: "registro",    titulo: "Registro emocional",        descripcion: "Tu espacio personal",              ruta: "/monitoreo.2" },
  { id: "crisis",      titulo: "Modo crisis",               descripcion: "Ayuda inmediata y contención",       ruta: "" },
  { id: "diario",      titulo: "Diario personal",           descripcion: "Escribe lo que piensas",             ruta: "/contrasena.2" },
  { id: "ia",          titulo: "Asistente IA de Bienestar", descripcion: "Habla con nuestro bot de apoyo",     ruta: "" },
];

export const navegacionData: Omit<ItemNavegacion, "activo">[] = [
  { id: "inicio",      label: "Inicio" },
  { id: "evaluacion",  label: "Evaluación" },
  { id: "perfil",      label: "Perfil" },
];