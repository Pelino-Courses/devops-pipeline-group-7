import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = `https://${projectId}.supabase.co`;
  const supabaseAnonKey = publicAnonKey;

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  
  return supabaseInstance;
}
