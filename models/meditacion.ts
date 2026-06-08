// ==========================================
// INTERFACES
// ==========================================

export type FlowStep = "main_menu" | "config_session" | "active_session" | "completed_session";
export type SessionType = "respiracion" | "meditacion";

export interface OpcionSesion {
  id: SessionType;
  titulo: string;
  descripcion: string;
  duracionMinima: number;
  duracionMaxima: number;
  icono: string;
}

export interface FraseMeditacion {
  title: string;
  sub: string;
}

// ==========================================
// DATOS ADMINISTRADOS (Configuración de la App)
// ==========================================

export const opcionesSesionData: OpcionSesion[] = [
  { 
    id: "respiracion", 
    titulo: "Respiración guiada", 
    descripcion: "Aprende a controlar el estrés mediante ejercicios respiratorios.", 
    duracionMinima: 2, 
    duracionMaxima: 20,
    icono: "🍃"
  },
  { 
    id: "meditacion", 
    titulo: "Meditación guiada", 
    descripcion: "Momentos de calma y atención plena para despejar tu mente.", 
    duracionMinima: 5, 
    duracionMaxima: 20,
    icono: "🧘‍♀️"
  }
];

export const meditacionFrasesData: FraseMeditacion[] = [
  { title: "Lleva tu atención a tu respiración.", sub: "Siente el aire entrando y saliendo sin forzar el ritmo." },
  { title: "Observa los sonidos a tu alrededor.", sub: "No los juzgues, solo déjalos pasar como nubes." },
  { title: "Permite que los pensamientos pasen sin aferrarte a ellos.", sub: "Si tu mente se distrae, regresa amablemente al presente." },
  { title: "Relaja activamente tu cuerpo.", sub: "Suelta los hombros, destensa la frente y las manos." },
  { title: "Disfruta de este instante de quietud.", sub: "Estás aquí cuidando de tu bienestar mental." }
];

export const duracionesDisponibles: number[] = [2, 5, 10, 15, 20];