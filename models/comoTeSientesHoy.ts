// ==========================================
// INTERFACES UNIFICADAS DE LA APLICACIÓN
// ==========================================

// --- Tipos Base ---
export type NivelEmocionalHoy = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";

// --- Interfaz de Selección Emocional ---
export interface OpcionEmocionalHoy {
  estado: NivelEmocionalHoy;
  emoji: string;
  seleccionado: boolean;
}

// --- Interfaz de Herramientas ---
export interface HerramientaSugerida {
  id: string;
  nombre: string;
  descripcion: string;
  icono?: string;
}

// --- Interfaz Principal (Pantalla 5 - ¿Cómo te sientes hoy?) ---
export interface PantallaComoTeSientesHoy {
  // Configuración dinámica basada en si es la primera vez o una actualización
  esActualizacion: boolean; 
  
  titulo: string;            // "¿Cómo te sientes hoy?" vs "¿Cómo te sientes ahora?"
  subtitulo: string;         // "Tu bienestar es importante"
  
  opciones: OpcionEmocionalHoy[];
  estadoSeleccionado?: NivelEmocionalHoy;
  
  campoAdicional: {
    label: string;           // "Cuéntanos más (opcional)"
    placeholder: string;
    texto: string;
    maxCaracteres: number;   // 200
  };
  
  herramientasRecomendadas: HerramientaSugerida[];
  botonGuardar: string;      // "Guardar mi estado" vs "Actualizar mi estado"
}

// ==========================================
// DATOS CONSTANTES (Para inicialización)
// ==========================================

export const opcionesEmocionalesData: Omit<OpcionEmocionalHoy, "seleccionado">[] = [
  { estado: "Muy mal",  emoji: "😩" },
  { estado: "Mal",      emoji: "😔" },
  { estado: "Regular",  emoji: "😐" },
  { estado: "Bien",     emoji: "😊" },
  { estado: "Muy bien", emoji: "😄" },
];

export const herramientasSugeridasData: HerramientaSugerida[] = [
  { id: "respiracion", nombre: "Respiración consciente", descripcion: "Ejercicio de 5 minutos" },
];