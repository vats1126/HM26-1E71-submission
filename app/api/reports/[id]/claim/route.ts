import { NextRequest, NextResponse } from "next/server";
import { claimReport, SEED_PROFILES } from "@/lib/services/reports";
import { createErrorResponse, badRequest } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

/**
 * POST /api/reports/[id]/claim
 * Operations actor (Official or NGO) claims an open report.
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
      // Optional body fallback to demo official
    }

    const actor = {
      id: body.actor?.id || (body.role === "ngo" ? SEED_PROFILES.ngo1 : SEED_PROFILES.official1),
      name: body.actor?.name || (body.role === "ngo" ? "Mysuru Green Guardians" : "Mohan Raj"),
      role: (body.actor?.role || body.role || "official") as "official" | "ngo",
      organization: body.actor?.organization || body.organization,
    };

    if (actor.role !== "official" && actor.role !== "ngo") {
      throw badRequest("Only officials or NGOs are permitted to claim civic reports");
    }

    const report = await claimReport(id, actor);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
