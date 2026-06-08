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