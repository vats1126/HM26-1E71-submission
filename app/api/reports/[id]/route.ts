import { NextRequest, NextResponse } from "next/server";
import { getReportById } from "@/lib/services/reports";
import { createErrorResponse, notFound } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/[id]
 * Returns full details for a single civic issue report (by UUID or publicId).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      throw notFound("Report identifier is required");
    }

    const report = await getReportById(id);

    if (!report) {
      throw notFound(`Report not found with identifier: ${id}`);
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
