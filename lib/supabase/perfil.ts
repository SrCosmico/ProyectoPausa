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


//U

// Función de UPDATE para el perfil del usuario
import { createClient } from '../supabase'; 

async function actualizarPerfil(userId: string, nuevosDatos: { nombre?: string, biografia?: string, avatar_url?: string }) {
  const supabase = createClient();
  
  // CRÍTICO: El uso de .eq('id', userId) es obligatorio.
  // Sin esto, podrías modificar el perfil de otros usuarios accidentalmente.
  const { data, error } = await supabase
    .from('perfiles')
    .update({ 
      nombre: nuevosDatos.nombre,
      biografia: nuevosDatos.biografia,
      avatar_url: nuevosDatos.avatar_url
    })
    .eq('id', userId); // Filtro obligatorio para proteger la integridad de los datos
    
  return { data, error };
}