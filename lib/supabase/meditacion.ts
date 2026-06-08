//U

// Función de UPDATE para finalizar sesión de meditación
import { createClient } from '../supabase'; 

async function finalizarSesionMeditacion(sesionId: string, tiempoReal: number) {
  const supabase = createClient();
  
  // Realizamos el update cambiando el estado a 'completada' 
  // y guardando el tiempo real de meditación.
  // CRÍTICO: .eq() es obligatorio para afectar SOLO esta sesión.
  const { data, error } = await supabase
    .from('meditaciones')
    .update({ 
      estado: 'completada', 
      duracion_real: tiempoReal 
    })
    .eq('id', sesionId); // Filtro obligatorio según "WhatsApp Image 2026-06-08 at 4.56.27 PM.jpeg"
    
  return { data, error };
}