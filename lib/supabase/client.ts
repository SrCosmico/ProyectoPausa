import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-url-dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-clave-anon-dummy';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};