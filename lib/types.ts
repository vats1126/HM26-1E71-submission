export type UserRole = "citizen" | "official" | "ngo"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  trustScore: number
  points: number
  reportsSubmitted: number
  followUpsSubmitted: number
  verifiedContributions: number
  badges: Badge[]
  joinedAt: string
}

export type BadgeType =
  | "civic_reporter"
  | "cleanup_champion"
  | "community_helper"
  | "verification_helper"
  | "early_adopter"
  | "conscientious_citizen"

export interface Badge {
  type: BadgeType
  label: string
  description: string
  icon: string
  earnedAt: string
}

export interface Jurisdiction {
  id: string
  name: string
  wardNumber: number
  type: "ward" | "zonal" | "city"
  boundary?: GeoJSONPolygon
  responsibleOfficial?: string
  contactPhone?: string
  coverageArea?: string
}

export interface GeoJSONPolygon {
  type: "Polygon"
  coordinates: number[][][]
}

export type ReportStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "CLAIMED"
  | "CLEANUP_IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "BOUNTY"
  | "FLAGGED"
  | "REOPENED"

export type FilterMode = "all" | "open" | "in_progress" | "pending_verification" | "verified" | "bounty" | "flagged"

export interface Report {
  id: string
  publicId: string
  category: ReportCategory
  subcategory?: string
  description: string
  latitude: number
  longitude: number
  gpsAccuracy: number
  capturedAt: string
  jurisdiction: Jurisdiction
  status: ReportStatus
  createdAt: string
  updatedAt: string
  claimedAt?: string
  cleanupCompletedAt?: string
  verifiedAt?: string
  slaBreachAt?: string
  reporter: User
  media: ReportMedia[]
  afterMedia?: ReportMedia[]
  assignedActor?: AssignedActor
  slaHours: number
  isOverdue: boolean
  bountyAmount?: number
  aiVerification?: AIVerification
  isSuspicious?: boolean
  timeline: TimelineEvent[]
  followUps: FollowUp[]
  wardName: string
  locationName?: string
}

export type ReportCategory =
  | "garbage_accumulation"
  | "overflowing_bin"
  | "illegal_dumping"
  | "dirty_public_area"
  | "drainage_problem"
  | "roadside_waste"
  | "other"

export interface ReportMedia {
  id: string
  type: "image" | "video"
  url: string
  thumbnailUrl?: string
  capturedAt: string
  caption?: string
}

export interface AssignedActor {
  id: string
  name: string
  role: UserRole
  organization?: string
  avatar?: string
}

export type AIVerificationState =
  | "VERIFIED"
  | "REJECTED"
  | "UNCERTAIN"
  | "MANUAL_REVIEW_REQUIRED"

export interface AIVerification {
  state: AIVerificationState
  confidence: number
  reason: string
  detected: string
  timestamp: string
  provider: string
}

export interface FollowUp {
  id: string
  reportId: string
  submittedBy: User
  latitude: number
  longitude: number
  media: ReportMedia[]
  comment: string
  submittedAt: string
  status: "SUBMITTED" | "REVIEWED" | "TRIGGERED_REOPEN"
  triggeredReopen?: boolean
}

export interface TimelineEvent {
  id: string
  timestamp: string
  type: TimelineEventType
  status?: ReportStatus
  description: string
  actor?: string
  mediaCount?: number
  details?: Record<string, unknown>
}

export type TimelineEventType =
  | "reported"
  | "evidence_uploaded"
  | "status_changed"
  | "claimed"
  | "cleanup_started"
  | "cleanup_completed"
  | "after_evidence_uploaded"
  | "followup_submitted"
  | "verified"
  | "rejected"
  | "reopened"
  | "bounty_awarded"
  | "flagged"
  | "manual_review"

export interface PointTransaction {
  id: string
  userId: string
  points: number
  type:
    | "REPORT_SUBMITTED"
    | "REPORT_CLAIMED"
    | "CLEANUP_COMPLETED"
    | "VERIFICATION_HELPER"
    | "FOLLOWUP_SUBMITTED"
    | "BOUNTY_CLAIMED"
    | "BOUNTY_COMPLETED"
    | "REPORTER_OF_THE_DAY"
  description: string
  createdAt: string
  relatedReportId?: string
}

