import {
  type User,
  type Badge,
  type Report,
  type FollowUp,
  type AIVerification,
  type AIVerificationState,
  type TimelineEvent,
  type ReportMedia,
  type AssignedActor,
  type Jurisdiction,
  type LiveActivityEvent,
  type TransparencyStats,
  type WardStat,
  type LeaderboardEntry,
  type NGOLeaderboardEntry,
  type StatusDistribution,
  type ResolutionBreakdown,
  type RecurringLocation,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/types"
import { STATUS_CONFIG } from "@/lib/types"
import { notificationService } from "@/lib/notifications"

// ---------- USERS ----------

export const MOCK_USERS: Record<string, User> = {
  citizen1: {
    id: "citizen1",
    name: "Prakash Hegde",
    email: "prakash@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "citizen",
    trustScore: 94,
    points: 2840,
    reportsSubmitted: 47,
    followUpsSubmitted: 12,
    verifiedContributions: 8,
    badges: [
      { type: "civic_reporter", label: "Civic Reporter", description: "Submitted 10+ reports", icon: "Megaphone", earnedAt: "2025-06-12" },
      { type: "cleanup_champion", label: "Cleanup Champion", description: "Reported 5 successfully verified issues", icon: "Award", earnedAt: "2025-08-20" },
      { type: "early_adopter", label: "Early Adopter", description: "Among the first Mysuru Janseva users", icon: "Star", earnedAt: "2025-03-01" },
    ],
    joinedAt: "2025-03-01",
  },
  citizen2: {
    id: "citizen2",
    name: "Lakshmi Iyer",
    email: "lakshmi@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "citizen",
    trustScore: 88,
    points: 1560,
    reportsSubmitted: 23,
    followUpsSubmitted: 5,
    verifiedContributions: 2,
    badges: [
      { type: "civic_reporter", label: "Civic Reporter", description: "Submitted 10+ reports", icon: "Megaphone", earnedAt: "2025-07-14" },
    ],
    joinedAt: "2025-07-14",
  },
  official1: {
    id: "official1",
    name: "Mohan Raj",
    email: "mohan.raj@mysuru.gov.in",
    avatar: "https://i.pravatar.cc/150?img=33",
    role: "official",
    trustScore: 99,
    points: 5200,
    reportsSubmitted: 0,
    followUpsSubmitted: 0,
    verifiedContributions: 312,
    badges: [],
    joinedAt: "2025-01-15",
  },
  ngo1: {
    id: "ngo1",
    name: "Mysuru Green Guardians",
    email: "contact@green-guardians.org",
    avatar: "https://i.pravatar.cc/150?img=53",
    role: "ngo",
    trustScore: 96,
    points: 3840,
    reportsSubmitted: 18,
    followUpsSubmitted: 24,
    verifiedContributions: 46,
    badges: [
      { type: "cleanup_champion", label: "Cleanup Champion", description: "Resolved 20+ issues", icon: "Award", earnedAt: "2025-09-01" },
      { type: "community_helper", label: "Community Helper", description: "Active in 5 wards", icon: "Heart", earnedAt: "2025-05-10" },
    ],
    joinedAt: "2025-04-20",
  },
  currentUser: {
    id: "currentUser",
    name: "You (Demo Citizen)",
    email: "citizen@mysurujanaseva.in",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "citizen",
    trustScore: 72,
    points: 420,
    reportsSubmitted: 5,
    followUpsSubmitted: 1,
    verifiedContributions: 0,
    badges: [
      { type: "early_adopter", label: "Early Adopter", description: "Joined Mysuru Janseva early", icon: "Star", earnedAt: "2025-08-01" },
    ],
    joinedAt: "2025-08-01",
  },
}

export const getCurrentUser = (): User => MOCK_USERS.currentUser
export const getUsers = (): User[] => Object.values(MOCK_USERS).filter((u) => u.role === "citizen")

export const MOCK_WARDS: Jurisdiction[] = Array.from({ length: 21 }, (_, i) => ({
  id: `ward-${i + 1}`,
  name: `Ward ${i + 1}`,
  wardNumber: i + 1,
  type: "ward",
  responsibleOfficial: i % 3 === 0 ? "Mohan Raj" : undefined,
}))

// Mysuru center
export const MYSRU_CENTER: [number, number] = [12.29584, 76.63942]

// ---------- MOCK REPORTS ----------

interface ReportBuilderOptions {
  ageMs?: number
  mediaCount?: number
  slaHours?: number
  claimedBy?: string
  gpsAccuracy?: number
}

function makeReport(
  id: string,
  publicId: string,
  category: ReportCategory,
  status: ReportStatus,
  lat: number,
  lng: number,
  wardNumber: number,
  reporterId: string,
  options: ReportBuilderOptions = {}
): Report {
  const reporter = MOCK_USERS[reporterId] ?? MOCK_USERS.citizen1
  const now = new Date()
  const ageMs = options.ageMs ?? 0
  const capturedAt = new Date(now.getTime() - ageMs)
  const capturedAtStr = capturedAt.toISOString()
  const ward = MOCK_WARDS[wardNumber - 1]!
  const slaHours = options.slaHours ?? 48
  const slaMet = capturedAt.getTime() + slaHours * 3600000 > Date.now()
  const isOverdue = !slaMet && status !== "VERIFIED"
  const mediaCount = options.mediaCount ?? 3
  const claimedBy = options.claimedBy ?? "Mohan Raj"
  const gpsAccuracy = options.gpsAccuracy ?? 8

  const timeline: TimelineEvent[] = [
    {
      id: `${id}-1`,
      timestamp: capturedAtStr,
      type: "reported",
      description: "Issue reported",
      actor: reporter.name,
    },
    {
      id: `${id}-2`,
      timestamp: capturedAtStr,
      type: "evidence_uploaded",
      description: "Evidence uploaded",
      mediaCount,
      actor: reporter.name,
    },
    {
      id: `${id}-3`,
      timestamp: capturedAtStr,
      type: "status_changed",
      status: "OPEN",
      description: "Status: Open",
    },
  ]

  if (status === "CLAIMED" || status === "CLEANUP_IN_PROGRESS" || status === "PENDING_VERIFICATION" || status === "VERIFIED" || status === "BOUNTY") {
    const claimedAt = new Date(capturedAt.getTime() + 33 * 60000)
    timeline.push({
      id: `${id}-4`,
      timestamp: claimedAt.toISOString(),
      type: "claimed",
      description: "Report claimed for cleanup",
      actor: claimedBy,
    })
    timeline.push({
      id: `${id}-5`,
      timestamp: claimedAt.toISOString(),
      type: "status_changed",
      status: "CLAIMED",
      description: "Status: Claimed",
    })
  }

  if (status === "CLEANUP_IN_PROGRESS" || status === "PENDING_VERIFICATION" || status === "VERIFIED") {
    const startedAt = new Date(capturedAt.getTime() + 90 * 60000)
    timeline.push({
      id: `${id}-6`,
      timestamp: startedAt.toISOString(),
      type: "cleanup_started",
      description: "Cleanup started",
      actor: claimedBy,
    })
  }

  if (status === "PENDING_VERIFICATION" || status === "VERIFIED") {
    const completedAt = new Date(capturedAt.getTime() + 180 * 60000)
    timeline.push({
      id: `${id}-7`,
      timestamp: completedAt.toISOString(),
      type: "cleanup_completed",
      description: "Cleanup completed",
      actor: claimedBy,
    })
    timeline.push({
      id: `${id}-8`,
      timestamp: completedAt.toISOString(),
      type: "after_evidence_uploaded",
      description: "After evidence uploaded",
      mediaCount: 2,
      actor: claimedBy,
    })
    timeline.push({
      id: `${id}-9`,
      timestamp: completedAt.toISOString(),
      type: "status_changed",
      status: "PENDING_VERIFICATION",
      description: "Status: Pending Verification",
    })
  }

  if (status === "VERIFIED") {
    const verifiedAt = new Date(capturedAt.getTime() + 240 * 60000)
    timeline.push({
      id: `${id}-10`,
      timestamp: verifiedAt.toISOString(),
      type: "verified",
      description: "AI verification completed",
      details: { confidence: 94, detected: "Cleanup detected" },
    })
    timeline.push({
      id: `${id}-11`,
      timestamp: verifiedAt.toISOString(),
      type: "status_changed",
      status: "VERIFIED",
      description: "Status: Verified",
    })
  }

  if (status === "REOPENED") {
    const reopenAt = new Date(capturedAt.getTime() + 300 * 60000)
    timeline.push({
      id: `${id}-12`,
      timestamp: reopenAt.toISOString(),
      type: "followup_submitted",
      description: "Public follow-up submitted",
      actor: "Lakshmi Iyer",
    })
    timeline.push({
      id: `${id}-13`,
      timestamp: reopenAt.toISOString(),
      type: "reopened",
      status: "REOPENED",
      description: "Status: Reopened",
    })
  }

  const media: ReportMedia[] = Array.from({ length: mediaCount }, (_, i) => ({
    id: `${id}-media-${i + 1}`,
    type: "image",
    url: `https://picsum.photos/seed/${id}-${i + 1}/640/480`,
    thumbnailUrl: `https://picsum.photos/seed/${id}-${i + 1}/160/120`,
    capturedAt: capturedAtStr,
    caption: i === 0 ? "Main view of the issue" : i === 1 ? "Close-up detail" : "Wider angle",
  }))

  const afterMedia: ReportMedia[] = status === "PENDING_VERIFICATION" || status === "VERIFIED" || status === "REOPENED"
    ? [
        { id: `${id}-after-1`, type: "image", url: `https://picsum.photos/seed/${id}-after-1/640/480`, thumbnailUrl: `https://picsum.photos/seed/${id}-after-1/160/120`, capturedAt: capturedAtStr, caption: "After cleanup" },
        { id: `${id}-after-2`, type: "image", url: `https://picsum.photos/seed/${id}-after-2/640/480`, thumbnailUrl: `https://picsum.photos/seed/${id}-after-2/160/120`, capturedAt: capturedAtStr, caption: "Area cleared" },
      ]
    : []

  const descriptionMap: Record<ReportCategory, string> = {
    garbage_accumulation: "Large pile of accumulated garbage near the main intersection. Has been present for over a week and is causing inconvenience to pedestrians and traffic.",
    overflowing_bin: "Public waste bin overflowing for the past 3 days. Waste has spilled onto the footpath and is attracting stray animals.",
    illegal_dumping: "Construction debris and household waste dumped illegally behind the residential lane. No municipal collection in this area for a month.",
    dirty_public_area: "Public park area is dirty with scattered waste, broken glass, and stagnant water. Children frequent this area in the evenings.",
    drainage_problem: "Blocked drainage causing waterlogging during light rain. Smell of stagnant water is noticeable. Affects 3 adjacent houses.",
    roadside_waste: "Continuous roadside waste dumping along the highway shoulder. Plastic waste and food waste mixed together.",
    other: "Multiple civic issues reported in this area. Primarily garbage accumulation and damaged footpath.",
  }

  const claimedAtStr = status === "CLAIMED" || status === "CLEANUP_IN_PROGRESS" || status === "PENDING_VERIFICATION" || status === "VERIFIED" || status === "BOUNTY" ? (timeline[3]?.timestamp ?? capturedAtStr) : undefined
  const cleanupCompletedAtStr = (status === "PENDING_VERIFICATION" || status === "VERIFIED" || status === "REOPENED") ? (timeline[6]?.timestamp ?? capturedAtStr) : undefined
  const verifiedAtStr = status === "VERIFIED" ? (timeline[9]?.timestamp ?? capturedAtStr) : undefined
  const slaBreachAtStr = isOverdue ? new Date(capturedAt.getTime() + slaHours * 3600000).toISOString() : undefined

  return {
    id,
    publicId,
    category,
    description: descriptionMap[category],
    latitude: lat,
    longitude: lng,
    gpsAccuracy,
    capturedAt: capturedAtStr,
    jurisdiction: ward,
    status,
    createdAt: capturedAtStr,
    updatedAt: new Date().toISOString(),
    claimedAt: claimedAtStr,
    cleanupCompletedAt: cleanupCompletedAtStr,
    verifiedAt: verifiedAtStr,
    slaBreachAt: slaBreachAtStr,
    reporter,
    media,
    afterMedia,
    assignedActor: status !== "OPEN" && status !== "ACKNOWLEDGED"
      ? { id: "official1", name: "Mohan Raj", role: "official", organization: "Mysuru Municipal Corporation" }
      : undefined,
    slaHours,
    isOverdue,
    bountyAmount: status === "BOUNTY" ? 150 : undefined,
    aiVerification: status === "VERIFIED"
      ? { state: "VERIFIED", confidence: 94, reason: "Garbage visible in the original evidence is absent from the after image.", detected: "Cleanup detected", timestamp: verifiedAtStr ?? capturedAtStr, provider: "cleancity-ai-v1" }
      : status === "PENDING_VERIFICATION"
        ? { state: "UNCERTAIN", confidence: 62, reason: "After image quality is insufficient for confident verification.", detected: "Insufficient evidence", timestamp: capturedAtStr, provider: "cleancity-ai-v1" }
        : undefined,
    isSuspicious: false,
    timeline,
    followUps: [],
    wardName: ward.name,
    locationName: ward.name,
  }
}

// Build 53 realistic reports distributed across wards
function buildMockReports(): Report[] {
  const reports: Report[] = []
  const baseLat = MYSRU_CENTER[0]
  const baseLng = MYSRU_CENTER[1]
  const categories: ReportCategory[] = ["garbage_accumulation", "overflowing_bin", "illegal_dumping", "dirty_public_area", "drainage_problem", "roadside_waste", "other"]
  let idCounter = 1000

  const locations: Array<{ lat: number; lng: number; ward: number }> = []
  for (let w = 1; w <= 21; w++) {
    const spread = (w - 10.5) * 0.012
    const spreadLng = (w - 10.5) * 0.018
    const count = w <= 5 ? 4 : w <= 10 ? 3 : w <= 15 ? 2 : 1
    for (let c = 0; c < count; c++) {
      locations.push({
        lat: baseLat + spread + (c - 1) * 0.006 + Math.random() * 0.008,
        lng: baseLng + spreadLng + (c - 1) * 0.009 + Math.random() * 0.012,
        ward: w,
      })
    }
  }

  const statusCounts: Array<{ status: ReportStatus; count: number }> = [
    { status: "OPEN", count: 20 },
    { status: "CLAIMED", count: 10 },
    { status: "PENDING_VERIFICATION", count: 8 },
    { status: "VERIFIED", count: 12 },
    { status: "BOUNTY", count: 3 },
    { status: "ACKNOWLEDGED", count: 4 },
    { status: "CLEANUP_IN_PROGRESS", count: 3 },
    { status: "FLAGGED", count: 2 },
    { status: "REOPENED", count: 1 },
  ]

  const statusPool: ReportStatus[] = []
  for (const s of statusCounts) {
    for (let i = 0; i < s.count; i++) statusPool.push(s.status)
  }

  for (let i = 0; i < 53; i++) {
    idCounter++
    const loc = locations[i % locations.length]
    const status = statusPool[i % statusPool.length]
    const category = categories[i % categories.length]
    const reporterId = ["citizen1", "citizen2", "citizen1", "citizen1"][i % 4]
    const ageMs = Math.floor(Math.random() * 86400000 * 6)

    const report = makeReport(
      `report-${idCounter}`,
      `MC-${10000 + idCounter}`,
      category,
      status,
      loc.lat,
      loc.lng,
      loc.ward,
      reporterId,
      {
        ageMs,
        mediaCount: status === "VERIFIED" || status === "BOUNTY" || status === "PENDING_VERIFICATION" ? 3 : 2,
        slaHours: status === "BOUNTY" ? 24 : 48,
        claimedBy: status !== "OPEN" && status !== "ACKNOWLEDGED" && status !== "FLAGGED" && status !== "REOPENED" ? "Mohan Raj" : undefined,
      }
    )
    reports.push(report)
  }

  return reports
}

export const MOCK_REPORTS: Report[] = buildMockReports()

// ---------- LIVE ACTIVITY ----------

export const MOCK_LIVE_ACTIVITY: LiveActivityEvent[] = [
  { id: "la-1", type: "new_report", description: "New report — Garbage accumulation", wardNumber: 18, timestamp: new Date(Date.now() - 2 * 60000).toISOString(), icon: "AlertTriangle", color: "text-status-open" },
  { id: "la-2", type: "claimed", description: "Cleanup claimed — Overflowing bin", wardNumber: 9, timestamp: new Date(Date.now() - 7 * 60000).toISOString(), icon: "UserCheck", color: "text-status-blue-600" },
  { id: "la-3", type: "cleanup_completed", description: "Cleanup completed — Illegal dumping", wardNumber: 12, timestamp: new Date(Date.now() - 14 * 60000).toISOString(), icon: "CheckCircle", color: "text-civic-green-600" },
  { id: "la-4", type: "verified", description: "Issue verified — Roadside waste", wardNumber: 5, timestamp: new Date(Date.now() - 22 * 60000).toISOString(), icon: "ShieldCheck", color: "text-civic-green-600" },
  { id: "la-5", type: "bounty", description: "New bounty — Garbage accumulation", wardNumber: 21, timestamp: new Date(Date.now() - 30 * 60000).toISOString(), icon: "Award", color: "text-status-orange-600" },
  { id: "la-6", type: "followup", description: "Follow-up submitted — Dirty public area", wardNumber: 14, timestamp: new Date(Date.now() - 45 * 60000).toISOString(), icon: "MessageSquare", color: "text-status-purple-600" },
  { id: "la-7", type: "cleanup_started", description: "Cleanup started — Drainage problem", wardNumber: 7, timestamp: new Date(Date.now() - 55 * 60000).toISOString(), icon: "Wrench", color: "text-status-blue-600" },
  { id: "la-8", type: "reopened", description: "Issue reopened — Garbage accumulation", wardNumber: 3, timestamp: new Date(Date.now() - 65 * 60000).toISOString(), icon: "RotateCcw", color: "text-status-open" },
]

// ---------- STATS ----------

export function getLiveStats(reports: Report[] = MOCK_REPORTS): TransparencyStats {
  const totalVerified = reports.filter((r) => r.status === "VERIFIED").length

  const statusDistribution: StatusDistribution[] = Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
    const status = statusKey as ReportStatus
    const count = reports.filter((r) => r.status === status).length
    return {
      status,
      count,
      percentage: Math.round((count / reports.length) * 100),
      color: cfg.dotColor,
    }
  })

  const wardStatistics: WardStat[] = MOCK_WARDS.map((w) => {
    const wardReports = reports.filter((r) => r.jurisdiction.wardNumber === w.wardNumber)
    const resolved = wardReports.filter((r) => r.status === "VERIFIED").length
    const opened = wardReports.filter((r) => r.status === "OPEN").length
    const overdue = wardReports.filter((r) => r.isOverdue).length
    return {
      wardNumber: w.wardNumber,
      wardName: w.name,
      reports: wardReports.length,
      resolved,
      open: opened,
      overdue,
      governmentResolved: Math.floor(resolved * 0.7),
      ngoPublicResolved: Math.floor(resolved * 0.3),
      followUps: wardReports.reduce((sum, r) => sum + r.followUps.length, 0),
      avgResolutionHours: resolved > 0 ? (24 + (w.wardNumber % 12)) : 0,
    }
  })

  return {
    totalReports: reports.length,
    open: reports.filter((r) => r.status === "OPEN").length,
    acknowledged: reports.filter((r) => r.status === "ACKNOWLEDGED").length,
    claimed: reports.filter((r) => r.status === "CLAIMED").length,
    cleanupInProgress: reports.filter((r) => r.status === "CLEANUP_IN_PROGRESS").length,
    pendingVerification: reports.filter((r) => r.status === "PENDING_VERIFICATION").length,
    verified: reports.filter((r) => r.status === "VERIFIED").length,
    bounty: reports.filter((r) => r.status === "BOUNTY").length,
    flagged: reports.filter((r) => r.status === "FLAGGED").length,
    reopened: reports.filter((r) => r.status === "REOPENED").length,
    resolved: totalVerified,
    overdue: reports.filter((r) => r.isOverdue).length,
    followUps: reports.reduce((sum, r) => sum + r.followUps.length, 0),
    governmentResolutions: Math.floor(totalVerified * 0.7),
    ngoCommunityResolutions: Math.floor(totalVerified * 0.3),
    aiEvidenceFlags: reports.filter((r) => r.aiVerification?.state === "MANUAL_REVIEW_REQUIRED" || r.isSuspicious).length,
    averageResolutionHours: 28.4,
    wardStatistics,
    statusDistribution,
    resolutionBreakdown: {
      government: Math.floor(totalVerified * 0.7),
      ngoCommunity: Math.floor(totalVerified * 0.3),
      citizenReported: totalVerified,
    },
    recurringLocations: [
      { id: "rl-1", latitude: 12.3012, longitude: 76.6451, wardNumber: 8, issueType: "Garbage accumulation", frequency: 7, lastReported: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: "rl-2", latitude: 12.2890, longitude: 76.6490, wardNumber: 14, issueType: "Overflowing bin", frequency: 5, lastReported: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: "rl-3", latitude: 12.3080, longitude: 76.6320, wardNumber: 19, issueType: "Illegal dumping", frequency: 4, lastReported: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
  }
}

// ---------- LEADERBOARD ----------

export function getCitizenLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, user: { ...MOCK_USERS.citizen1, name: "Prakash Hegde", points: 4210 }, points: 4210, reports: 89, followUps: 24, verifiedContributions: 18, trustScore: 97 },
    { rank: 2, user: { ...MOCK_USERS.ngo1, name: "Mysuru Green Guardians" }, points: 3840, reports: 18, followUps: 24, verifiedContributions: 46, trustScore: 96 },
    { rank: 3, user: { ...MOCK_USERS.citizen2, name: "Lakshmi Iyer", points: 1560 }, points: 1560, reports: 23, followUps: 5, verifiedContributions: 2, trustScore: 88 },
    { rank: 4, user: getCurrentUser(), points: 420, reports: 5, followUps: 1, verifiedContributions: 0, trustScore: 72 },
  ]
}

