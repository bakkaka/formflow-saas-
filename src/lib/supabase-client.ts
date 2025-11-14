import { createClient } from '@supabase/supabase-js';

// Client pour le build (values factices)
const buildClient = () => {
  return createClient(
    'https://default-dummy-url.supabase.co',
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.dummy-key'
  );
};

// Client pour le runtime (vraies valeurs)
const runtimeClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials manquantes, utilisation du client de build');
    return buildClient();
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Export conditionnel
export const supabase = typeof window === 'undefined' 
  ? (process.env.NEXT_PHASE === 'phase-production-build' ? buildClient() : runtimeClient())
  : runtimeClient();