import { createClient } from '@supabase/supabase-js';

// This function creates a supabase client using the authorization header
// from the incoming request. This ensures RLS is enforced correctly.
export const createSupabaseServerClient = (authHeader: string | null) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
    }
  );
};
