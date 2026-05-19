import { createClient } from '@supabase/supabase-js';

// This client uses the Service Role Key to bypass RLS.
// It MUST ONLY be used in secure server-side routes (e.g. /api/track)
// to fetch specific data that shouldn't be publicly queryable via RLS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key'
);
