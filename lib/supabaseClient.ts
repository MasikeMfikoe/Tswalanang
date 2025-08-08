import { createClient } from '@supabase/supabase-js';

// Re-export createClient to make it available from this utility file
export { createClient };

// You can also define your Supabase client instance here if needed
// For example, a client for server-side operations:
// export const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );
