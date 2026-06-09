// DELATE

/**
 * Función para borrar un día seleccionado del cronograma en el estado local.
 */
export const deleteSelectedDay = (currentDays: string[], dayToRemove: string): string[] => {
  return currentDays.filter((day) => day !== dayToRemove);
};

/**
 * Función para borrar una actividad seleccionada del cronograma en el estado local.
 * Se activa al desmarcar una de las opciones en la pantalla.
 */
export const deleteSelectedActivity = (currentActivities: string[], activityToRemove: string): string[] => {
  return currentActivities.filter((activity) => activity !== activityToRemove);
};

interface CronogramaActivity {
  id: string;
  name: string;
  location?: string;
  startTime: string;
  endTime: string;
}

/**
 * Elimina una actividad específica del cronograma diario basado en su ID.
 * Se utiliza para limpiar bloques de la agenda en la pantalla.
 */
export const deleteCronogramaActivity = (
  currentActivities: CronogramaActivity[],
  activityIdToRemove: string
): CronogramaActivity[] => {
  return currentActivities.filter((activity) => activity.id !== activityIdToRemove);
};