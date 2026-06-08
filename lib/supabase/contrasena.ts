//U

// Función de UPDATE para una entrada del diario
import { createClient } from '../supabase'; 

async function actualizarEntradaDiario(diarioId: string, nuevoTexto: string, nuevoTitulo: string) {
  const supabase = createClient();
  
  // CRÍTICO: Usamos el .eq('id', diarioId) para modificar SOLO la entrada seleccionada
  // tal como se indica en "WhatsApp Image 2026-06-08 at 4.56.27 PM.jpeg"
  const { data, error } = await supabase
    .from('diario')
    .update({ 
      titulo: nuevoTitulo,
      contenido: nuevoTexto,
      fecha_edicion: new Date().toISOString() // Opcional: para saber cuándo se editó
    })
    .eq('id', diarioId); 
    
  return { data, error };
}