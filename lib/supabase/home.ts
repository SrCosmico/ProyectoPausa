//U

// Función exclusiva para UPDATE
// @ts-ignore
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}

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