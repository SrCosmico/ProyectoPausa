// Pantalla 4 — Home (principal)

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

//hacer la interface de register
//hacer más preguntas si no es fija la pregunta de como te sientes hoy
export interface PantallaHome {
  usuario: {
    nombre: string;
    avatarUrl?: string;
  };
  saludo: string;           // "Nos alegra que estés aquí"
  registroEmocional: {
    pregunta: string;       // "¿Cómo te sientes hoy?"
    descripcion: string;    // "Registra tu estado emocional"
    opcionesEmoji: EmojiEstado[];
  };
  accesoRapido: AccesoRapido[];
  navegacion: ItemNavegacion[];
}

export const emojiEstadosData: EmojiEstado[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "🤩" },
];

export const accesoRapidoData: AccesoRapido[] = [
  { id: "evaluacion",  titulo: "Evaluación rápida",         descripcion: "Conoce tu bienestar",                 ruta: "/evaluacion" },
  { id: "meditacion",  titulo: "Meditación y respiración",  descripcion: "Encuentra tu calma",                  ruta: "/herramientas/meditacion" },
  { id: "antistres",   titulo: "Tips anti-estrés",          descripcion: "Pequeñas acciones, grandes cambios",  ruta: "/herramientas/tips" },
  { id: "cronograma",  titulo: "Cronograma académico",      descripcion: "Organiza tu semana",                  ruta: "/cronograma" },
  { id: "registro",    titulo: "Registro emocional",        descripcion: "Tu espacio personal",                 ruta: "/bienestar" },
];

export const navegacionData: Omit<ItemNavegacion, "activo">[] = [
  { id: "inicio",      label: "Inicio" },
  { id: "evaluacion",  label: "Evaluación" },
  { id: "recursos",    label: "Recursos" },
  { id: "perfil",      label: "Perfil" },
];
