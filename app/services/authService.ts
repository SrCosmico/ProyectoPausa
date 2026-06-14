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
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};