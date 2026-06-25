// lib/supabase/perfil.ts
import { createClient } from '@/lib/supabase/client';
import {
  opcionesMenuPerfil,
  usuarioDefecto,
  type UsuarioPerfil,
  type OpcionMenu,
} from '@/models/perfil';

const supabase = createClient();

export async function leerPerfilUsuario(userId: string): Promise<UsuarioPerfil> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('nombre, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) return { ...usuarioDefecto };

  return {
    nombre: data.nombre || usuarioDefecto.nombre,
    correo: usuarioDefecto.correo,
    avatar: data.avatar_url || null,
  };
}

export function leerOpcionesMenuPerfil(): OpcionMenu[] {
  return opcionesMenuPerfil;
}

export async function actualizarPerfil(
  userId: string,
  nuevosDatos: { nombre?: string; biografia?: string; avatar_url?: string }
) {
  const { data, error } = await supabase
    .from('perfiles')
    .upsert({ id: userId, ...nuevosDatos, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();

  return { data, error };
}