// Pantalla 1 — Splash (inicio)

export interface PantallaSplash {
  logo: {
    nombre: string;      // "Pausa."
    tagline: string;     // "TU REFUGIO MENTAL"
    iconoUrl?: string;
  };
  descripcion: string;   // "Apoyo emocional para estudiantes de la UCV"
  institucion: {
    nombre: string;      // "UCV"
    logoUrl?: string;
  };
}
