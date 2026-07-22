import type { Materia, Parcial, ParcialConMateria } from '@/models/cronogramaAcademico';

/**
 * Emociones (las mismas etiquetas de `listaEmociones` en models/registroEmocional.ts)
 * que activan la intervención inmediata si hay un parcial próximo.
 * Ajusta esta lista si agregas más estados emocionales.
 */
export const EMOCIONES_QUE_ACTIVAN_INTERVENCION: string[] = ['Ansioso', 'Triste'];

export const DIAS_VENTANA_ALERTA = 5;

export function debeActivarIntervencion(estadoEmocional: string): boolean {
  return EMOCIONES_QUE_ACTIVAN_INTERVENCION.includes(estadoEmocional);
}

export interface BloqueEstudioSugerido {
  titulo: string;
  duracionMinutos: number;
  descripcion: string;
}

export interface IntervencionEmocional {
  materia: Materia;
  parcial: Parcial;
  diasRestantes: number;
  mensaje: string;
  bloquesSugeridos: BloqueEstudioSugerido[];
}

function calcularDiasRestantes(fechaISO: string, hoy: Date = new Date()): number {
  const hoyISO = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fechaParcial = new Date(anio, mes - 1, dia);
  const diffMs = fechaParcial.getTime() - hoyISO.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** De una lista de parciales próximos, devuelve el más urgente (el más cercano en fecha). */
export function obtenerParcialMasUrgente(
  parciales: ParcialConMateria[],
  hoy: Date = new Date()
): ParcialConMateria | null {
  if (parciales.length === 0) return null;
  return [...parciales].sort(
    (a, b) => calcularDiasRestantes(a.fecha, hoy) - calcularDiasRestantes(b.fecha, hoy)
  )[0];
}

/** Genera bloques de estudio sugeridos según la dificultad de la materia y los días restantes. */
function generarBloquesSugeridos(materia: Materia, diasRestantes: number): BloqueEstudioSugerido[] {
  const urgente = diasRestantes <= 1;
  const dificultadAlta = materia.dificultad >= 4;

  if (urgente || dificultadAlta) {
    return [
      { titulo: 'Bloque 1: Repaso rápido', duracionMinutos: 20, descripcion: 'Repasa tus apuntes o resumen general del tema.' },
      { titulo: 'Bloque 2: Práctica activa', duracionMinutos: 25, descripcion: 'Resuelve ejercicios o preguntas de práctica sin ver el material.' },
      { titulo: 'Bloque 3: Puntos débiles', duracionMinutos: 20, descripcion: 'Enfócate solo en lo que te costó del bloque anterior.' },
    ];
  }

  return [
    { titulo: 'Bloque 1: Estudio enfocado', duracionMinutos: 30, descripcion: 'Sesión Pomodoro sobre el tema principal del parcial.' },
    { titulo: 'Bloque 2: Recuperación activa', duracionMinutos: 25, descripcion: 'Explica el tema en voz alta o por escrito sin mirar los apuntes.' },
  ];
}

/** Construye el mensaje y los bloques sugeridos para el modal de intervención. */
export function construirIntervencionEmocional(
  parcialUrgente: ParcialConMateria,
  hoy: Date = new Date()
): IntervencionEmocional {
  const diasRestantes = calcularDiasRestantes(parcialUrgente.fecha, hoy);
  const { materia } = parcialUrgente;

  const cuandoTexto =
    diasRestantes <= 0
      ? 'es hoy'
      : diasRestantes === 1
      ? 'es mañana'
      : `es en ${diasRestantes} días`;

  const mensaje = `Veo que tienes ${parcialUrgente.tipo === 'examen' ? 'un examen' : 'un parcial'} de ${materia.nombre} que ${cuandoTexto}. Vamos a pausar unos minutos con un ejercicio de respiración y luego dividir tu estudio en bloques cortos.`;

  return {
    materia,
    parcial: parcialUrgente,
    diasRestantes,
    mensaje,
    bloquesSugeridos: generarBloquesSugeridos(materia, diasRestantes),
  };
}