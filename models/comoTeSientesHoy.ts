// Pantalla 5 — ¿Cómo te sientes hoy?

export type NivelEmocionalHoy = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";

export interface OpcionEmocionalHoy {
  estado: NivelEmocionalHoy;
  emoji: string;
  seleccionado: boolean;
}

export interface HerramientaSugerida {
  id: string;
  nombre: string;
  descripcion: string;       // "Ejercicio de 5 minutos"
  icono?: string;
}

export interface PantallaComoTeSientesHoy {
  titulo: string;            // "¿Cómo te sientes hoy?"
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
  botonGuardar: string;      // "Guardar mi estado"
}

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
