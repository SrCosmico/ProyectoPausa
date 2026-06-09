// Interface estricta para definir qué es una Nota en TypeScript
export interface NotaDiario {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

const STORAGE_KEY = 'diario_notas_local';

function leerNotasStorage(): NotaDiario[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as NotaDiario[];
  } catch {
    return [];
  }
}

function guardarNotasStorage(notas: NotaDiario[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
}

// ========================================================
// CAPA DE SERVICIOS: DIARIO EMOCIONAL (CRUD COMPLETO)
// ========================================================

/**
 * LETRA C (Create): Inserta una nueva nota escrita por el alumno
 */
export const crearNotaDiario = async (
  userId: string,
  titulo: string,
  contenido: string
): Promise<NotaDiario[]> => {
  const notas = leerNotasStorage();
  const nuevaNota: NotaDiario = {
    id: Date.now().toString(),
    user_id: userId,
    titulo: titulo.trim() || 'Sin título',
    contenido: contenido.trim(),
    fecha: new Date().toISOString(),
  };
  notas.unshift(nuevaNota);
  guardarNotasStorage(notas);
  return [nuevaNota];
};

/**
 * LETRA R (Read): Lee todas las notas guardadas de un alumno específico
 */
export const obtenerNotasDiario = async (
  userId: string
): Promise<NotaDiario[]> => {
  return leerNotasStorage().filter((n) => n.user_id === userId);
};

/**
 * LETRA U (Update): Actualiza el título o contenido de una nota existente
 */
export const actualizarNotaDiario = async (
  notaId: string,
  nuevoTitulo: string,
  nuevoContenido: string
): Promise<NotaDiario[]> => {
  const notas = leerNotasStorage();
  const actualizadas = notas.map((n) =>
    n.id === notaId
      ? {
          ...n,
          titulo: nuevoTitulo.trim(),
          contenido: nuevoContenido.trim(),
        }
      : n
  );
  guardarNotasStorage(actualizadas);
  return actualizadas.filter((n) => n.id === notaId);
};

/**
 * LETRA D (Delete): Elimina una nota permanentemente mediante su ID
 */
export const borrarNotaDiario = async (notaId: string): Promise<boolean> => {
  const notas = leerNotasStorage();
  guardarNotasStorage(notas.filter((n) => n.id !== notaId));
  return true;
};
