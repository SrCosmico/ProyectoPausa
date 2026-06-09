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


// ============================================================
// CRUD: Letra "R" pantalla de cronograma
// ============================================================

const _bloquesCronograma: BloqueHorario[] = [
  {
    id: "1",
    hora: "07:00",
    titulo: "Cálculo diferencial",
    subtitulo: "Aula 201 (07:00 - 08:30)",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "2",
    hora: "09:00",
    titulo: "Física I",
    subtitulo: "Aula 102 (08:40 - 10:10)",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "3",
    hora: "10:30",
    titulo: "Estudio personal",
    subtitulo: "Repaso de ejercicios",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "4",
    hora: "12:00",
    titulo: "Almuerzo",
    subtitulo: "Descanso y comida",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "5",
    hora: "13:00",
    titulo: "Química general",
    subtitulo: "Laboratorio 3 (13:10 - 14:40)",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

/** Devuelve todos los bloques horarios de la semana actual. */
export function leerBloquesCronograma(): BloqueHorario[] {
  return _bloquesCronograma;
}

/** Busca y devuelve un bloque del cronograma por su ID. */
export function leerBloquePorId(id: string): BloqueHorario | undefined {
  return _bloquesCronograma.find((b) => b.id === id);
}

/** Filtra bloques del cronograma por tipo de actividad (match parcial en título). */
export function leerBloquesPorTipo(tipo: string): BloqueHorario[] {
  return _bloquesCronograma.filter((b) =>
    b.titulo.toLowerCase().includes(tipo.toLowerCase())
  );
}


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