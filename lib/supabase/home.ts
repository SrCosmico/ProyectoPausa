// pantalla home
import { createClient } from "../supabase";
import { NivelEmocional } from "@/models/home";
import {
  emojiEstadosData,
  accesoRapidoData,
  navegacionData,
  type AccesoRapido,
  type EmojiEstado,
  type ItemNavegacion,
} from "@/models/home";

/**
 * LETRA C: PANTALLA HOME (CHECK-IN EMOCIONAL)
 * Registra de forma inmediata el estado de ánimo seleccionado por el usuario
 * desde los accesos rápidos del Dashboard para el monitoreo diario.
 */
export const insertarCheckInEmocionalHome = async (
  userId: string,
  estadoEmocional: NivelEmocional
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('registro_emocional_diario') // Tabla recomendada para el trackeo de estados de ánimo históricos
    .insert({
      user_id: userId,
      estado: estadoEmocional,         // "Muy mal", "Mal", "Regular", "Bien", "Muy bien"
      registrado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

async function actualizarRegistroEmocional(registroId: string, nuevoEstado: string, nuevaDescripcion: string) {
  const supabase = createClient();
  
  // Realizamos el update asegurando el filtro .eq() para modificar SOLO la fila correcta
  const { data, error } = await supabase
    .from('registros_emocionales')
    .update({ 
      estado: nuevoEstado, 
      descripcion: nuevaDescripcion 
    })
    .eq('id', registroId); //
    
  return { data, error };
}

// ============================================================
// CRUD: Letra "R" pantalla de home
// ============================================================

/** Lee el nombre del usuario activo desde localStorage. */
export function leerNombreUsuarioHome(): string {
  if (typeof window === "undefined") return "Carlos";
  return (
    localStorage.getItem("alumnoNombre") ||
    localStorage.getItem("alumnoEmail") ||
    "Carlos"
  );
}

/** Verifica si el usuario ya hizo un check-in emocional hoy. */
export function leerYaRegistroHoy(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("fechaUltimoRegistro") ===
    new Date().toLocaleDateString()
  );
}

/** Devuelve las opciones de emoji para el check-in emocional rápido del Home. */
export function leerOpcionesEmojiHome(): EmojiEstado[] {
  return emojiEstadosData;
}

/** Devuelve el listado de herramientas de acceso rápido del Home. */
export function leerAccesoRapidoHome(): AccesoRapido[] {
  return accesoRapidoData;
}

/** Devuelve los ítems de la barra de navegación inferior con "inicio" activo. */
export function leerNavegacionHome(): ItemNavegacion[] {
  return navegacionData.map((item) => ({
    ...item,
    activo: item.id === "inicio",
  }));
}


// Función de UPDATE para actualizar la foto de perfil

async function actualizarFotoPerfil(userId: string, newAvatarUrl: string) {
  const supabase = createClient();
  
  // CRÍTICO: Usamos el .eq('id', userId) para modificar SOLO el perfil de este usuario.
  // Esto asegura que la foto se actualice correctamente en la base de datos, 
  // permitiendo que tu pantalla principal (Home) refleje el cambio al recargar los datos.
  const { data, error } = await supabase
    .from('perfiles')
    .update({ 
      avatar_url: newAvatarUrl 
    })
    .eq('id', userId); 
    
  return { data, error };
}