// DELATE

/**
 * Función para borrar un elemento del estado local.
 */
export const deleteItem = (currentList: string[], itemToRemove: string): string[] => {
  return currentList.filter((item) => item !== itemToRemove);
};