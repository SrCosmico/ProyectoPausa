import { EstadoEmocionalId } from "@/models/estadoActual";


/**
 * LETRA C: PANTALLA CRONOGRAMA ACADÉMICO - AGREGAR ACTIVIDAD
 * Inserta un bloque horario o evento específico asignado a un cronograma.
 */
export const insertarCronogramaActividad = async (
  userId: string,
  cronogramaId: string, // Llave foránea que conecta la actividad con su cronograma padre
  titulo: string,
  ubicacion: string,
  tipoActividad: string // Ejemplo: "Clase", "Estudio", "Tarea", "Examen"
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cronograma_actividades') // Nombre sugerido para la tabla de eventos detallados
    .insert({
      user_id: userId,
      cronograma_id: cronogramaId,
      titulo: titulo.trim() || 'Actividad sin título',
      ubicacion: ubicacion.trim() || null,
      tipo_actividad: tipoActividad
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
//Pantalla estadoactual
/**
 * LETRA C: PANTALLA ESTADO ACTUAL (PASO 2)
 * Registra la respuesta del usuario sobre cómo se ha sentido últimamente en el cuestionario de diagnóstico inicial.
 */
export const insertarEstadoEmocionalActual = async (
  userId: string,
  estadoId: EstadoEmocionalId
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('respuestas_cuestionario') // Nombre sugerido para la tabla de respuestas generales o perfil inicial
    .insert({
      user_id: userId,
      paso: 2,
      estado_emocional_id: estadoId, // Almacena el ID seleccionado: "muy_mal", "mal", "regular", "bien", "muy_bien"
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};





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