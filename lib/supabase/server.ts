/**
 * Supabase Server Client
 *
 * Creates a Supabase client for use in Next.js server contexts
 * (Route Handlers, Server Components, Server Actions).
 *
 * Uses @supabase/ssr's createServerClient with cookie integration
 * via next/headers for proper auth session management.
 *
 * Usage in a Route Handler (app/api/example/route.ts):
 *   import { createServerSupabaseClient } from "@/lib/supabase/server";
 *
 *   export async function GET() {
 *     const supabase = await createServerSupabaseClient();
 *     const { data } = await supabase.from("reports").select("*");
 *     return Response.json(data);
 *   }
 *
 * Note: For admin/service-role operations in the future, you can set
 * SUPABASE_SERVICE_ROLE_KEY and create a separate admin client.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client configured for server-side usage.
 *
 * Reads and writes auth cookies through the Next.js `cookies()` API,
 * ensuring sessions are correctly maintained across requests.
 *
 * This function is async because `cookies()` returns a promise in
 * Next.js App Router (v15+).
 *
 * @returns A typed SupabaseClient instance for server contexts.
 * @throws Error if required environment variables are missing.
 */
export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your .env.local file. See .env.example for reference."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The `setAll` method is called from a Server Component where
          // cookies cannot be modified. This is safe to ignore when the
          // middleware is configured to refresh sessions on every request.
        }
      },
    },
  });
}
