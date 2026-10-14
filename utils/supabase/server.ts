import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const supabaseUrl =
  (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  'https://fzxyxhefjxsyldqsdvbp.supabase.co';

export const supabaseServiceRoleKey =
  (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTgwMzM3MSwiZXhwIjoyMTA3Mzc5MzcxfQ.d54TM6NO-Y6ht8BuRM9W_JqG5OOq6fKoeh-3GkO2tT4';

export const supabasePublishableKey =
  (typeof process !== 'undefined' &&
    (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.SUPABASE_ANON_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  'sb_publishable_v9333WmBDLvjzqfPT4Hr6g_WTLtCAYM';

/**
 * Server client generator.
 * If cookieStore is passed (e.g., in Next.js or custom cookie handler), uses createServerClient.
 * Otherwise creates a standard authoritative Supabase client.
 */
export const createClient = (cookieStore?: any) => {
  if (cookieStore && typeof cookieStore.getAll === 'function') {
    return createServerClient(supabaseUrl!, supabasePublishableKey!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              if (typeof cookieStore.set === 'function') {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // Ignore when called from server contexts where response headers are sealed
          }
        },
      },
    });
  }

  return createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey || supabasePublishableKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const supabaseServer = createClient();
