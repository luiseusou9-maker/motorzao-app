import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as chaves existem no .env para não dar erro no console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Erro: Chaves do Supabase não encontradas no arquivo .env!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);