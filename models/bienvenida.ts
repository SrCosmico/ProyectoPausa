// Pantalla 1 del cuestionario — Bienvenida

export interface LogoApp {
  nombre: string;        // "Pausa."
  tagline: string;       // "TU REFUGIO MENTAL"
  iconoUrl?: string;
}

export interface PantallaBienvenida {
  logo: LogoApp;
  encabezado: string;          // "Antes de comenzar, queremos conocerte un poco"
  descripcion: string;         // "Tus respuestas son privadas y nos ayudarán..."
  duracionEstimada: string;    // "Solo tomará 2 minutos"
  botones: {
    primario: string;          // "Comenzar"
    secundario: string;        // "Ahora no"
  };
  avisoPrivacidad: string;     // "Tu información está segura y nunca será compartida"
}

