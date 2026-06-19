// ==========================================
// Cálculo del promedio de bienestar de los últimos 7 días
// Lógica pura (sin dependencias de React) para poder testearla
// y reutilizarla tanto en el cliente como en funciones server-side.
// ==========================================

export interface RegistroBienestarInput {
  /** Valor numérico del estado de ánimo, escala 1-5 */
  nivel: number;
  /** Fecha/hora del registro. Acepta ISO string, "YYYY-MM-DD" o Date */
  fecha: string | Date;
}

export interface PromedioBienestarResultado {
  /** Promedio exacto (sin redondear) o null si no hay registros en el rango */
  promedio: number | null;
  /** Registros que cayeron dentro de la ventana de 7 días */
  registrosConsiderados: RegistroBienestarInput[];
  cantidadRegistros: number;
}

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Convierte el campo fecha (string | Date) a timestamp en ms.
 * Si la fecha viene en formato "YYYY-MM-DD" (sin hora), se ancla al
 * mediodía local para evitar saltos de día por husos horarios/UTC.
 */
function aTimestamp(fecha: string | Date): number {
  if (fecha instanceof Date) return fecha.getTime();
  const esSoloFecha = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  return esSoloFecha ? new Date(`${fecha}T12:00:00`).getTime() : new Date(fecha).getTime();
}

/**
 * Filtra los registros que caen dentro de los últimos 7 días (incluyendo hoy)
 * y calcula el promedio numérico EXACTO (sin redondear) del nivel de bienestar.
 *
 * @param registros Lista de registros { nivel: 1-5, fecha: string | Date }
 * @param ahoraMs   (opcional, útil para testing) timestamp de referencia, por defecto Date.now()
 */
export function calcularPromedioUltimos7Dias(
  registros: RegistroBienestarInput[],
  ahoraMs: number = Date.now()
): PromedioBienestarResultado {
  const registrosConsiderados = registros.filter((registro) => {
    const t = aTimestamp(registro.fecha);
    if (Number.isNaN(t)) return false;
    const diferencia = ahoraMs - t;
    // Solo registros del pasado (o de hoy) dentro de la ventana de 7 días
    return diferencia >= 0 && diferencia <= SIETE_DIAS_MS;
  });

  if (registrosConsiderados.length === 0) {
    return { promedio: null, registrosConsiderados: [], cantidadRegistros: 0 };
  }

  const suma = registrosConsiderados.reduce((acc, r) => acc + Number(r.nivel), 0);
  const promedio = suma / registrosConsiderados.length;

  return {
    promedio,
    registrosConsiderados,
    cantidadRegistros: registrosConsiderados.length,
  };
}