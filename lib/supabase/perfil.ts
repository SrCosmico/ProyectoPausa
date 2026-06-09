// ============================================================
// CRUD: Letra "R" pantalla de perfil
// ============================================================

import {
  opcionesMenuPerfil,
  usuarioDefecto,
  type UsuarioPerfil,
  type OpcionMenu,
} from "@/models/perfil";

/** Lee el perfil del usuario activo desde localStorage. */
export function leerPerfilUsuario(): UsuarioPerfil {
  if (typeof window === "undefined") return usuarioDefecto;
  return {
    nombre: localStorage.getItem("alumnoNombre") ?? usuarioDefecto.nombre,
    correo: localStorage.getItem("alumnoEmail") ?? usuarioDefecto.correo,
    avatar: localStorage.getItem("userAvatar") ?? null,
  };
}

/** Devuelve las opciones del menú de configuración del perfil. */
export function leerOpcionesMenuPerfil(): OpcionMenu[] {
  return opcionesMenuPerfil;
}

/** Verifica si existe una sesión activa válida en localStorage. */
export function leerSesionActiva(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sesionActiva") === "true";
}


async function actualizarPerfil(
  userId: string,
  nuevosDatos: { nombre?: string; biografia?: string; avatar_url?: string }
) {
  if (typeof window !== 'undefined') {
    if (nuevosDatos.nombre) {
      localStorage.setItem('alumnoNombre', nuevosDatos.nombre);
    }
    if (nuevosDatos.avatar_url) {
      localStorage.setItem('userAvatar', nuevosDatos.avatar_url);
    }
    if (nuevosDatos.biografia) {
      localStorage.setItem(`biografia_${userId}`, nuevosDatos.biografia);
    }
    return { data: nuevosDatos, error: null };
  }
  return { data: null, error: null };
}

export { actualizarPerfil };