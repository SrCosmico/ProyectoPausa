// Pantalla 3 — Registro / Crear cuenta

export interface CampoTexto {
  label: string;
  placeholder: string;
  valor: string;
}

export interface CampoContrasena extends CampoTexto {
  mostrarContrasena: boolean;
}

export interface CampoSelector extends CampoTexto {
  opciones: string[];
}

export interface PantallaRegistro {
  titulo: string;          // "Crea tu cuenta"
  subtitulo: string;       // "Estás a un paso de tu refugio mental"
  formulario: {
    nombreCompleto: CampoTexto;
    correoInstitucional: CampoTexto;
    facultadEscuela: CampoSelector;
    contrasena: CampoContrasena;
    confirmarContrasena: CampoContrasena;
    aceptaTerminos: boolean;
  };
  botonCrearCuenta: string;
  avisoPrivacidad: string;  // "Tu información es privada y segura"
}

export const facultadesData: string[] = [
  "Facultad de Ciencias",
  "Facultad de Ingeniería",
  "Facultad de Humanidades y Educación",
  "Facultad de Medicina",
  "Facultad de Derecho",
  "Facultad de Arquitectura y Urbanismo",
  "Facultad de Ciencias Económicas y Sociales",
  "Facultad de Farmacia",
  "Facultad de Odontología",
  "Facultad de Agronomía",
];
