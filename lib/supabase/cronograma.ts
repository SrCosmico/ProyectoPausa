//U

// Función de UPDATE para una tarea del cronograma
import { createClient } from '../supabase'; // Ajusta la ruta según tu estructura

async function actualizarTarea(tareaId: string, nuevosDatos: { hora?: string, estado?: string, descripcion?: string }) {
  const supabase = createClient();
  
  // Usamos el update con los campos dinámicos
  // CRÍTICO: .eq() asegura que solo se modifica la fila de esta tarea específica
  const { data, error } = await supabase
    .from('cronograma')
    .update({ 
      hora: nuevosDatos.hora,
      estado: nuevosDatos.estado,
      descripcion: nuevosDatos.descripcion 
    })
    .eq('id', tareaId); // Filtro obligatorio según "WhatsApp Image 2026-06-08 at 4.56.27 PM.jpeg"
    
  return { data, error };
}