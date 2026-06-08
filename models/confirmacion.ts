// ==========================================
// INTERFACES Y DATOS: Pantalla 7 - Confirmación
// ==========================================

export interface BeneficioItem {
  id: string;
  descripcion: string;
  icono?: string;
}

export interface PantallaConfirmacion {
  paso: number;
  totalPasos: number;
  titulo: string;           // "¡Gracias! 💜"
  subtitulo: string;        // "Con tus respuestas podemos personalizar tu experiencia."
  seccionBeneficios: {
    titulo: string;         // "Esto encontrarás en Pausa"
    items: BeneficioItem[];
  };
  ilustracionUrl?: string;
  botonComenzar: string;    // "Comenzar mi refugio +"
}

// Datos iniciales para la sección de beneficios
export const beneficiosData: BeneficioItem[] = [
  { id: "1", descripcion: "Recomendaciones personalizadas según tus necesidades." },
  { id: "2", descripcion: "Herramientas que te ayudarán en tu día a día." },
  { id: "3", descripcion: "Seguimiento de tu bienestar de forma segura." },
];