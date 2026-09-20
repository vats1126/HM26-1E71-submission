import { NextRequest, NextResponse } from "next/server";
import { startCleanup, completeCleanup, SEED_PROFILES } from "@/lib/services/reports";
import { createErrorResponse, badRequest } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports/[id]/cleanup
 * Manages cleanup operations:
 * - action: 'start' (transitions to CLEANUP_IN_PROGRESS)
 * - action: 'complete' (transitions to PENDING_VERIFICATION)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      throw badRequest("Missing JSON request body");
    }

    const action = body.action || "start";
    const actorId = body.actorId || SEED_PROFILES.official1;
    const actorName = body.actorName || "Municipal Officer";

    if (action === "start") {
      const report = await startCleanup(id, actorId, actorName);
      return NextResponse.json({ success: true, report });
    } else if (action === "complete") {
      const afterMedia = Array.isArray(body.afterMedia) ? body.afterMedia : [];
      const notes = body.notes || undefined;
      const report = await completeCleanup(id, actorId, actorName, afterMedia, notes);
      return NextResponse.json({ success: true, report });
    } else {
      throw badRequest(`Unknown cleanup action: ${action}. Expected 'start' or 'complete'`);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}
