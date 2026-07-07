import { createClient } from '@/lib/supabase/client';

const getSupabase = () => createClient();

export interface ResultadoCuenta {
  error: string | null;
}

/** Actualiza el correo del usuario autenticado. Supabase envía un correo de confirmación. */
export async function actualizarCorreoUsuario(nuevoCorreo: string): Promise<ResultadoCuenta> {
  const { error } = await getSupabase().auth.updateUser({ email: nuevoCorreo.trim() });
  return { error: error?.message ?? null };
}

/** Actualiza la contraseña del usuario autenticado. */
export async function actualizarContrasenaUsuario(nuevaContrasena: string): Promise<ResultadoCuenta> {
  const { error } = await getSupabase().auth.updateUser({ password: nuevaContrasena });
  return { error: error?.message ?? null };
}