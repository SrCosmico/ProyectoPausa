import { obtenerEstadoPreguntaDiaria, obtenerPreguntaPorPaso } from './home'
import {
  cargarQuizState,
  limpiarEmocionTemporal,
  obtenerEmocionTemporal,
  obtenerUsuarioIdLocal,
  registrarRespuesta,
} from './quizState'

export interface RegistroEmocionalInput {
  usuario_id: string
  estado: string
  descripcion?: string
  emoji?: string
  fecha?: string
}

export async function crearRegistroEmocional(registro: RegistroEmocionalInput) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === 'undefined') {
    return { data: null, error: { message: 'Error al acceder al almacenamiento local' } }
  }

  const userId = registro.usuario_id || obtenerUsuarioIdLocal()

  const nuevoEstado = registrarRespuesta(userId, {
    estado: registro.estado,
    descripcion: registro.descripcion,
    emoji: registro.emoji,
  })

  return { data: [nuevoEstado], error: null }
}

export { obtenerEmocionTemporal, limpiarEmocionTemporal }

export async function obtenerTituloRegistro(usuarioId: string): Promise<string> {
  const { data } = await obtenerEstadoPreguntaDiaria(usuarioId)
  const paso = data?.pasoActual ?? 0
  return obtenerPreguntaPorPaso(paso)
}

export async function actualizarRegistroEmocional(
  registroId: string,
  nuevoEstado: string,
  nuevaDescripcion: string
) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const userId = obtenerUsuarioIdLocal()
  registrarRespuesta(userId, {
    estado: nuevoEstado,
    descripcion: nuevaDescripcion,
  })

  return {
    data: [{ id: registroId, estado: nuevoEstado, descripcion: nuevaDescripcion }],
    error: null,
  }
}

export async function obtenerultimos7dias(usuarioId: string) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (typeof window === 'undefined') {
    return { data: [], error: null }
  }

  const id = usuarioId || obtenerUsuarioIdLocal()
  const historial = cargarQuizState(id).historial
  return { data: historial.slice(-7), error: null }
}
