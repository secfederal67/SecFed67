import { createClient } from '@supabase/supabase-js';

// Debug en producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 DEBUG VARIABLES:');
console.log('URL:', supabaseUrl);
console.log('KEY exists:', !!supabaseAnonKey);
console.log('All env:', import.meta.env);

// Verificación de seguridad
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes!');
  console.error('URL:', supabaseUrl);
  console.error('KEY:', supabaseAnonKey ? 'EXISTE' : 'FALTA');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);