export interface AuditEvent {
  id: string
  reportId: string
  actorId: string
  actorName: string
  action:
    | "created"
    | "claimed"
    | "started_cleanup"
    | "completed_cleanup"
    | "uploaded_evidence"
    | "verified"
    | "rejected"
    | "reopened"
    | "flagged"
    | "followup_submitted"
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface TransparencyStats {
  totalReports: number
  open: number
  acknowledged: number
  claimed: number
  cleanupInProgress: number
  pendingVerification: number
  verified: number
  bounty: number
  flagged: number
  reopened: number
  resolved: number
  overdue: number
  followUps: number
  governmentResolutions: number
  ngoCommunityResolutions: number
  aiEvidenceFlags: number
  averageResolutionHours: number
  wardStatistics: WardStat[]
  statusDistribution: StatusDistribution[]
  resolutionBreakdown: ResolutionBreakdown
  recurringLocations: RecurringLocation[]
}

export interface WardStat {
  wardNumber: number
  wardName: string
  reports: number
  resolved: number
  open: number
  overdue: number
  governmentResolved: number
  ngoPublicResolved: number
  followUps: number
  avgResolutionHours: number
}

export interface StatusDistribution {
  status: ReportStatus
  count: number
  percentage: number
  color: string
}

export interface ResolutionBreakdown {
  government: number
  ngoCommunity: number
  citizenReported: number
}

export interface RecurringLocation {
  id: string
  latitude: number
  longitude: number
  wardNumber: number
  issueType: string
  frequency: number
  lastReported: string
}

export interface LeaderboardEntry {
  rank: number
  user: User
  points: number
  reports: number
  followUps: number
  verifiedContributions: number
  trustScore: number
}

export interface NGOLeaderboardEntry {
  rank: number
  organization: string
  cleanupPoints: number
  resolvedIssues: number
  bountiesCompleted: number
  members: number
  bannerUrl?: string
}

export interface LiveActivityEvent {
  id: string
  type: "new_report" | "claimed" | "cleanup_started" | "cleanup_completed" | "verified" | "followup" | "bounty" | "reopened"
  description: string
  wardNumber: number
  timestamp: string
  icon: string
  color: string
}

export const REPORT_CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: "garbage_accumulation", label: "Garbage Accumulation", icon: "Trash2" },
  { value: "overflowing_bin", label: "Overflowing Bin", icon: "Bottle" },
  { value: "illegal_dumping", label: "Illegal Dumping", icon: "AlertTriangle" },
  { value: "dirty_public_area", label: "Dirty Public Area", icon: "MapPin" },
  { value: "drainage_problem", label: "Drainage Problem", icon: "Droplets" },
  { value: "roadside_waste", label: "Roadside Waste", icon: "Truck" },
  { value: "other", label: "Other", icon: "HelpCircle" },
]

export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; dotColor: string; sortOrder: number }
> = {
  OPEN: { label: "Open", color: "text-status-open", bg: "bg-status-open/10", dotColor: "bg-status-open", sortOrder: 1 },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-status-yellow-600", bg: "bg-status-yellow-100", dotColor: "bg-status-yellow-500", sortOrder: 2 },
  CLAIMED: { label: "Claimed", color: "text-status-blue-600", bg: "bg-status-blue-100", dotColor: "bg-status-blue-500", sortOrder: 3 },
  CLEANUP_IN_PROGRESS: { label: "Cleanup In Progress", color: "text-status-blue-600", bg: "bg-status-blue-100", dotColor: "bg-status-blue-500", sortOrder: 4 },
  PENDING_VERIFICATION: { label: "Pending Verification", color: "text-status-purple-600", bg: "bg-status-purple-100", dotColor: "bg-status-purple-500", sortOrder: 5 },
  VERIFIED: { label: "Verified", color: "text-civic-green-700", bg: "bg-civic-green-100", dotColor: "bg-civic-green-500", sortOrder: 6 },
  BOUNTY: { label: "Bounty Available", color: "text-status-orange-700", bg: "bg-status-orange-100", dotColor: "bg-status-orange-500", sortOrder: 2 },
  FLAGGED: { label: "Flagged", color: "text-status-yellow-700", bg: "bg-status-yellow-100", dotColor: "bg-status-yellow-500", sortOrder: 0 },
  REOPENED: { label: "Reopened", color: "text-status-open", bg: "bg-status-open/10", dotColor: "bg-status-open", sortOrder: 1 },
}

export const STATUS_ORDER: ReportStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "CLAIMED",
  "CLEANUP_IN_PROGRESS",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "BOUNTY",
  "FLAGGED",
  "REOPENED",
]