export function getNGOLeaderboard(): NGOLeaderboardEntry[] {
  return [
    { rank: 1, organization: "Mysuru Green Guardians", cleanupPoints: 3840, resolvedIssues: 46, bountiesCompleted: 12, members: 18, bannerUrl: "https://picsum.photos/seed/ngo-1/400/200" },
    { rank: 2, organization: "City Sweep Collective", cleanupPoints: 2150, resolvedIssues: 28, bountiesCompleted: 6, members: 12, bannerUrl: "https://picsum.photos/seed/ngo-2/400/200" },
    { rank: 3, organization: "Lake Care Initiative", cleanupPoints: 980, resolvedIssues: 14, bountiesCompleted: 3, members: 8, bannerUrl: "https://picsum.photos/seed/ngo-3/400/200" },
  ]
}

// ---------- CLIENT PERSISTENCE HELPER ----------
const STORAGE_KEY = "cleancity_persisted_reports"

function getStoredReports(): Report[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveStoredReport(report: Report) {
  const idx = MOCK_REPORTS.findIndex((r) => r.id === report.id || r.publicId === report.publicId)
  if (idx >= 0) {
    MOCK_REPORTS[idx] = { ...report }
  } else {
    MOCK_REPORTS.unshift({ ...report })
  }
  if (typeof window === "undefined") return
  try {
    const existing = getStoredReports().filter((r) => r.id !== report.id && r.publicId !== report.publicId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...existing]))
  } catch {
    // ignore
  }
}

