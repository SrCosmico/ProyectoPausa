import { createClient } from '../supabase'

async function crearRegistroEmocional(registro: any) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('registros_emocionales')
    .insert(registro)
    .select()

  if (error) {
    console.error("No se pudo crear el registro emocional:", error.message)
  } else {
    console.log("Registro emocional creado:", data)
  }
}

// Ejemplo de uso
const nuevoRegistro = {
  usuario_id: '12345',
  dia: 'Lunes',
  estado: 'bien',
  descripcion: 'Me siento bien hoy, tuve un buen día en la universidad.'
}

crearRegistroEmocional(nuevoRegistro)

async function obtenerRegistrosEmocionales (usuarioId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('registros_emocionales')
    .select('*')
    .eq('usuario_id', usuarioId)

  if (error) {
    console.error("No se pudieron obtener los registros emocionales:", error.message)
  } else {
    console.log("Registros emocionales obtenidos:", data)
  }
}

async function obtenerultimos7dias (usuarioId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('registros_emocionales')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false })
    .limit(7)

  if (error) {
    console.error("No se pudieron obtener los registros emocionales de los últimos 7 días:", error.message)
  } else {
    console.log("Registros emocionales de los últimos 7 días obtenidos:", data)
  }
}

//registrar en mi tabla "1000" tips anti-estrés y luego hacer una funcion para que me de un tip aleatorio de esos tips hacerlo con supabase
// guardar los tips anti estres en una tabla
//1ero ver si ya preguntamos como te sientes hoy, si se cumple, preguntar como te sientes ahora

async function yahizoregistroemocionalhoy (usuarioId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('registros_emocionales')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('fecha', new Date().toISOString().split('T')[0]) // Verificar si ya hay un registro para hoy
  return { data, error }
}

//llamar si ya hizo un registro emocional hoy, si no lo hizo, preguntar, si ya hay un registro, preguntar algo nuevo (UPDATE)
//crear una funcion del como te sientes ahora

export async function actualizarRegistroEmocional(registroId: string, nuevoEstado: string, nuevaDescripcion: string) {
  const supabase = createClient();
  return await supabase.from('registros_emocionales')
    .update({ estado: nuevoEstado, descripcion: nuevaDescripcion })
    .eq('id', registroId);
}

//mostrarle a la ia lo que queremos hacer con las pantallas y si las interface cumple
//preguntar el crud...
