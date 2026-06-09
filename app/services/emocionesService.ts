// app/services/emocionesService.ts
import { RegistroEmocion, Recomendacion } from '@/app/types';

const HISTORIAL_KEY = 'historial_emociones_local';
const RECOMENDACIONES_DUMMY: Recomendacion[] = [
  { estado_animo: 'bien', consejo: '¡Vas por buen camino! Sigue con tus hábitos de bienestar.' },
  { estado_animo: 'regular', consejo: 'Prueba una respiración consciente de 5 minutos.' },
  { estado_animo: 'mal', consejo: 'Tómate un momento para descansar y hablar con alguien de confianza.' },
  { estado_animo: 'triste', consejo: 'Escribe en tu diario lo que sientes. Liberar emociones ayuda.' },
  { estado_animo: 'ansioso', consejo: 'Realiza el ejercicio 4-7-8 para calmar tu sistema nervioso.' },
];

function leerHistorialStorage(): RegistroEmocion[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) ?? '[]') as RegistroEmocion[];
  } catch {
    return [];
  }
}

/**
 * FUNCIÓN 1: Guardar una nueva emoción en almacenamiento local
 */
export const guardarEmocion = async (emocion: RegistroEmocion) => {
  if (typeof window === 'undefined') {
    return { success: false, error: { message: 'Almacenamiento no disponible' } };
  }

  const historial = leerHistorialStorage();
  const registro: RegistroEmocion = {
    ...emocion,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };
  historial.push(registro);
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
  return { success: true, data: [registro] };
};

/**
 * FUNCIÓN 2: Obtener todo el historial de un usuario específico
 */
export const obtenerHistorialUsuario = async (userId: string) => {
  return leerHistorialStorage()
    .filter((r) => r.user_id === userId)
    .sort((a, b) => {
      const fechaA = a.created_at ?? '';
      const fechaB = b.created_at ?? '';
      return fechaA.localeCompare(fechaB);
    });
};

/**
 * FUNCIÓN 3: Obtener recomendaciones basadas en el estado de ánimo actual
 */
export const obtenerRecomendacionPorAnimo = async (estadoAnimo: string) => {
  const recomendacion = RECOMENDACIONES_DUMMY.find(
    (r) => r.estado_animo === estadoAnimo.toLowerCase()
  );
  return recomendacion ?? RECOMENDACIONES_DUMMY[0];
};
