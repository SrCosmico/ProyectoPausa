import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan las variables de entorno de Supabase ' +
        '(NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY). ' +
        'Revisa tu archivo .env.local. No hay valor por defecto a propósito, ' +
        'para no fallar en silencio contra un proyecto de Supabase inexistente.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}