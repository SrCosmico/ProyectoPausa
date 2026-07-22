import type { ActividadCronogramaGuardada } from '@/lib/supabase/cronograma';
import type { ParcialConMateria } from '@/models/cronogramaAcademico';

export interface CacheOfflineCronograma {
  actividades: ActividadCronogramaGuardada[];
  parciales: ParcialConMateria[];
  sincronizadoEn: string; // ISO timestamp
}

function claveCache(userId: string): string {
  return `pausa_cache_offline_cronograma_${userId}`;
}

/** Guarda una copia local de actividades y parciales para consulta sin conexión. */
export function guardarCacheOffline(
  userId: string,
  datos: { actividades: ActividadCronogramaGuardada[]; parciales: ParcialConMateria[] }
): void {
  if (typeof window === 'undefined') return;
  const cache: CacheOfflineCronograma = {
    ...datos,
    sincronizadoEn: new Date().toISOString(),
  };
  try {
    localStorage.setItem(claveCache(userId), JSON.stringify(cache));
  } catch (err) {
    console.warn('No se pudo guardar el cache offline (posible límite de espacio):', err);
  }
}

export function leerCacheOffline(userId: string): CacheOfflineCronograma | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(claveCache(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CacheOfflineCronograma;
  } catch {
    return null;
  }
}

/** Texto legible tipo "hace 5 minutos" / "hace 2 horas" / "hace 3 días". */
export function tiempoDesdeSincronizacion(sincronizadoEnISO: string): string {
  const diffMs = Date.now() - new Date(sincronizadoEnISO).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return 'justo ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} día${dias === 1 ? '' : 's'}`;
}

/** Genera un resumen en texto plano de la semana, para descargar y leer sin internet. */
export function generarResumenTextoSemana(
  nombreCronograma: string,
  actividades: ActividadCronogramaGuardada[],
  parciales: ParcialConMateria[]
): string {
  const hoy = new Date();
  const lineas: string[] = [];

  lineas.push(`PAUSA — Resumen semanal: ${nombreCronograma}`);
  lineas.push(`Generado: ${hoy.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  lineas.push('');
  lineas.push('=== ACTIVIDADES ===');

  if (actividades.length === 0) {
    lineas.push('No tienes actividades registradas.');
  } else {
    const ordenadas = [...actividades].sort((a, b) =>
      a.fecha === b.fecha ? a.hora_inicio.localeCompare(b.hora_inicio) : a.fecha.localeCompare(b.fecha)
    );
    ordenadas.forEach((a) => {
      lineas.push(`- [${a.fecha}] ${a.hora_inicio.slice(0, 5)}-${a.hora_fin.slice(0, 5)} · ${a.titulo}${a.ubicacion ? ` (${a.ubicacion})` : ''}`);
    });
  }

  lineas.push('');
  lineas.push('=== PARCIALES / EVALUACIONES PRÓXIMOS ===');

  if (parciales.length === 0) {
    lineas.push('No tienes parciales registrados.');
  } else {
    const ordenados = [...parciales].sort((a, b) => a.fecha.localeCompare(b.fecha));
    ordenados.forEach((p) => {
      lineas.push(`- [${p.fecha}] ${p.materia.nombre} — ${p.titulo} (${p.tipo}, dificultad ${p.materia.dificultad}/5)`);
    });
  }

  lineas.push('');
  lineas.push('Recuerda: puedes seguir consultando esta lista aunque no tengas internet o luz.');

  return lineas.join('\n');
}

/** Dispara la descarga de un archivo de texto en el navegador (funciona sin conexión una vez generado). */
export function descargarResumenSemanal(nombreArchivo: string, contenido: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith('.txt') ? nombreArchivo : `${nombreArchivo}.txt`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}