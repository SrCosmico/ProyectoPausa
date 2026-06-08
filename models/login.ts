// ==========================================
// INTERFACES
// ==========================================

export interface CampoTexto {
  label: string;
  placeholder: string;
  valor: string;
}

export interface CampoContrasena extends CampoTexto {
  mostrarContrasena: boolean;
}

export interface PantallaLogin {
  titulo: string;                // "Bienvenido de nuevo"
  subtitulo: string;             // "Nos alegra verte otra vez"
  avatarUrl?: string;
  formulario: {
    correo: CampoTexto;
    contrasena: CampoContrasena;
  };
  enlaceOlvidoContrasena: string; // "¿Olvidaste tu contraseña?"
  botones: {
    iniciarSesion: string;
    crearCuenta: string;
  };
  mensajeSinCuenta: string;       // "¿No tienes cuenta?"
}

// ==========================================
// DATOS ADMINISTRADOS (Configuración de LoginView)
// ==========================================

export const loginData: PantallaLogin = {
  titulo: "Bienvenido de nuevo",
  subtitulo: "Nos alegra verte otra vez",
  formulario: {
    correo: {
      label: "Correo institucional UCV",
      placeholder: "usuario@ucv.ve",
      valor: ""
    },
    contrasena: {
      label: "Contraseña",
      placeholder: "********",
      valor: "",
      mostrarContrasena: false
    }
  },
  enlaceOlvidoContrasena: "¿Olvidaste tu contraseña?",
  botones: {
    iniciarSesion: "Iniciar sesión",
    crearCuenta: "Crear cuenta"
  },
  mensajeSinCuenta: "¿No tienes cuenta?"
};