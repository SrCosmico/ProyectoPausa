//esto es un estado local para manejar el quiz diario, se guarda en localStorage por usuario para no perder el progreso si recarga la página o cierra sesión y vuelve a entrar
export const MAX_CHECKINS_DIARIOS = 3

export interface QuizAnswer {
  id: string
  estado: string
  descripcion?: string
  emoji?: string
  questionIndex: number
  timestamp: string
}

export interface QuizState {
  currentQuestionIndex: number
  justSavedCheckin: boolean
  historial: QuizAnswer[]
  tempEstado: string | null
  tempEmoji: string | null
}

const ESTADO_INICIAL: QuizState = {
  currentQuestionIndex: 0,
  justSavedCheckin: false,
  historial: [],
  tempEstado: null,
  tempEmoji: null,
}

export function getQuizStorageKey(userId: string): string {
  return `quiz_state_${userId}`
}

export function obtenerUsuarioIdLocal(): string {
  if (typeof window === 'undefined') return 'guest'
  return localStorage.getItem('alumnoEmail')?.trim() || 'guest'
}

export function cargarQuizState(userId: string): QuizState {
  if (typeof window === 'undefined') return { ...ESTADO_INICIAL }

  const raw = localStorage.getItem(getQuizStorageKey(userId))
  if (!raw) return { ...ESTADO_INICIAL }

  try {
    const parsed = JSON.parse(raw) as Partial<QuizState>
    const index = parsed.currentQuestionIndex ?? 0

    return {
      currentQuestionIndex: Math.min(Math.max(index, 0), MAX_CHECKINS_DIARIOS),
      justSavedCheckin: parsed.justSavedCheckin ?? false,
      historial: Array.isArray(parsed.historial) ? parsed.historial : [],
      tempEstado: parsed.tempEstado ?? null,
      tempEmoji: parsed.tempEmoji ?? null,
    }
  } catch {
    return { ...ESTADO_INICIAL }
  }
}

export function guardarQuizState(userId: string, state: QuizState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getQuizStorageKey(userId), JSON.stringify(state))
}

export function obtenerCurrentQuestionIndex(userId: string): number {
  return cargarQuizState(userId).currentQuestionIndex
}

export function hayGuardadoReciente(userId: string): boolean {
  return cargarQuizState(userId).justSavedCheckin
}

export function limpiarSenalGuardadoReciente(userId: string): void {
  const state = cargarQuizState(userId)
  guardarQuizState(userId, { ...state, justSavedCheckin: false })
}

export function guardarEmocionTemporal(
  userId: string,
  estado: string,
  emoji: string
): void {
  const state = cargarQuizState(userId)
  guardarQuizState(userId, {
    ...state,
    tempEstado: estado,
    tempEmoji: emoji,
  })
}

export function obtenerEmocionTemporal(userId: string) {
  const { tempEstado, tempEmoji } = cargarQuizState(userId)
  return { estado: tempEstado, emoji: tempEmoji }
}

export function limpiarEmocionTemporal(userId: string): void {
  const state = cargarQuizState(userId)
  guardarQuizState(userId, {
    ...state,
    tempEstado: null,
    tempEmoji: null,
  })
}

export function registrarRespuesta(
  userId: string,
  respuesta: {
    estado: string
    descripcion?: string
    emoji?: string
  }
): QuizState {
  const state = cargarQuizState(userId)
  const questionIndex = state.currentQuestionIndex

  const nuevaRespuesta: QuizAnswer = {
    id: Date.now().toString(),
    questionIndex,
    timestamp: new Date().toISOString(),
    estado: respuesta.estado,
    descripcion: respuesta.descripcion,
    emoji: respuesta.emoji,
  }

  const nuevoEstado: QuizState = {
    ...state,
    currentQuestionIndex: Math.min(questionIndex + 1, MAX_CHECKINS_DIARIOS),
    justSavedCheckin: true,
    historial: [...state.historial, nuevaRespuesta],
    tempEstado: null,
    tempEmoji: null,
  }

  guardarQuizState(userId, nuevoEstado)
  return nuevoEstado
}
