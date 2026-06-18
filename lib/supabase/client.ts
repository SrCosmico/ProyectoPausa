import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://viyodfrzmposupkyeyds.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ULUTXltcLSlijOHYIaig9w__6N-CHUD';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};