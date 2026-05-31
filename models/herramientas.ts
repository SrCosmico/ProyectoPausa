// Pantalla 8 — Herramientas

export type HerramientaId =
  | "meditacion"
  | "tips_antistres"
  | "escaneo_corporal"
  | "relajacion_muscular"
  | "frases_motivacionales"
  | "modo_crisis";

export type TabNavegacionId = "inicio" | "evaluacion" | "recursos" | "perfil";

export interface Herramienta {
  id: HerramientaId;
  titulo: string;
  descripcion: string;
  icono?: string;
  ruta: string;
  esCrisis?: boolean;     // diferencia visual para "Modo crisis"
}

export interface ItemNavegacion {
  id: TabNavegacionId;
  label: string;
  icono?: string;
  activo: boolean;
}

export interface PantallaHerramientas {
  titulo: string;         // "Herramientas"
  subtitulo: string;      // "Para tu bienestar diario"
  herramientas: Herramienta[];
  navegacion: ItemNavegacion[];
}

export const herramientasData: Herramienta[] = [
  { id: "meditacion",            titulo: "Meditación y respiración",      descripcion: "Ejercicios para calmar tu mente",      ruta: "/herramientas/meditacion" },
  { id: "tips_antistres",        titulo: "Tips anti-estrés",              descripcion: "Pequeñas acciones, grandes cambios",   ruta: "/herramientas/tips" },
  { id: "escaneo_corporal",      titulo: "Escaneo corporal",              descripcion: "Conecta con tu cuerpo",                ruta: "/herramientas/escaneo" },
  { id: "relajacion_muscular",   titulo: "Relajación muscular progresiva",descripcion: "Libera la tensión",                    ruta: "/herramientas/relajacion" },
  { id: "frases_motivacionales", titulo: "Frases motivacionales",         descripcion: "Inspírate cada día",                   ruta: "/herramientas/frases" },
  { id: "modo_crisis",           titulo: "Modo crisis",                   descripcion: "Si necesitas ayuda inmediata",         ruta: "/herramientas/crisis", esCrisis: true },
];
