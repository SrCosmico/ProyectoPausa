// DELATE

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

/**
 * Elimina una nota específica del estado local basado en su ID.
 * Se utilizará para el mantenimiento del CRUD del sistema de notas de la app.
 */
export const deleteNota = (currentNotas: Nota[], notaIdToRemove: string): Nota[] => {
  return currentNotas.filter((nota) => nota.id !== notaIdToRemove);
};