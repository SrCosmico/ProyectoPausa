// pantalla home
import { createClient } from "../supabase";
import { NivelEmocional } from "@/models/home";
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