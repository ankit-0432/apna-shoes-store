import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration from project credentials
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://fzxyxhefjxsyldqsdvbp.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDMzNzEsImV4cCI6MjEwNzM3OTM3MX0.QJPQAOxF6vZwTE18sGDoO4QfwO64k0FVOWP3B1tXeYA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { createClient };

/**
 * Checks connection status to Supabase from the browser
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  projectRef: string;
  error?: string;
}> {
  try {
    const { data: _data, error } = await supabase.from('subscribers').select('count', { count: 'exact', head: true });
    // If table doesn't exist yet (PGRST205), the API gateway is still reachable
    if (error && error.code !== 'PGRST205') {
      return {
        connected: false,
        projectRef: 'fzxyxhefjxsyldqsdvbp',
        error: error.message,
      };
    }
    return {
      connected: true,
      projectRef: 'fzxyxhefjxsyldqsdvbp',
    };
  } catch (err: any) {
    return {
      connected: false,
      projectRef: 'fzxyxhefjxsyldqsdvbp',
      error: err.message,
    };
  }
}
