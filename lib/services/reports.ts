/**
 * CleanCity — Backend Reports Service
 *
 * Real Supabase backend integration for report CRUD and lifecycle management.
 * Provides fallback to local mock data if Supabase is unavailable.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { mockReportsService, MOCK_USERS } from "@/lib/mock-data";
import type {
  Report,
  ReportCategory,
  ReportStatus,
  TimelineEventType,
  TimelineEvent,
  ReportMedia,
  User,
  AssignedActor,
  Jurisdiction
} from "@/lib/types";

// Default demo profiles created in migration 00002
export const SEED_PROFILES = {
  citizen1: "00000000-0000-0000-0000-000000000001",
  citizen2: "00000000-0000-0000-0000-000000000002",
  official1: "a1000000-0000-0000-0000-000000000001",
  ngo1: "b1000000-0000-0000-0000-000000000001",
  verifier1: "a2000000-0000-0000-0000-000000000001",
};

/**
 * Maps database row and related joins into the frontend Report interface.
 */
export function mapDbToReport(
  row: any,
  evidence: any[] = [],
  timeline: any[] = [],
  reporterProfile?: any,
  assignedProfile?: any
): Report {
  const media: ReportMedia[] = (evidence || [])
    .filter((e: any) => !e.is_after_cleanup)
    .map((e: any) => ({
      id: e.id,
      type: e.type || "image",
      url: e.url,
      thumbnailUrl: e.thumbnail_url || e.url,
      capturedAt: e.captured_at || e.uploaded_at,
      caption: e.caption || undefined,
    }));

  const afterMedia: ReportMedia[] = (evidence || [])
    .filter((e: any) => e.is_after_cleanup)
    .map((e: any) => ({
      id: e.id,
      type: e.type || "image",
      url: e.url,
      thumbnailUrl: e.thumbnail_url || e.url,
      capturedAt: e.captured_at || e.uploaded_at,
      caption: e.caption || undefined,
    }));

  const timelineEvents: TimelineEvent[] = (timeline || []).map((t: any) => ({
    id: t.id,
    timestamp: t.created_at,
    type: (t.event_type || "reported") as TimelineEventType,
    status: (t.status || "OPEN") as ReportStatus,
    description: t.description || "",
    actor: t.actor_name || undefined,
    mediaCount: t.media_count || undefined,
    details: t.details || undefined,
  }));

  const wardNumber = row.ward_number || 18;
  const wardName = row.ward_name || `Ward ${wardNumber} (Mysuru)`;

  const jurisdiction: Jurisdiction = {
    id: `ward-${wardNumber}`,
    name: wardName,
    wardNumber,
    type: "ward",
    responsibleOfficial: assignedProfile?.name || "Mohan Raj",
    contactPhone: "+91 821 241 8800",
  };

  const reporter: User = {
    id: reporterProfile?.id || row.reporter_id || SEED_PROFILES.citizen1,
    name: reporterProfile?.name || "Prakash Hegde",
    email: reporterProfile?.email || "citizen@cleancity.in",
    role: reporterProfile?.role || "citizen",
    trustScore: reporterProfile?.trust_score ?? 94,
    points: reporterProfile?.points ?? 2840,
    reportsSubmitted: reporterProfile?.reports_submitted ?? 1,
    followUpsSubmitted: reporterProfile?.follow_ups_submitted ?? 0,
    verifiedContributions: reporterProfile?.verified_contributions ?? 0,
    badges: [],
    joinedAt: reporterProfile?.created_at || row.created_at,
  };

  let assignedActor: AssignedActor | undefined = undefined;
  if (assignedProfile) {
    assignedActor = {
      id: assignedProfile.id,
      name: assignedProfile.name,
      role: assignedProfile.role,
      organization:
        assignedProfile.organization ||
        (assignedProfile.role === "official" ? "Mysuru Municipal Corporation" : "Community NGO"),
      avatar: assignedProfile.avatar_url || undefined,
    };
  }

  return {
    id: row.id,
    publicId: row.public_id,
    category: row.category as ReportCategory,
    subcategory: row.subcategory || undefined,
    description: row.description,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    gpsAccuracy: Number(row.gps_accuracy || 8),
    capturedAt: row.captured_at || row.created_at,
    jurisdiction,
    status: row.status as ReportStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    claimedAt: row.claimed_at || undefined,
    cleanupCompletedAt: row.cleanup_completed_at || undefined,
    verifiedAt: row.verified_at || undefined,
    slaBreachAt: row.sla_breach_at || undefined,
    reporter,
    media,
    afterMedia: afterMedia.length > 0 ? afterMedia : undefined,
    assignedActor,
    slaHours: row.sla_hours || 48,
    isOverdue: Boolean(row.is_overdue),
    bountyAmount: row.bounty_amount || undefined,
    isSuspicious: Boolean(row.is_suspicious),
    timeline: timelineEvents,
    followUps: [],
    wardName,
    locationName: row.location_name || wardName,
  };
}

