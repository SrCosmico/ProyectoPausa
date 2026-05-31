// Pantalla 9 — Leyenda / Mensaje personalizado

export type NivelEmocional = "Muy mal" | "Mal" | "Regular" | "Bien" | "Muy bien";

export interface ItemLeyenda {
  estado: NivelEmocional;
  colorClase: string;      // clase Tailwind, e.g. "bg-red-400"
  descripcion: string;
}

export interface MensajePersonalizado {
  titulo: string;          // "Mensaje personalizado"
  texto: string;
  icono?: string;          // "💜"
}

export interface PantallaLeyenda {
  titulo: string;          // "¿Cómo te sientes hoy?"
  leyenda: ItemLeyenda[];
  mensajePersonalizado: MensajePersonalizado;
}

export const leyendaData: ItemLeyenda[] = [
  { estado: "Muy mal",  colorClase: "bg-red-400",     descripcion: "Te sientes abrumado, triste o desesperanzado." },
  { estado: "Mal",      colorClase: "bg-orange-400",   descripcion: "Te sientes decaído o con dificultades." },
  { estado: "Regular",  colorClase: "bg-yellow-400",   descripcion: "Ni bien ni mal, un día promedio." },
  { estado: "Bien",     colorClase: "bg-green-400",    descripcion: "Te sientes tranquilo y positivo." },
  { estado: "Muy bien", colorClase: "bg-emerald-500",  descripcion: "Te sientes excelente, lleno de energía." },
];

export const mensajePersonalizadoData: MensajePersonalizado = {
  titulo: "Mensaje personalizado",
  texto: "Recuerda: está bien no estar bien todos los días. Lo importante es cuidar de ti.",
  icono: "💜",
};
