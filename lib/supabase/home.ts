import { createClient } from '../supabase';

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