function getFilteredMockReports(options?: {
  status?: string;
  wardNumber?: number;
  category?: string;
  limit?: number;
}): Report[] {
  let reports = mockReportsService.getReports();
  if (options?.status && options.status !== "all") {
    reports = reports.filter((r) => r.status.toUpperCase() === options.status?.toUpperCase());
  }
  if (options?.wardNumber) {
    reports = reports.filter((r) => r.jurisdiction.wardNumber === options.wardNumber);
  }
  if (options?.category) {
    reports = reports.filter((r) => r.category === options.category);
  }
  if (options?.limit) {
    reports = reports.slice(0, options.limit);
  }
  return reports;
}

/**
 * Fetch all reports from Supabase.
 * If Supabase is unconfigured or fails, returns mock reports.
 */
export async function getReports(options?: {
  status?: string;
  wardNumber?: number;
  category?: string;
  limit?: number;
}): Promise<Report[]> {
  if (!isSupabaseConfigured()) {
    return getFilteredMockReports(options);
  }

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("reports")
      .select(`
        *,
        reporter:profiles!reporter_id(*),
        assigned_actor:profiles!assigned_actor_id(*),
        report_evidence(*),
        report_timeline(*)
      `)
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status.toUpperCase());
    }
    if (options?.wardNumber) {
      query = query.eq("ward_number", options.wardNumber);
    }
    if (options?.category) {
      query = query.eq("category", options.category);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn("Supabase getReports error, using mock fallback:", error);
      return getFilteredMockReports(options);
    }

    const liveReports: Report[] = data.map((row: any) =>
      mapDbToReport(
        row,
        row.report_evidence,
        row.report_timeline,
        row.reporter,
        row.assigned_actor
      )
    );

    // If database is empty, provide mock data so the app remains rich for demos
    if (liveReports.length === 0) {
      return getFilteredMockReports(options);
    }

    return liveReports;
  } catch (err) {
    console.warn("Exception in getReports, falling back to mock:", err);
    return getFilteredMockReports(options);
  }
}

/**
 * Fetch a single report by id (UUID) or publicId (e.g. MC-1001).
 */
export async function getReportById(id: string): Promise<Report | null> {
  if (!isSupabaseConfigured()) {
    return mockReportsService.getReport(id) || null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from("reports")
      .select(`
        *,
        reporter:profiles!reporter_id(*),
        assigned_actor:profiles!assigned_actor_id(*),
        report_evidence(*),
        report_timeline(*)
      `);

    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("public_id", id);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      // Fall back to mock if not in Supabase
      return mockReportsService.getReport(id) || null;
    }

    return mapDbToReport(
      data,
      data.report_evidence,
      data.report_timeline,
      data.reporter,
      data.assigned_actor
    );
  } catch (err) {
    console.warn("Exception in getReportById, using mock fallback:", err);
    return mockReportsService.getReport(id) || null;
  }
}

/**
 * Create a new report in Supabase.
 */
