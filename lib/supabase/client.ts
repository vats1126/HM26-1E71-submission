/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in "use client" components.
 * Uses @supabase/ssr's createBrowserClient for proper Next.js cookie handling.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Checks whether the required Supabase environment variables are present
 * and non-empty. Useful for gating UI that depends on Supabase.
 */
export function isSupabaseConfigured(): boolean {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  );
}

/**
 * Creates a Supabase client configured for browser-side usage.
 *
 * - Safe to call in "use client" components.
 * - Throws a descriptive error if environment variables are missing, so callers
 *   can catch or use `isSupabaseConfigured()` to guard calls.
 *
 * @returns A typed SupabaseClient instance.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local file. See .env.example for reference."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
