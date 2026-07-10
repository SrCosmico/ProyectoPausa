// models/registro.ts
/**
 * Wrapper de servicio para el registro de usuarios.
 * Mantiene la firma que ya usa RegisterView:
 *   const { data, error } = await registrarUsuario(correo, clave, nombre, facultad)
 */
export const registrarUsuario = async (
  correo: string,
  clave: string,
  nombre: string,
  facultad: string
) => {
  try {
    // Implementar lógica de registro aquí
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};