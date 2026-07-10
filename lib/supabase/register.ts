// lib/supabase/crud-register.ts  (o donde tengas tu CRUD de registro)
import supabase from '@/lib/supabase';

/**
 * LETRA C: PANTALLA REGISTER
 * 1. Crea el usuario en Supabase Auth con signUp().
 * 2. Si tiene éxito, inserta su perfil en la tabla `perfiles`.
 * 3. Guarda datos en localStorage para uso posterior (cuestionario / bienvenida).
 *
 * Con confirmación de correo activa, signUp() devuelve data.user pero
 * data.session = null. El usuario no puede iniciar sesión hasta confirmar.
 */
export const registrarNuevoAlumno = async (alumno: {
  nombre: string;
  correo: string;
  facultad: string;
  clave: string;
}) => {
  // ── 1. Crear usuario en Auth ──────────────────────────────────────────────
  const { data, error } = await supabase.auth.signUp({
    email: alumno.correo,
    password: alumno.clave,
    options: {
      data: {
        nombre_usuario: alumno.nombre,
        facultad: alumno.facultad,
      },
    },
  });

  if (error) return { data: null, error };
  if (!data.user) return { data: null, error: new Error('No se pudo crear el usuario.') };

  // ── 2. Insertar perfil en la tabla `perfiles` ─────────────────────────────
  // Lo hacemos con el ID que devuelve Auth para enlazar ambas tablas.
  // Si ya tienes un trigger en Supabase que crea el perfil automáticamente,
  // puedes eliminar este bloque sin problema.
  const { error: perfilError } = await supabase
    .from('perfiles')
    .insert({
      id: data.user.id,
      nombre: alumno.nombre,
      facultad: alumno.facultad,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    });

  if (perfilError) {
    // No bloqueamos el flujo: el usuario ya existe en Auth.
    // El perfil se puede crear / completar más adelante.
    console.error('[registrarNuevoAlumno] Error al insertar perfil:', perfilError.message);
  }

  // ── 3. Persistir datos de sesión en localStorage ──────────────────────────
  if (typeof window !== 'undefined') {
    localStorage.setItem('alumnoNombre', alumno.nombre);
    localStorage.setItem('alumnoEmail', alumno.correo);
    localStorage.setItem('alumnoFacultad', alumno.facultad);
  }

  return { data, error: null };
};
