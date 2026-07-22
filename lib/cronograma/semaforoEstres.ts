import type {
  Materia,
  NivelSemaforo,
  ParcialConMateria,
  SemanaCarga,
  TecnicaEstudio,
  TipoParcial,
} from '@/models/cronogramaAcademico';

// ----------------------------------------------------
// UMBRALES DE CARGA (ajustables según feedback real de uso)
// ----------------------------------------------------
export const UMBRAL_CARGA_AMARILLO = 18;
export const UMBRAL_CARGA_ROJO = 35;

/** Factor de peso según el tipo de evaluación (una exposición pesa menos que un examen). */
const FACTOR_TIPO: Record<TipoParcial, number> = {
  parcial: 1,
  examen: 1.1,
  entrega: 0.6,
  exposicion: 0.8,
};

function obtenerLunesDeSemana(fecha: Date): Date {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0 = domingo
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function aFechaISO(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

/** Calcula el puntaje de carga de un solo parcial: dificultad de la materia x peso x factor de tipo. */
export function calcularPuntajeParcial(parcial: ParcialConMateria): number {
  const factor = FACTOR_TIPO[parcial.tipo] ?? 1;
  return parcial.materia.dificultad * parcial.peso * factor;
}

export function calcularNivelSemaforo(puntaje: number): NivelSemaforo {
  if (puntaje >= UMBRAL_CARGA_ROJO) return 'rojo';
  if (puntaje >= UMBRAL_CARGA_AMARILLO) return 'amarillo';
  return 'verde';
}

/**
 * Agrupa los parciales del usuario en semanas (lunes-domingo), calculando
 * el puntaje de carga y el nivel de semáforo de cada una.
 *
 * @param parciales   Lista completa de parciales con su materia embebida
 * @param semanas     Cuántas semanas hacia adelante mostrar (por defecto 4)
 * @param hoy         Fecha de referencia (útil para testing)
 */
export function calcularCargaSemanas(
  parciales: ParcialConMateria[],
  semanas: number = 4,
  hoy: Date = new Date()
): SemanaCarga[] {
  const lunesActual = obtenerLunesDeSemana(hoy);
  const resultado: SemanaCarga[] = [];

  for (let i = 0; i < semanas; i++) {
    const inicio = new Date(lunesActual);
    inicio.setDate(lunesActual.getDate() + i * 7);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    const inicioISO = aFechaISO(inicio);
    const finISO = aFechaISO(fin);

    const parcialesSemana = parciales.filter(
      (p) => p.fecha >= inicioISO && p.fecha <= finISO
    );

    const puntajeCarga = parcialesSemana.reduce(
      (acc, p) => acc + calcularPuntajeParcial(p),
      0
    );

    resultado.push({
      inicioSemana: inicioISO,
      finSemana: finISO,
      puntajeCarga: Math.round(puntajeCarga * 10) / 10,
      nivel: calcularNivelSemaforo(puntajeCarga),
      parciales: parcialesSemana.sort((a, b) => a.fecha.localeCompare(b.fecha)),
    });
  }

  return resultado;
}

// ----------------------------------------------------
// BANCO DE TÉCNICAS DE ESTUDIO
// ----------------------------------------------------
export const BANCO_TECNICAS_ESTUDIO: TecnicaEstudio[] = [
  {
    id: 'pomodoro',
    titulo: 'Técnica Pomodoro (25/5)',
    descripcion: '25 minutos de estudio enfocado + 5 minutos de descanso. Repite 3-4 veces antes de un descanso largo.',
    icono: '🍅',
    aplicaPara: ['verde', 'amarillo', 'rojo'],
  },
  {
    id: 'bloques_cortos',
    titulo: 'Bloques cortos de 15 minutos',
    descripcion: 'Cuando la carga es alta, estudiar en bloques de 15 minutos reduce la sensación de agobio y facilita empezar.',
    icono: '⏱️',
    aplicaPara: ['rojo'],
  },
  {
    id: 'repaso_espaciado',
    titulo: 'Repaso espaciado',
    descripcion: 'Revisa el mismo tema en intervalos crecientes (hoy, en 2 días, en 5 días) en vez de todo junto.',
    icono: '🔁',
    aplicaPara: ['verde', 'amarillo'],
  },
  {
    id: 'recuperacion_activa',
    titulo: 'Recuperación activa (active recall)',
    descripcion: 'Cierra el material y trata de explicar el tema en voz alta o por escrito, sin mirar los apuntes.',
    icono: '🧠',
    aplicaPara: ['verde', 'amarillo', 'rojo'],
  },
  {
    id: 'priorizacion_dificultad',
    titulo: 'Prioriza por dificultad',
    descripcion: 'Estudia primero la materia que marcaste como más difícil, cuando tu energía mental está más fresca.',
    icono: '🎯',
    aplicaPara: ['amarillo', 'rojo'],
  },
  {
    id: 'pausas_activas',
    titulo: 'Pausas activas obligatorias',
    descripcion: 'Con una semana tan cargada, agenda pausas de 5-10 min cada hora. Ayuda a sostener el ritmo sin quemarte.',
    icono: '🌿',
    aplicaPara: ['rojo'],
  },
];

/** Devuelve las técnicas recomendadas para el nivel de semáforo dado. */
export function obtenerTecnicasSugeridas(nivel: NivelSemaforo): TecnicaEstudio[] {
  return BANCO_TECNICAS_ESTUDIO.filter((t) => t.aplicaPara.includes(nivel));
}

/** Texto corto de acompañamiento según el nivel, para mostrar junto al semáforo. */
export function obtenerMensajeSemaforo(nivel: NivelSemaforo): string {
  switch (nivel) {
    case 'rojo':
      return 'Esta semana está muy cargada. Vamos a organizarla en bloques pequeños para que no se sienta tan pesada.';
    case 'amarillo':
      return 'Semana con carga moderada. Es buen momento para adelantar repasos antes de que se acumule todo.';
    default:
      return 'Semana tranquila. Aprovecha para repasar con calma o adelantar contenido.';
  }
}