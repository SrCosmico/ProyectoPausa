import supabase from '@/lib/supabase'; // Ajustado según tu árbol de carpetas

// 1. REGISTRO (Agregamos facultad)
export const registrarUsuario = async (email: string, password: string, nombre: string, facultad: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_usuario: nombre,
        facultad: facultad, // Guardamos la facultad en los metadatos oficiales
      }
    }
  });
  return { data, error };
};

// 2. LOGIN
export const iniciarSesion = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// 3. CERRAR SESIÓN
// `scope: 'local'` borra la sesión del navegador (cookies/local storage)
// de inmediato, sin esperar un viaje de ida y vuelta al servidor de
// Supabase para revocar la sesión en TODOS los dispositivos (eso es lo
// que hacía el modo por defecto, y es lo que hacía sentir el botón lento
// — el spinner se quedaba esperando esa respuesta de red).
// Trade-off consciente: el token de este dispositivo técnicamente sigue
// siendo válido en el servidor hasta que expire de forma natural (normal-
// mente ~1 hora), en vez de invalidarse al instante. Para esta app no es
// un problema de seguridad relevante, y a cambio el cierre de sesión se
// siente instantáneo.
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  return { error };
};