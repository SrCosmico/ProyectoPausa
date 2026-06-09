// ==========================================
// ESTRUCTURA DE DATOS - APP PAUSA
// ==========================================

// Define las vistas para el flujo del usuario y la navegación
type VistaId = 
  | 'paso1' 
  | 'paso2' 
  | 'paso3' 
  | 'paso4' 
  | 'paso5' 
  | 'vistaSemanal' 
  | 'agregarActividad' 
  | 'detallesActividad';

// Configuración de visualización para el componente de calendario
type SubVistaCalendario = 'dia' | 'mes' | 'lista';

// Interfaz para la gestión de bloques de tiempo en las actividades
export interface BloqueHorario {
  id: string;
  hora: string;
  titulo: string;
  subtitulo: string;
  color: string;
}

// Interfaz para los estilos visuales del MVP
interface EstiloColor {
  bg: string;
  hoverBg: string;
  text: string;
  bgLight: string;
  border: string;
}