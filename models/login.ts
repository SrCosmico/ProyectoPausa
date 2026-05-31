// Pantalla 2 — Inicio de sesión

export interface CampoTexto {
  label: string;
  placeholder: string;
  valor: string;
}

export interface CampoContrasena extends CampoTexto {
  mostrarContrasena: boolean;
}

export interface PantallaLogin {
  titulo: string;                  // "Bienvenido de nuevo"
  subtitulo: string;               // "Nos alegra verte otra vez"
  avatarUrl?: string;
  formulario: {
    correo: CampoTexto;
    contrasena: CampoContrasena;
  };
  enlaceOlvidoContrasena: string;  // "¿Olvidaste tu contraseña?"
  botones: {
    iniciarSesion: string;
    crearCuenta: string;
  };
  mensajeSinCuenta: string;        // "¿No tienes cuenta?"
}