// ---------- MOCK SERVICES ----------

export const mockReportsService = {
  getReports: (): Report[] => {
    const stored = getStoredReports()
    if (stored.length === 0) return MOCK_REPORTS
    const storedIds = new Set(stored.map((s) => s.id))
    return [...stored, ...MOCK_REPORTS.filter((r) => !storedIds.has(r.id))]
  },
  getReport: (id: string): Report | undefined => {
    const stored = getStoredReports()
    const foundStored = stored.find((r) => r.publicId === id || r.id === id)
    if (foundStored) return foundStored
    return MOCK_REPORTS.find((r) => r.publicId === id || r.id === id)
  },
  getReportsByStatus: (status: ReportStatus): Report[] => mockReportsService.getReports().filter((r) => r.status === status),
  getReportsByWard: (wardNumber: number): Report[] => mockReportsService.getReports().filter((r) => r.jurisdiction.wardNumber === wardNumber),
  getReportsNearby: (lat: number, lng: number, radiusKm: number): Report[] => {
    const R = 6371
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat - MYSRU_CENTER[0])
    const dLng = toRad(lng - MYSRU_CENTER[1])
    return mockReportsService.getReports().filter((r) => {
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(MYSRU_CENTER[0])) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const dist = R * c
      return dist <= radiusKm
    })
  },
  createReport: (data: {
    category?: ReportCategory
    latitude?: number
    longitude?: number
    wardNumber?: number
    description?: string
    media?: ReportMedia[]
    gpsAccuracy?: number
    locationName?: string
  }): Report => {
    const idCounter = MOCK_REPORTS.length + 1001
    const newReport = makeReport(
      `report-${idCounter}`,
      `MC-${10000 + idCounter}`,
      data.category ?? "garbage_accumulation",
      "OPEN",
      data.latitude ?? MYSRU_CENTER[0] + 0.005,
      data.longitude ?? MYSRU_CENTER[1] + 0.005,
      data.wardNumber ?? 18,
      "currentUser",
      {
        mediaCount: data.media && data.media.length > 0 ? data.media.length : 3,
        gpsAccuracy: data.gpsAccuracy ?? 8,
      }
    )
    if (data.description) {
      newReport.description = data.description
    }
    if (data.media && data.media.length > 0) {
      newReport.media = data.media
    }
    if (data.locationName) {
      newReport.locationName = data.locationName
    }
    MOCK_REPORTS.unshift(newReport)
    saveStoredReport(newReport)
    notificationService.addNotification("REPORT_SUBMITTED", {
      reportId: newReport.id,
      reportPublicId: newReport.publicId,
      wardName: newReport.jurisdiction.name,
    })
    return newReport
  },
  submitFollowup: (reportId: string, data: { comment: string; media: ReportMedia[] }): FollowUp | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report) return undefined
    const fu: FollowUp = {
      id: `fu-${Date.now()}`,
      reportId,
      submittedBy: getCurrentUser(),
      latitude: report.latitude + 0.001,
      longitude: report.longitude + 0.001,
      media: data.media,
      comment: data.comment,
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      triggeredReopen: Math.random() > 0.6,
    }
    report.followUps.push(fu)
    if (fu.triggeredReopen) {
      report.status = "REOPENED"
      report.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: fu.submittedAt,
        type: "reopened",
        status: "REOPENED",
        description: "Status: Reopened due to follow-up",
      })
    }
    saveStoredReport(report)
    notificationService.addNotification("FOLLOW_UP_RECEIVED", {
      reportId: report.id,
      reportPublicId: report.publicId,
    })
    if (report.status === "REOPENED") {
      notificationService.addNotification("REOPENED", {
        reportId: report.id,
        reportPublicId: report.publicId,
      })
    }
    return fu
  },
  claimReport: (reportId: string): Report | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report || report.status === "VERIFIED" || report.status === "REOPENED") return undefined
    report.status = "CLAIMED"
    report.claimedAt = new Date().toISOString()
    report.updatedAt = report.claimedAt
    report.assignedActor = {
      id: "official1",
      name: "Mohan Raj",
      role: "official",
      organization: "Mysuru Municipal Corporation",
    }
    report.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: report.claimedAt,
      type: "claimed",
      description: "Report claimed for cleanup",
      actor: "Mohan Raj",
    })
    report.timeline.push({
      id: `tl-${Date.now() + 1}`,
      timestamp: report.claimedAt,
      type: "status_changed",
      status: "CLAIMED",
      description: "Status: Claimed",
    })
    saveStoredReport(report)
    notificationService.addNotification("REPORT_CLAIMED", {
      reportId: report.id,
      reportPublicId: report.publicId,
      actorName: report.assignedActor?.name || "Municipal Officer",
    })
    return report
  },
  startCleanup: (reportId: string): Report | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report || report.status === "VERIFIED") return undefined
    report.status = "CLEANUP_IN_PROGRESS"
    report.updatedAt = new Date().toISOString()
    if (!report.claimedAt) report.claimedAt = report.updatedAt
    if (!report.assignedActor) {
      report.assignedActor = {
        id: "official1",
        name: "Mohan Raj",
        role: "official",
        organization: "Mysuru Municipal Corporation",
      }
    }
    report.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: report.updatedAt,
      type: "cleanup_started",
      description: "Cleanup started on site",
      actor: report.assignedActor.name,
    })
    report.timeline.push({
      id: `tl-${Date.now() + 1}`,
      timestamp: report.updatedAt,
      type: "status_changed",
      status: "CLEANUP_IN_PROGRESS",
      description: "Status: Cleanup In Progress",
    })
    saveStoredReport(report)
    notificationService.addNotification("CLEANUP_STARTED", {
      reportId: report.id,
      reportPublicId: report.publicId,
      actorName: report.assignedActor?.name || "Municipal Officer",
    })
    return report
  },
  completeCleanup: (reportId: string, afterMedia?: ReportMedia[], notes?: string): Report | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report || (report.status !== "CLAIMED" && report.status !== "CLEANUP_IN_PROGRESS")) return undefined
    report.status = "PENDING_VERIFICATION"
    report.cleanupCompletedAt = new Date().toISOString()
    report.updatedAt = report.cleanupCompletedAt
    if (afterMedia && afterMedia.length > 0) {
      report.afterMedia = afterMedia
    } else if (!report.afterMedia || report.afterMedia.length === 0) {
      report.afterMedia = [
        {
          id: `${report.id}-after-1`,
          type: "image",
          url: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=640&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=160&q=80",
          capturedAt: report.cleanupCompletedAt,
          caption: notes || "Area cleared, swept, and sanitized",
        },
      ]
    }
    const actorName = report.assignedActor?.name ?? "Mohan Raj"
    report.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: report.cleanupCompletedAt,
      type: "cleanup_completed",
      description: notes ? `Cleanup completed: ${notes}` : "Cleanup completed",
      actor: actorName,
    })
    report.timeline.push({
      id: `tl-${Date.now() + 1}`,
      timestamp: report.cleanupCompletedAt,
      type: "after_evidence_uploaded",
      description: "After evidence uploaded",
      mediaCount: report.afterMedia.length,
      actor: actorName,
    })
    report.timeline.push({
      id: `tl-${Date.now() + 2}`,
      timestamp: report.cleanupCompletedAt,
      type: "status_changed",
      status: "PENDING_VERIFICATION",
      description: "Status: Pending Verification",
    })
    saveStoredReport(report)
    notificationService.addNotification("CLEANUP_COMPLETED", {
      reportId: report.id,
      reportPublicId: report.publicId,
    })
    return report
  },
  verifyCleanup: (
    reportId: string,
    outcome: AIVerificationState = "VERIFIED",
    notes?: string
  ): Report | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report) return undefined
    const now = new Date().toISOString()
    report.updatedAt = now

    if (outcome === "VERIFIED") {
      report.status = "VERIFIED"
      report.verifiedAt = now
      report.aiVerification = {
        state: "VERIFIED",
        confidence: 94,
        reason: notes || "Garbage visible in the original evidence is absent from the after image. Area verified clear.",
        detected: "Cleanup detected",
        timestamp: now,
        provider: "cleancity-ai-v1",
      }
      report.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        type: "verified",
        description: notes ? `Verification approved: ${notes}` : "AI & Civic verification completed",
        actor: "Civic Operations",
        details: { confidence: 94, detected: "Cleanup detected" },
      })
      report.timeline.push({
        id: `tl-${Date.now() + 1}`,
        timestamp: now,
        type: "status_changed",
        status: "VERIFIED",
        description: "Status: Verified",
      })
    } else if (outcome === "REJECTED") {
      report.status = "REOPENED"
      report.aiVerification = {
        state: "REJECTED",
        confidence: 88,
        reason: notes || "After evidence does not match the original issue location or waste remains visible.",
        detected: "Insufficient clearance",
        timestamp: now,
        provider: "cleancity-ai-v1",
      }
      report.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        type: "rejected",
        description: notes ? `Resolution rejected: ${notes}` : "Evidence rejected by civic inspector",
        actor: "Mohan Raj (Supervisor)",
      })
      report.timeline.push({
        id: `tl-${Date.now() + 1}`,
        timestamp: now,
        type: "reopened",
        status: "REOPENED",
        description: "Status: Reopened for remediation",
      })
    } else {
      report.status = "PENDING_VERIFICATION"
      report.aiVerification = {
        state: outcome,
        confidence: 58,
        reason: notes || "Image lighting or angle uncertain. Escalated for on-ground supervisory spot-check.",
        detected: outcome === "MANUAL_REVIEW_REQUIRED" ? "Manual review required" : "Uncertain match",
        timestamp: now,
        provider: "cleancity-ai-v1",
      }
      report.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: now,
        type: "manual_review",
        description: `Flagged for ${outcome === "MANUAL_REVIEW_REQUIRED" ? "Senior Manual Review" : "Further Inspection"}`,
        actor: "Verification System",
      })
    }
    saveStoredReport(report)
    const nType = outcome === "VERIFIED" ? "VERIFIED" as const
      : outcome === "REJECTED" ? "REJECTED" as const
      : "UNCERTAIN" as const
    notificationService.addNotification(nType, {
      reportId: report.id,
      reportPublicId: report.publicId,
    })
    return report
  },
  claimBounty: (reportId: string): Report | undefined => {
    const report = mockReportsService.getReport(reportId)
    if (!report) return undefined
    report.status = "CLAIMED"
    report.claimedAt = new Date().toISOString()
    report.updatedAt = report.claimedAt
    report.assignedActor = {
      id: "ngo1",
      name: "Mysuru Green Guardians",
      role: "ngo",
      organization: "Mysuru Green Guardians NGO",
    }
    report.timeline.push({
      id: `tl-${Date.now()}`,
      timestamp: report.claimedAt,
      type: "bounty_awarded",
      description: `Bounty claimed (+${report.bountyAmount ?? 150} points upon completion) by Mysuru Green Guardians`,
      actor: "Mysuru Green Guardians",
    })
    report.timeline.push({
      id: `tl-${Date.now() + 1}`,
      timestamp: report.claimedAt,
      type: "status_changed",
      status: "CLAIMED",
      description: "Status: Claimed (NGO Bounty Task)",
    })
    saveStoredReport(report)
    notificationService.addNotification("REPORT_CLAIMED", {
      reportId: report.id,
      reportPublicId: report.publicId,
      actorName: "Mysuru Green Guardians (NGO)",
    })
    return report
  },
}

export const mockTransparencyService = {
  getStats: (): TransparencyStats => getLiveStats(),
}

export const mockLeaderboardService = {
  getCitizenLeaderboard: (): LeaderboardEntry[] => getCitizenLeaderboard(),
  getNGOLeaderboard: (): NGOLeaderboardEntry[] => getNGOLeaderboard(),
}

export const mockVerificationService = {
  verifyCleanup: (reportId: string): AIVerification | undefined => {
    const report = mockReportsService.getReport(reportId)
    return report?.aiVerification
  },
}

export const mockActivityService = {
  getLiveActivity: (): LiveActivityEvent[] => MOCK_LIVE_ACTIVITY,
  generateEvent: (): LiveActivityEvent => {
    const events = MOCK_LIVE_ACTIVITY.slice(0, 5)
    return events[Math.floor(Math.random() * events.length)]
  },
}
