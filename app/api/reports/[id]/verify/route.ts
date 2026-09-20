import { NextRequest, NextResponse } from "next/server";
import { verifyCleanup, SEED_PROFILES } from "@/lib/services/reports";
import { createErrorResponse, badRequest } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports/[id]/verify
 * Authorized official inspects and verifies or rejects cleanup.
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

    const outcome = body.outcome || "VERIFIED";
    if (outcome !== "VERIFIED" && outcome !== "REJECTED") {
      throw badRequest("Invalid outcome: expected 'VERIFIED' or 'REJECTED'");
    }

    const verifier = {
      id: body.verifier?.id || SEED_PROFILES.verifier1,
      name: body.verifier?.name || "S. Suresh (Ward Inspector)",
      role: (body.verifier?.role || "official") as "official" | "citizen" | "ngo",
    };

    const notes = body.notes || undefined;
    const report = await verifyCleanup(id, verifier, outcome, notes);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