export async function createReport(input: {
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  gpsAccuracy?: number;
  capturedAt?: string;
  wardNumber?: number;
  wardName?: string;
  locationName?: string;
  reporterId?: string;
  reporterName?: string;
  media?: Array<{
    type?: "image" | "video";
    url: string;
    caption?: string;
    capturedAt?: string;
  }>;
}): Promise<Report> {
  if (!isSupabaseConfigured()) {
    return mockReportsService.createReport({
      category: input.category as ReportCategory,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      wardNumber: input.wardNumber,
      gpsAccuracy: input.gpsAccuracy,
      locationName: input.locationName,
      media: (input.media || []).map((m, i) => ({
        id: `media-${Date.now()}-${i}`,
        type: m.type || "image",
        url: m.url,
        thumbnailUrl: m.url,
        capturedAt: m.capturedAt || new Date().toISOString(),
        caption: m.caption,
      })),
    });
  }

  const supabase = await createServerSupabaseClient();

  // Validate reporterId exists in profiles or use default demo citizen
  let reporterId = input.reporterId;
  if (!reporterId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reporterId)) {
    reporterId = SEED_PROFILES.citizen1;
  }

  // Generate unique public_id: MC-XXXX
  const publicId = `MC-${Math.floor(1000 + Math.random() * 9000)}`;

  const wardNumber = input.wardNumber || 18;
  const wardName = input.wardName || `Ward ${wardNumber} (Mysuru)`;
  const locationName = input.locationName || wardName;
  const capturedAt = input.capturedAt || new Date().toISOString();
  const pointGeography = `SRID=4326;POINT(${input.longitude} ${input.latitude})`;

  // 1. Insert report row
  const { data: reportRow, error: reportErr } = await supabase
    .from("reports")
    .insert({
      public_id: publicId,
      reporter_id: reporterId,
      category: input.category,
      description: input.description.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      location: pointGeography,
      gps_accuracy: input.gpsAccuracy || 8,
      captured_at: capturedAt,
      ward_number: wardNumber,
      ward_name: wardName,
      location_name: locationName,
      status: "OPEN",
      sla_hours: 48,
    })
    .select()
    .single();

  if (reportErr || !reportRow) {
    console.error("Failed to insert report into Supabase:", reportErr);
    throw new Error(reportErr?.message || "Database insert failed");
  }

  // 2. Insert evidence media rows if provided
  const evidenceRows: any[] = [];
  if (input.media && input.media.length > 0) {
    const evidenceToInsert = input.media.map((m) => ({
      report_id: reportRow.id,
      type: m.type || "image",
      url: m.url,
      caption: m.caption || null,
      captured_at: m.capturedAt || capturedAt,
      is_after_cleanup: false,
    }));

    const { data: insertedEvidence } = await supabase
      .from("report_evidence")
      .insert(evidenceToInsert)
      .select();

    if (insertedEvidence) {
      evidenceRows.push(...insertedEvidence);
    }
  }

  // 3. Insert initial timeline entry
  const initialTimeline = {
    report_id: reportRow.id,
    event_type: "reported",
    status: "OPEN",
    description: `Report submitted by ${input.reporterName || "citizen"}`,
    actor_id: reporterId,
    actor_name: input.reporterName || "Prakash Hegde",
    media_count: evidenceRows.length,
  };

  const { data: insertedTimeline } = await supabase
    .from("report_timeline")
    .insert(initialTimeline)
    .select();

  // 4. Create in-app notification
  await supabase.from("notifications").insert({
    recipient_id: reporterId,
    type: "REPORT_SUBMITTED",
    title: "Report Submitted",
    message: `Your report ${publicId} has been submitted to Mysuru Municipal Corporation.`,
    report_id: reportRow.id,
    report_public_id: publicId,
    read: false,
  });

  // 5. Fetch reporter profile details
  const { data: reporterProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", reporterId)
    .single();

  return mapDbToReport(
    reportRow,
    evidenceRows,
    insertedTimeline || [initialTimeline],
    reporterProfile
  );
}

/**
 * Claim an OPEN report by an officer or NGO.
 * Enforces role separation: reporter != assigned_actor.
 */
