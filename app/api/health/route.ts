import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Prevent Next.js from caching this route. */
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Returns the application health status including Supabase connectivity.
 * Always responds with HTTP 200 — the `status` field communicates state:
 *   - "ok"       — everything is operational
 *   - "degraded" — Supabase is configured but not reachable
 *
 * Sensitive details (API keys, URLs, credentials) are never exposed.
 */
export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  const version = "0.1.0";

  const configured = isSupabaseConfigured();
  let connected = false;

  if (configured) {
    connected = await checkSupabaseConnection();
  }

  const status = !configured || connected ? "ok" : "degraded";

  return NextResponse.json({
    status,
    timestamp,
    version,
    supabase: {
      configured,
      connected,
    },
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Attempt a lightweight Supabase connectivity check with a 4-second timeout.
 * Returns `true` if the database responds in time, `false` otherwise.
 */
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const timeout = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase connectivity check timed out")), 4_000),
    );

    // Use auth.getSession() as a lightweight connectivity check.
    // This verifies the Supabase project is reachable without requiring
    // any user tables to exist yet.
    const check = (async (): Promise<boolean> => {
      const { error } = await supabase.auth.getSession();
      return error === null;
    })();

    return await Promise.race([check, timeout]);
  } catch {
    // Timeout or unexpected failure — report as disconnected
    return false;
  }
}
