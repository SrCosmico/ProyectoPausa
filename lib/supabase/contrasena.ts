//Pantalla contraseña
/**
 * LETRA C: PANTALLA DIARIO EMOCIONAL (CONTRASEÑA)
 * Guarda una nueva nota escrita por el usuario con su respectivo título, contenido y etiqueta del día.
 */
export const insertarNotaDiario = async (
  userId: string, 
  titulo: string, 
  contenido: string, 
  emojiDia: string | null, 
  labelDia: string | null
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('diario_notas') // Nombre sugerido para la tabla en Supabase
    .insert({
      user_id: userId,
      titulo: titulo.trim() || 'Sin título',
      contenido: contenido.trim(),
      emoji_dia: emojiDia,
      label_dia: labelDia,
      fecha: new Date().toLocaleDateString() // Almacena el string de la fecha actual
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};


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