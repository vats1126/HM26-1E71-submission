import { NextRequest, NextResponse } from "next/server";
import { getReports, createReport } from "@/lib/services/reports";
import { createErrorResponse, badRequest } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports
 * Returns public civic issue reports with optional filters.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const wardParam = searchParams.get("wardNumber");
    const wardNumber = wardParam ? parseInt(wardParam, 10) : undefined;
    const category = searchParams.get("category") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const reports = await getReports({
      status,
      wardNumber,
      category,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * POST /api/reports
 * Creates a new citizen report in Supabase.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      throw badRequest("Invalid JSON request body");
    }

    const {
      category,
      description,
      latitude,
      longitude,
      gpsAccuracy,
      capturedAt,
      wardNumber,
      wardName,
      locationName,
      reporterId,
      reporterName,
      media,
    } = body;

    // Validation
    if (!category || typeof category !== "string") {
      throw badRequest("Missing or invalid field: category");
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      throw badRequest("Missing or empty field: description");
    }

    if (typeof latitude !== "number" || isNaN(latitude)) {
      throw badRequest("Missing or invalid numeric field: latitude");
    }

    if (typeof longitude !== "number" || isNaN(longitude)) {
      throw badRequest("Missing or invalid numeric field: longitude");
    }

    const report = await createReport({
      category,
      description,
      latitude,
      longitude,
      gpsAccuracy: typeof gpsAccuracy === "number" ? gpsAccuracy : undefined,
      capturedAt: typeof capturedAt === "string" ? capturedAt : undefined,
      wardNumber: typeof wardNumber === "number" ? wardNumber : undefined,
      wardName: typeof wardName === "string" ? wardName : undefined,
      locationName: typeof locationName === "string" ? locationName : undefined,
      reporterId: typeof reporterId === "string" ? reporterId : undefined,
      reporterName: typeof reporterName === "string" ? reporterName : undefined,
      media: Array.isArray(media) ? media : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
