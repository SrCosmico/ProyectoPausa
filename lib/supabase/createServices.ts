//PANTALLA comoTesienteshoy

import { EstadoEmocionalId } from "@/models/estadoActual";
import { createClient } from "../supabase";
import { FrecuenciaId } from "@/models/frecuencia";
import { FactorId } from "@/models/factoresImpacto";
import { NivelEmocional } from "@/models/home";

/**
 * LETRA C: PANTALLA CÓMO TE SIENTES HOY
 * Inserta el estado de ánimo seleccionado y el comentario opcional en la tabla 'historial_emociones'.
 */
export const insertarEstadoEmocional = async (userId: string, estado: string, comentario: string) => {
  const supabase = createClient();

  // Obtenemos de forma automática el día actual de la semana en español
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[new Date().getDay()];

  const { data, error } = await supabase
    .from('historial_emociones') // Nombre sugerido para la tabla en Supabase
    .insert({
      user_id: userId,
      estado: estado.toLowerCase(), // Se estandariza a minúsculas
      comentario: comentario.trim() || null, // Guarda null si el campo está vacío
      dia: diaActual
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

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
//pantalla cronograma
/**
 * LETRA C: PANTALLA CRONOGRAMA ACADÉMICO - CONFIGURACIÓN PRINCIPAL
 * Inserta la estructura básica y las preferencias de un nuevo cronograma académico.
 */
export const insertarCronogramaEstructura = async (
  userId: string,
  nombre: string,
  dias: string[],
  horaInicio: string,
  horaFin: string,
  actividadesPredefinidas: string[],
  color: string,
  recordatorios: boolean
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cronogramas') // Nombre sugerido para la tabla base del cronograma
    .insert({
      user_id: userId,
      nombre: nombre.trim() || 'Mi Cronograma',
      dias_configurados: dias, // Se almacena como un array de strings (Text[])
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      actividades_predefinidas: actividadesPredefinidas, // Array de categorías seleccionadas
      color_tema: color,
      recordatorios_activos: recordatorios
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

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

//pantalla evaluacion 
/**
 * LETRA C: PANTALLA EVALUACIÓN (TEST PSS-4)
 * Almacena de manera permanente el puntaje total obtenido, el nivel de estrés clasificado
 * y la clave-valor de las respuestas individuales para el seguimiento clínico e histórico.
 */
export const insertarResultadoEvaluacionEstres = async (
  userId: string,
  puntajeTotal: number,
  nivelEstres: "Bajo" | "Moderado" | "Alto",
  respuestasIndividuales: Record<string, number>
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('evaluaciones_estres') // Nombre recomendado para la tabla de tests psicológicos históricos
    .insert({
      user_id: userId,
      puntaje_total: puntajeTotal,       // De 0 a 16 puntos
      nivel_estres: nivelEstres,         // "Bajo", "Moderado" o "Alto"
      respuestas_json: respuestasIndividuales, // Guarda un objeto como { p1: 2, p2: 1, p3: 4, p4: 0 }
      evaluado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// pantalla factores de impacto
/**
 * LETRA C: PANTALLA FACTORES DE IMPACTO (PASO 3)
 * Registra de forma masiva los factores que afectan el bienestar del usuario,
 * incluyendo soporte para un texto libre personalizado si seleccionó "Otro".
 */
export const insertarFactoresImpactoBienestar = async (
  userId: string,
  factoresIds: FactorId[],
  otroTextoEspecificado?: string
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('factores_impacto_usuario') // Nombre sugerido para la tabla relacional de factores de riesgo o impacto
    .insert({
      user_id: userId,
      paso: 3,
      factores_seleccionados: factoresIds, // Guarda el array de identificadores de Supabase como ["falta_tiempo", "ansiedad", "otro"]
      otro_especificar_texto: factoresIds.includes('otro') ? otroTextoEspecificado : null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
// pantalla frecuencia
/**
 * LETRA C: PANTALLA FRECUENCIA (PASO 5)
 * Almacena la respuesta del usuario referente a la frecuencia de sus síntomas de estrés o ansiedad.
 */
export const insertarFrecuenciaEstresAnsiedad = async (
  userId: string,
  frecuenciaId: FrecuenciaId
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('respuestas_cuestionario') // Se asocia a la tabla común de respuestas del perfil inicial
    .insert({
      user_id: userId,
      paso: 5,
      frecuencia_estres_id: frecuenciaId, // Almacena el identificador único: "todos_los_dias", "varias_semana", etc.
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// pantalla home
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


// pantalla meditacion
/**
 * LETRA C: PANTALLA MEDITACIÓN Y RESPIRACIÓN
 * Registra una sesión de relajación o respiración completada con éxito
 * para el seguimiento de minutos de bienestar acumulados por el alumno.
 */
export async function insertarSesionBienestarCompletada(userId: string,
    tipoPractica: SessionType, // "respiracion" | "meditacion"
    duracionMinutos: number // 2, 5, 10, 15, 20
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('historial_sesiones_bienestar') // Tabla asignada para el registro de minutos acumulados
        .insert({
            user_id: userId,
            tipo: tipoPractica,
            duracion_minutos: duracionMinutos,
            completado_at: new Date().toISOString()
        })
        .select();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

// pantalla motivos
/**
 * LETRA C: PANTALLA MOTIVOS
 * Registra por primera vez los motivos seleccionados por el estudiante
 * durante su proceso de inducción u onboarding en la aplicación.
 */
export const insertarMotivosOnboarding = async (
  userId: string,
  motivosSeleccionados: string[], // Arreglo de los IDs seleccionados (ej: ["estres", "dormir"])
  otroTextoEspecificado?: string  // Texto opcional en caso de marcar "Otro"
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('motivos_registro_usuario') // Tabla asignada para capturar las preferencias de onboarding
    .insert({
      user_id: userId,
      motivos: motivosSeleccionados,
      otro_motivo_texto: otroTextoEspecificado || null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// pantalla preferencias de apoyo
/**
 * LETRA C: PANTALLA PREFERENCIAS DE APOYO
 * Registra los tipos de apoyo seleccionados por el estudiante
 * durante su proceso de inducción y configuración inicial.
 */
export const insertarPreferenciasApoyo = async (
  userId: string,
  preferenciasSeleccionadas: string[] // Arreglo de IDs elegidos (ej: ["ejercicios_calma", "chat_ia"])
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('preferencias_apoyo_usuario') // Tabla asignada para guardar los pilares de apoyo elegidos
    .insert({
      user_id: userId,
      preferencias: preferenciasSeleccionadas,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// pantalla register
/**
 * LETRA C: PANTALLA REGISTER
 * Registra un nuevo alumno en la base de datos de la aplicación.
 * Nota: Si estás implementando autenticación nativa con Supabase Auth,
 * se utiliza signUp(), pero si mapeas los datos a una tabla personalizada 
 * de perfiles, se ejecuta un .insert() estándar.
 */
export const registrarNuevoAlumno = async (alumno: {
  nombre: string;
  correo: string;
  facultad: string;
  clave: string; // Se recomienda que la contraseña viaje ya encriptada o manejada por el proveedor de Auth
}) => {
  const supabase = createClient();

  // Opción por tabla personalizada de perfiles de estudiantes
  const { data, error } = await supabase
    .from('alumnos_perfiles')
    .insert({
      nombre_completo: alumno.nombre,
      correo_institucional: alumno.correo,
      facultad_escuela: alumno.facultad,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// pantalla registro emocional
/**
 * LETRA C: PANTALLA REGISTRO EMOCIONAL
 * Almacena de forma persistente el estado de ánimo diario ingresado 
 * por el estudiante junto con sus anotaciones personales.
 */
export const insertarRegistroEmocionalDiario = async (
  userId: string,
  emocionLabel: string, // Nombre de la emoción seleccionada (ej: "Ansioso")
  anotacionOpcional?: string // Texto opcional ingresado en el campo libre
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('registros_emocionales') // Tabla asignada para el historial de estados de ánimo
    .insert({
      user_id: userId,
      emocion: emocionLabel,
      nota_contextual: anotacionOpcional || null,
      creado_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};