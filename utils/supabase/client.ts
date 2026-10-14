import { createBrowserClient } from '@supabase/ssr';

export const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://fzxyxhefjxsyldqsdvbp.supabase.co';

export const supabaseKey =
  (typeof process !== 'undefined' &&
    (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env?.SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  'sb_publishable_v9333WmBDLvjzqfPT4Hr6g_WTLtCAYM';

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);

export const supabase = createClient();