export async function claimReport(
  reportId: string,
  actor: {
    id: string;
    name: string;
    role: "official" | "ngo";
    organization?: string;
  }
): Promise<Report> {
  const supabase = await createServerSupabaseClient();

  // Fetch current report
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const query = supabase.from("reports").select("*");
  const { data: report, error } = await (isUuid ? query.eq("id", reportId) : query.eq("public_id", reportId)).single();

  if (error || !report) {
    throw new Error("Report not found");
  }

  // Anti-collusion validation
  if (report.reporter_id === actor.id) {
    throw new Error("Anti-collusion rule violation: Reporter cannot claim their own report");
  }

  if (actor.role !== "official" && actor.role !== "ngo") {
    throw new Error("Only municipal officials and registered NGOs can claim reports");
  }

  if (report.status !== "OPEN" && report.status !== "BOUNTY") {
    throw new Error(`Cannot claim report in status: ${report.status}`);
  }

  const claimedAt = new Date().toISOString();

  // Update report status
  const { data: updated, error: updateErr } = await supabase
    .from("reports")
    .update({
      status: "CLAIMED",
      assigned_actor_id: actor.id,
      claimed_at: claimedAt,
    })
    .eq("id", report.id)
    .select()
    .single();

  if (updateErr || !updated) {
    throw new Error(updateErr?.message || "Failed to update report status");
  }

  // Add timeline entry
  await supabase.from("report_timeline").insert({
    report_id: report.id,
    event_type: "claimed",
    status: "CLAIMED",
    description: `Claimed by ${actor.name} (${actor.organization || (actor.role === "official" ? "Municipal Officer" : "NGO")})`,
    actor_id: actor.id,
    actor_name: actor.name,
  });

  // Notify original reporter
  await supabase.from("notifications").insert({
    recipient_id: report.reporter_id,
    type: "REPORT_CLAIMED",
    title: "Report Claimed",
    message: `Report ${report.public_id} was claimed for cleanup by ${actor.name}.`,
    report_id: report.id,
    report_public_id: report.public_id,
  });

  return (await getReportById(report.id))!;
}

/**
 * Start cleanup operations on a CLAIMED report.
 */
export async function startCleanup(
  reportId: string,
  actorId: string,
  actorName?: string
): Promise<Report> {
  const supabase = await createServerSupabaseClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const query = supabase.from("reports").select("*");
  const { data: report, error } = await (isUuid ? query.eq("id", reportId) : query.eq("public_id", reportId)).single();

  if (error || !report) {
    throw new Error("Report not found");
  }

  if (report.status !== "CLAIMED") {
    throw new Error(`Invalid transition: Must be CLAIMED to start cleanup (current: ${report.status})`);
  }

  const { error: updateErr } = await supabase
    .from("reports")
    .update({ status: "CLEANUP_IN_PROGRESS" })
    .eq("id", report.id);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  await supabase.from("report_timeline").insert({
    report_id: report.id,
    event_type: "cleanup_started",
    status: "CLEANUP_IN_PROGRESS",
    description: "On-site cleanup crew deployed and active",
    actor_id: actorId,
    actor_name: actorName || "Assigned Crew",
  });

  return (await getReportById(report.id))!;
}

/**
 * Complete cleanup operations and submit after-evidence for verification.
 */
