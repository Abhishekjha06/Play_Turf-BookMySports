/**
 * Supabase client placeholder.
 *
 * When you're ready to connect Supabase:
 *   1. npm install @supabase/supabase-js
 *   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *   3. Uncomment the import and client creation below
 *   4. Remove the "return null" placeholder line
 *
 * Until then, all services fall back to mock data from seed.ts.
 */

// TODO: Uncomment when @supabase/supabase-js is installed:
// import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

export type SupabaseClient = any;

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase client if env vars are configured, otherwise null.
 * Services check the return value and fall back to mock data when null.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
    if (_client) return _client;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return null;
    }

    // TODO: Uncomment when @supabase/supabase-js is installed:
    // _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // return _client;

    // Placeholder: returns null until Supabase is set up
    console.info(
        "[supabase] Supabase env vars detected but @supabase/supabase-js is not installed. " +
        "Run `npm install @supabase/supabase-js` and uncomment the client creation in src/lib/supabase.ts."
    );
    return null;
}

/** Check whether Supabase is configured (non-null client available). */
export async function isSupabaseConfigured(): Promise<boolean> {
    const client = await getSupabase();
    return client !== null;
}
