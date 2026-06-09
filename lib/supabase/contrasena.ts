// DELATE

import { type Nota } from '@/models/contrasena'

/**
 * Elimina una nota específica del estado local basado en su ID.
 * Se utilizará para el mantenimiento del CRUD del sistema de notas de la app.
 */
export const deleteNota = (
  currentNotas: Nota[],
  notaIdToRemove: number
): Nota[] => {
  return currentNotas.filter((nota) => nota.id !== notaIdToRemove)
}

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
  const nuevaNota = {
    user_id: userId,
    titulo: titulo.trim() || 'Sin título',
    contenido: contenido.trim(),
    emoji_dia: emojiDia,
    label_dia: labelDia,
    fecha: new Date().toLocaleDateString(),
  }

  if (typeof window !== 'undefined') {
    const existentes = JSON.parse(
      localStorage.getItem(`diario_notas_${userId}`) ?? '[]'
    ) as Array<typeof nuevaNota & { id: number }>
    existentes.push({ ...nuevaNota, id: Date.now() })
    localStorage.setItem(`diario_notas_${userId}`, JSON.stringify(existentes))
    return existentes
  }

  return [nuevaNota]
}

// ============================================================
// CRUD: Letra "R" pantalla de contrasena (diario personal)
// ============================================================

const _notasDiarioDummy: Nota[] = [
  {
    id: 1,
    titulo: 'Mi primer día en Pausa',
    contenido:
      'Hoy empecé a usar la app. Me siento con esperanza de mejorar mis hábitos de bienestar.',
    fecha: new Date().toLocaleDateString(),
    emoji: '💜',
  },
  {
    id: 2,
    titulo: 'Semana de exámenes',
    contenido:
      'El estrés de los parciales es alto, pero intento respirar y mantenerme enfocado.',
    fecha: new Date(Date.now() - 86_400_000).toLocaleDateString(),
    emoji: '💛',
  },
]

/**
 * Devuelve las notas iniciales del diario (dummy).
 * Se usa para inicializar el useState<Nota[]> en la page.
 */
export function leerNotasDiarioInicial(): Nota[] {
  return _notasDiarioDummy
}

/** Busca y devuelve una nota del diario por su ID. */
export function leerNotaDiarioPorId(
  notas: Nota[],
  id: number
): Nota | undefined {
  return notas.find((n) => n.id === id)
}

/** Devuelve las notas ordenadas de más reciente a más antigua. */
export function leerNotasDiarioOrdenadas(notas: Nota[]): Nota[] {
  return [...notas].sort((a, b) => b.id - a.id)
}

async function actualizarEntradaDiario(
  diarioId: string,
  nuevoTexto: string,
  nuevoTitulo: string
) {
  if (typeof window !== 'undefined') {
    const entradas = JSON.parse(
      localStorage.getItem('diario_entradas') ?? '[]'
    ) as Array<{ id: string; titulo: string; contenido: string }>
    const actualizadas = entradas.map((e) =>
      e.id === diarioId
        ? {
            ...e,
            titulo: nuevoTitulo,
            contenido: nuevoTexto,
            fecha_edicion: new Date().toISOString(),
          }
        : e
    )
    localStorage.setItem('diario_entradas', JSON.stringify(actualizadas))
    return { data: actualizadas, error: null }
  }
  return { data: null, error: null }
}

export { actualizarEntradaDiario }