export async function completeCleanup(
  reportId: string,
  actorId: string,
  actorName?: string,
  afterMedia?: Array<{ url: string; caption?: string }>,
  notes?: string
): Promise<Report> {
  const supabase = await createServerSupabaseClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const query = supabase.from("reports").select("*");
  const { data: report, error } = await (isUuid ? query.eq("id", reportId) : query.eq("public_id", reportId)).single();

  if (error || !report) {
    throw new Error("Report not found");
  }

  if (report.status !== "CLEANUP_IN_PROGRESS") {
    throw new Error(`Invalid transition: Must be CLEANUP_IN_PROGRESS to complete (current: ${report.status})`);
  }

  const completedAt = new Date().toISOString();

  // Update report
  const { error: updateErr } = await supabase
    .from("reports")
    .update({
      status: "PENDING_VERIFICATION",
      cleanup_completed_at: completedAt,
    })
    .eq("id", report.id);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  // Insert after evidence
  if (afterMedia && afterMedia.length > 0) {
    const evidenceRows = afterMedia.map((m) => ({
      report_id: report.id,
      type: "image",
      url: m.url,
      caption: m.caption || "After cleanup verification photo",
      captured_at: completedAt,
      is_after_cleanup: true,
    }));

    await supabase.from("report_evidence").insert(evidenceRows);
  }

  // Add timeline entry
  await supabase.from("report_timeline").insert({
    report_id: report.id,
    event_type: "cleanup_completed",
    status: "PENDING_VERIFICATION",
    description: `Cleanup completed. Submitted for verification${notes ? `: ${notes}` : ""}`,
    actor_id: actorId,
    actor_name: actorName || "Assigned Crew",
    media_count: afterMedia?.length || 0,
  });

  // Notify reporter
  await supabase.from("notifications").insert({
    recipient_id: report.reporter_id,
    type: "CLEANUP_COMPLETED",
    title: "Cleanup Completed",
    message: `Cleanup for report ${report.public_id} has been completed and is awaiting verification.`,
    report_id: report.id,
    report_public_id: report.public_id,
  });

  return (await getReportById(report.id))!;
}

/**
 * Verify cleanup outcome.
 * Enforces tri-party role separation:
 * - verifier != assigned_actor (actor cannot verify own work)
 * - verifier != reporter (reporter cannot self-verify)
 * - verifier must be an official
 */
export async function verifyCleanup(
  reportId: string,
  verifier: {
    id: string;
    name: string;
    role: "official" | "citizen" | "ngo";
  },
  outcome: "VERIFIED" | "REJECTED",
  notes?: string
): Promise<Report> {
  const supabase = await createServerSupabaseClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const query = supabase.from("reports").select("*");
  const { data: report, error } = await (isUuid ? query.eq("id", reportId) : query.eq("public_id", reportId)).single();

  if (error || !report) {
    throw new Error("Report not found");
  }

  if (report.status !== "PENDING_VERIFICATION") {
    throw new Error(`Invalid transition: Must be PENDING_VERIFICATION to verify (current: ${report.status})`);
  }

  // Tri-party checks
  if (report.assigned_actor_id && report.assigned_actor_id === verifier.id) {
    throw new Error("Anti-collusion rule violation: Assigned actor cannot verify their own cleanup");
  }

  if (report.reporter_id === verifier.id) {
    throw new Error("Anti-collusion rule violation: Original reporter cannot act as the official verifier");
  }

  if (verifier.role !== "official") {
    throw new Error("Only authorized municipal officials can conduct official verification");
  }

  const verifiedAt = new Date().toISOString();
  const nextStatus: ReportStatus = outcome === "VERIFIED" ? "VERIFIED" : "REOPENED";

  const { error: updateErr } = await supabase
    .from("reports")
    .update({
      status: nextStatus,
      verifier_id: verifier.id,
      verified_at: outcome === "VERIFIED" ? verifiedAt : null,
    })
    .eq("id", report.id);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  // Insert timeline event
  await supabase.from("report_timeline").insert({
    report_id: report.id,
    event_type: outcome === "VERIFIED" ? "verified" : "rejected",
    status: nextStatus,
    description:
      outcome === "VERIFIED"
        ? `Cleanliness verified and approved by ${verifier.name} (Municipal Officer)${notes ? `: ${notes}` : ""}`
        : `Verification rejected by ${verifier.name}: ${notes || "Area requires further cleaning"}`,
    actor_id: verifier.id,
    actor_name: verifier.name,
  });

  // Notify reporter
  await supabase.from("notifications").insert({
    recipient_id: report.reporter_id,
    type: outcome === "VERIFIED" ? "VERIFIED" : "REOPENED",
    title: outcome === "VERIFIED" ? "Report Resolved & Verified" : "Report Verification Rejected",
    message:
      outcome === "VERIFIED"
        ? `Report ${report.public_id} has been verified and officially closed.`
        : `Report ${report.public_id} cleanup was rejected and marked for rework.`,
    report_id: report.id,
    report_public_id: report.public_id,
  });

  return (await getReportById(report.id))!;
}
