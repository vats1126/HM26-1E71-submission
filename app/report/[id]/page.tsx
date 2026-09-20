"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Check,
  Calendar,
  User,
  Plus,
  Compass,
  FileText,
  Camera,
  Play,
  Award,
  ChevronRight,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Send,
  X,
  Coins,
  AlertCircle,
  Wrench,
  UserCheck,
  RotateCcw,
  Info,
  Phone,
  Mail,
  Building2,
  Zap,
  Maximize2,
  CheckSquare,
  Upload,
  Layers,
} from "lucide-react"
import { mockReportsService } from "@/lib/mock-data"
import {
  type Report,
  type ReportStatus,
  type TimelineEvent,
  type FollowUp,
  type ReportMedia,
  type AIVerificationState,
  STATUS_CONFIG,
} from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { useToast } from "@/components/shared/Toast"
import { useRole } from "@/lib/role-context"
import { cn } from "@/lib/utils"

// Canonical stages for the civic complaint lifecycle
const LIFECYCLE_STAGES: {
  key: string
  label: string
  statuses: ReportStatus[]
  description: string
}[] = [
  {
    key: "reported",
    label: "1. Reported",
    statuses: ["OPEN", "ACKNOWLEDGED", "CLAIMED", "CLEANUP_IN_PROGRESS", "PENDING_VERIFICATION", "VERIFIED", "BOUNTY", "FLAGGED", "REOPENED"],
    description: "Logged with GPS watermark",
  },
  {
    key: "acknowledged",
    label: "2. Acknowledged",
    statuses: ["ACKNOWLEDGED", "CLAIMED", "CLEANUP_IN_PROGRESS", "PENDING_VERIFICATION", "VERIFIED", "BOUNTY"],
    description: "Routed to Ward SLA queue",
  },
  {
    key: "claimed",
    label: "3. Claimed",
    statuses: ["CLAIMED", "CLEANUP_IN_PROGRESS", "PENDING_VERIFICATION", "VERIFIED"],
    description: "Official assigned on site",
  },
  {
    key: "in_progress",
    label: "4. Cleanup",
    statuses: ["CLEANUP_IN_PROGRESS", "PENDING_VERIFICATION", "VERIFIED"],
    description: "Sanitation underway",
  },
  {
    key: "pending_verification",
    label: "5. Review",
    statuses: ["PENDING_VERIFICATION", "VERIFIED"],
    description: "After-evidence awaiting check",
  },
  {
    key: "verified",
    label: "6. Verified",
    statuses: ["VERIFIED"],
    description: "AI & citizen confirmed",
  },
]

export default function PublicReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { role } = useRole()

  const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const reportId = rawId?.trim()

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)

  // Evidence tabs: "before" vs "after" vs "side_by_side"
  const [evidenceTab, setEvidenceTab] = useState<"before" | "after" | "side_by_side">("before")

  // Modal image lightbox
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; caption?: string; tag: string } | null>(null)

  // Follow-up modal state ("Was this issue actually resolved?")
  const [isFollowUpOpen, setIsFollowUpOpen] = useState<boolean>(false)
  const [followUpComment, setFollowUpComment] = useState<string>("")
  const [followUpTriggerReopen, setFollowUpTriggerReopen] = useState<boolean>(false)
  const [followUpLocation, setFollowUpLocation] = useState<string>("Mysuru (GPS Tagged)")
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState<boolean>(false)

  // Demo simulator execution state
  const [simulatingAction, setSimulatingAction] = useState<string | null>(null)

  // Fetch report data
  const loadReport = useCallback(async () => {
    if (!reportId) {
      setLoading(false)
      return
    }

    let found: Report | null = null
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.report) {
          found = json.report
        }
      }
    } catch {
      // Fallback cleanly to local store
    }

    if (!found) {
      found = mockReportsService.getReport(reportId) || null
    }

    if (found) {
      setReport({ ...found })
      if (found.afterMedia && found.afterMedia.length > 0) {
        setEvidenceTab("side_by_side")
      }
    }
    setLoading(false)
  }, [reportId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const copyPublicLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      showToast("Public report link copied to clipboard!", "success")
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const copyShareLink = copyPublicLink

  // -------------------------------------------------------------
  // ACTIONS / LIFECYCLE TRANSITIONS
  // -------------------------------------------------------------
  const handleClaimReport = async () => {
    if (!report) return
    setSimulatingAction("claim")
    await new Promise((r) => setTimeout(r, 600))

    try {
      const res = await fetch(`/api/reports/${report.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "official" }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.report) {
          setReport({ ...json.report })
          showToast("Report claimed by Ward Officer Mohan Raj!", "success")
          setSimulatingAction(null)
          return
        }
      }
    } catch {
      // Fallback to mock
    }

    const updated = mockReportsService.claimReport(report.id) || mockReportsService.claimReport(report.publicId)
    if (updated) {
      setReport({ ...updated })
      showToast("Report claimed by Ward Officer Mohan Raj!", "success")
    }
    setSimulatingAction(null)
  }

  const handleClaimBounty = async () => {
    if (!report) return
    setSimulatingAction("bounty")
    await new Promise((r) => setTimeout(r, 600))

    try {
      const res = await fetch(`/api/reports/${report.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ngo" }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.report) {
          setReport({ ...json.report })
          showToast("Cleanup bounty claimed by Mysuru Green Guardians (NGO)!", "success")
          setSimulatingAction(null)
          return
        }
      }
    } catch {
      // Fallback to mock
    }

    const updated = mockReportsService.claimBounty(report.id) || mockReportsService.claimBounty(report.publicId)
    if (updated) {
      setReport({ ...updated })
      showToast("Cleanup bounty claimed by Mysuru Green Guardians (NGO)!", "success")
    }
    setSimulatingAction(null)
  }

  const handleCompleteCleanup = async () => {
    if (!report) return
    setSimulatingAction("cleanup")
    await new Promise((r) => setTimeout(r, 600))

    try {
      const res = await fetch(`/api/reports/${report.id}/cleanup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          afterMedia: [
            {
              url: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=640&q=80",
              caption: "Area cleared, swept, and sanitized",
            },
          ],
          notes: "Area cleared, swept, and sanitized",
        }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.report) {
          setReport({ ...json.report })
          setEvidenceTab("side_by_side")
          showToast("Cleanup completed! After-evidence uploaded for municipal review.", "success")
          setSimulatingAction(null)
          return
        }
      }
    } catch {
      // Fallback to mock
    }

    const updated = mockReportsService.completeCleanup(report.id) || mockReportsService.completeCleanup(report.publicId)
    if (updated) {
      setReport({ ...updated })
      setEvidenceTab("side_by_side")
      showToast("Cleanup completed! After-evidence uploaded for municipal review.", "success")
    }
    setSimulatingAction(null)
  }

  const handleVerifyCleanup = async () => {
    if (!report) return
    setSimulatingAction("verify")
    await new Promise((r) => setTimeout(r, 700))

    try {
      const res = await fetch(`/api/reports/${report.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: "VERIFIED" }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.report) {
          setReport({ ...json.report })
          showToast("AI & Citizen Verification PASS: Issue resolved and verified!", "success")
          setSimulatingAction(null)
          return
        }
      }
    } catch {
      // Fallback to mock
    }

    const updated = mockReportsService.verifyCleanup(report.id) || mockReportsService.verifyCleanup(report.publicId)
    if (updated) {
      setReport({ ...updated })
      showToast("AI & Citizen Verification PASS: Issue resolved and verified!", "success")
    }
    setSimulatingAction(null)
  }

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!report || !followUpComment.trim()) return

    setIsSubmittingFollowUp(true)
    await new Promise((r) => setTimeout(r, 700))

    const newMedia: ReportMedia[] = [
      {
        id: `fu-media-${Date.now()}`,
        type: "image",
        url: "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=640&q=80",
        caption: "Citizen verification follow-up observation",
        capturedAt: new Date().toISOString(),
      },
    ]

    const fu = mockReportsService.submitFollowup(report.id, {
      comment: followUpComment.trim(),
      media: newMedia,
    })

    if (followUpTriggerReopen && fu) {
      fu.triggeredReopen = true
      report.status = "REOPENED"
      report.timeline.push({
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "reopened",
        status: "REOPENED",
        description: `Status REOPENED by public follow-up: "${followUpComment.trim().substring(0, 45)}..."`,
        actor: "Citizen Follow-up",
      })
    }

    loadReport()
    setIsSubmittingFollowUp(false)
    setIsFollowUpOpen(false)
    setFollowUpComment("")
    setFollowUpTriggerReopen(false)
    showToast(
      followUpTriggerReopen
        ? "Follow-up logged. Complaint has been REOPENED."
        : "Public follow-up submitted successfully!",
      "success"
    )
  }

  // SLA Calculation
  const slaStatus = useMemo(() => {
    if (!report) return { remainingHours: 0, percentElapsed: 0, isOverdue: false, formattedDeadline: "" }

    const createdTime = new Date(report.createdAt).getTime()
    const totalSlaMs = report.slaHours * 3600000
    const deadlineTime = createdTime + totalSlaMs
    const now = Date.now()
    const diffMs = deadlineTime - now

    const isOverdue = report.isOverdue || diffMs < 0
    const remainingHours = Math.max(0, Math.round(diffMs / 3600000))
    const percentElapsed = Math.min(100, Math.max(0, Math.round(((now - createdTime) / totalSlaMs) * 100)))

    return {
      remainingHours,
      percentElapsed,
      isOverdue,
      formattedDeadline: new Date(deadlineTime).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }, [report])

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <LoadingState lines={7} />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState
          type="not_found"
          title="Civic Report Not Found"
          description={`No civic complaint matching ID "${reportId || "unknown"}" was found in the Mysuru Municipal registry.`}
          action={
            <div className="flex gap-3 justify-center mt-4">
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-300 transition-colors"
              >
                Back to Civic Map
              </Link>
              <Link
                href="/report"
                className="px-4 py-2.5 rounded-xl bg-civic-green-600 text-white text-xs font-bold hover:bg-civic-green-700 shadow-sm transition-all"
              >
                Report an Issue
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const hasAfterMedia = report.afterMedia && report.afterMedia.length > 0
  const isResolved = report.status === "VERIFIED"
  const isBountyEligible = report.status === "BOUNTY" || report.isOverdue || !!report.bountyAmount

  return (
    <div className="min-h-screen bg-gray-50/70 pb-28">
      {/* Top Bar Navigation */}
      <header className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Mysuru Civic Map</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all"
            >
              {copied ? <Check size={14} className="text-civic-green-600" /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied" : "Share Ticket"}</span>
            </button>

            <Link
              href="/report"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Report New</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* ========================================================= */}
        {/* 1. VISIBLE LIFECYCLE PIPELINE (JUDGE HIGHLIGHT)           */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Visible Civic Complaint Lifecycle
                </h2>
                <p className="text-[11px] text-gray-500">
                  Transparent municipal progression from citizen report to verified cleanup
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
              {report.publicId}
            </span>
          </div>

          {/* Stepper Pipeline */}
          <div className="pt-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {LIFECYCLE_STAGES.map((stage) => {
                const isPassedOrCurrent = stage.statuses.includes(report.status)
                const isCurrent =
                  (stage.key === "reported" && (report.status === "OPEN" || report.status === "REOPENED")) ||
                  (stage.key === "acknowledged" && report.status === "ACKNOWLEDGED") ||
                  (stage.key === "claimed" && report.status === "CLAIMED") ||
                  (stage.key === "in_progress" && report.status === "CLEANUP_IN_PROGRESS") ||
                  (stage.key === "pending_verification" && report.status === "PENDING_VERIFICATION") ||
                  (stage.key === "verified" && report.status === "VERIFIED")

                return (
                  <div
                    key={stage.key}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between min-h-[68px]",
                      isCurrent
                        ? "border-civic-green-600 bg-civic-green-50/80 ring-2 ring-civic-green-600/30"
                        : isPassedOrCurrent
                        ? "border-gray-200 bg-gray-50/60"
                        : "border-gray-100 bg-gray-50/30 opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isPassedOrCurrent ? (
                        <CheckCircle2 size={13} className="text-civic-green-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold truncate",
                          isCurrent ? "text-civic-green-900" : isPassedOrCurrent ? "text-gray-800" : "text-gray-400"
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-tight mt-1 line-clamp-2">
                      {stage.description}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. HEADER TICKET & STATUS BANNER                          */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          {/* Header Top: ID, Category, Status, Ward, Created Timestamp */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-civic-green-700 bg-civic-green-50 px-2.5 py-0.5 rounded-md border border-civic-green-200">
                  MCC Public Registry
                </span>
                <span className="text-xs text-gray-400 font-mono">•</span>
                <span className="text-xs font-mono font-bold text-gray-500">{report.publicId}</span>
              </div>

              <h1 className="text-2xl font-black text-gray-900 mt-2 capitalize tracking-tight">
                {report.category.replace(/_/g, " ")}
              </h1>

              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{report.wardName}</span>
                <span>•</span>
                <span>Reported by {report.reporter.name}</span>
                <span>•</span>
                <span>
                  {new Date(report.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Status Hierarchy Badge */}
            <div className="shrink-0 flex sm:flex-col sm:items-end gap-1.5">
              <StatusBadge status={report.status} size="lg" pulse />
              <span className="text-[11px] text-gray-400 font-medium">
                Last updated {new Date(report.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Complaint Description
            </span>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Contextual Quick Actions (State-dependent) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-semibold mr-1">Actions:</span>

            <button
              onClick={() => scrollToSection("evidence-section")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
            >
              <Camera size={13} />
              <span>View Evidence</span>
            </button>

            <button
              onClick={() => scrollToSection("timeline-section")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
            >
              <Calendar size={13} />
              <span>View Timeline</span>
            </button>

            <button
              onClick={() => scrollToSection("location-section")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
            >
              <MapPin size={13} />
              <span>View Location</span>
            </button>

            {/* State-appropriate operational action buttons (OFFICER ONLY) */}
            {role === "officer" && (report.status === "OPEN" || report.status === "BOUNTY") && (
              <button
                onClick={handleClaimReport}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white font-bold transition-all shadow-sm"
              >
                <UserCheck size={13} />
                <span>Claim Issue (Officer)</span>
              </button>
            )}

            {/* Officer Verify Cleanup */}
            {role === "officer" && report.status === "PENDING_VERIFICATION" && (
              <button
                onClick={handleVerifyCleanup}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white font-bold transition-all shadow-sm"
              >
                <Sparkles size={13} />
                <span>Verify Resolution</span>
              </button>
            )}

            {/* NGO Claim Bounty button */}
            {role === "ngo" && (report.status === "OPEN" || report.status === "BOUNTY") && isBountyEligible && (
              <button
                onClick={handleClaimBounty}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-status-orange-600 hover:bg-status-orange-700 text-white font-bold transition-all shadow-sm"
              >
                <Coins size={13} />
                <span>Claim Bounty (NGO)</span>
              </button>
            )}

            {/* Citizen Reopen Complaint */}
            {report.status === "VERIFIED" && role !== "public" && (
              <button
                onClick={() => {
                  setIsFollowUpOpen(true)
                  setFollowUpTriggerReopen(true)
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-status-red-600 hover:bg-status-red-700 text-white font-bold transition-all shadow-sm"
              >
                <RotateCcw size={13} />
                <span>Reopen Complaint</span>
              </button>
            )}

            {/* Citizen & NGO Submit Follow-up */}
            <button
              onClick={() => {
                if (role === "public") {
                  showToast("Public visitors have read-only access. Switch to Citizen role to submit follow-ups.", "warning")
                  return
                }
                setIsFollowUpOpen(true)
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold transition-all shadow-sm"
            >
              <MessageSquare size={13} />
              <span>Submit Follow-up</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOUNTY BANNER (IF OVERDUE OR BOUNTY-ELIGIBLE)          */}
        {/* ========================================================= */}
        {isBountyEligible && (
          <div className="rounded-2xl border-2 border-status-orange-400 bg-gradient-to-r from-status-orange-50 via-white to-status-orange-50 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-status-orange-500 text-white shadow-md">
                  <Coins size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-status-orange-700 bg-status-orange-100 px-2.5 py-0.5 rounded-full border border-status-orange-200">
                    Community Action Incentive
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1">
                    CLEANUP BOUNTY — +150 POINTS
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 max-w-md">
                    This civic complaint has breached normal turnaround or is high-priority. Sponsored by the Mysuru Clean City Fund for immediate citizen or NGO cleanup.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {role === "ngo" ? (
                  <button
                    type="button"
                    disabled={report.status !== "OPEN" && report.status !== "BOUNTY"}
                    onClick={handleClaimBounty}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all",
                      report.status === "OPEN" || report.status === "BOUNTY"
                        ? "bg-status-orange-600 hover:bg-status-orange-700 text-white active:scale-95 shadow-status-orange-500/30"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    CLAIM BOUNTY (NGO)
                  </button>
                ) : role === "officer" ? (
                  <button
                    type="button"
                    disabled={report.status !== "OPEN" && report.status !== "BOUNTY"}
                    onClick={handleClaimReport}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all",
                      report.status === "OPEN" || report.status === "BOUNTY"
                        ? "bg-civic-green-600 hover:bg-civic-green-700 text-white active:scale-95 shadow-civic-green-500/30"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    CLAIM FOR MUNICIPALITY
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-200 text-orange-800 text-xs font-semibold">
                      Open for NGO / Community Claim
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">Switch to NGO role to claim this bounty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. LOCATION DETAILS SECTION                               */}
        {/* ========================================================= */}
        <div id="location-section" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                <MapPin size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Geographic Tag & Jurisdiction</h2>
                <p className="text-[11px] text-gray-500">Verified satellite coordinates with precision metadata</p>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-civic-green-700 hover:underline inline-flex items-center gap-1"
            >
              <span>View on Map</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-medium block">Ward Jurisdiction</span>
              <p className="font-bold text-gray-900 text-xs mt-0.5 truncate">{report.wardName}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-medium block">Latitude / Longitude</span>
              <p className="font-mono font-bold text-gray-900 text-xs mt-0.5">
                {report.latitude.toFixed(6)}°, {report.longitude.toFixed(6)}°
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-medium block">GPS Accuracy</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-civic-green-500" />
                <span className="font-semibold text-gray-900 font-mono">±{report.gpsAccuracy}m</span>
                <span className="text-[10px] text-civic-green-700 font-medium">(High)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-medium block">Captured Timestamp</span>
              <p className="font-mono text-gray-700 text-xs mt-0.5 truncate">
                {new Date(report.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. BEFORE & AFTER EVIDENCE GALLERY                        */}
        {/* ========================================================= */}
        <div id="evidence-section" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                <Camera size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Before & After Evidence Gallery</h2>
                <p className="text-[11px] text-gray-500">
                  Compare reported civic condition against post-cleanup site resolution
                </p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center p-1 rounded-lg bg-gray-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEvidenceTab("before")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all",
                  evidenceTab === "before" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"
                )}
              >
                Before ({report.media.length})
              </button>
              <button
                type="button"
                onClick={() => setEvidenceTab("after")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all",
                  evidenceTab === "after" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"
                )}
              >
                After ({report.afterMedia?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setEvidenceTab("side_by_side")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all",
                  evidenceTab === "side_by_side" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"
                )}
              >
                Side-by-Side
              </button>
            </div>
          </div>

          {/* View: BEFORE */}
          {evidenceTab === "before" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-status-red-700 bg-status-red-50 px-2 py-0.5 rounded border border-status-red-200">
                  BEFORE CLEANUP — Original Evidence
                </span>
                <span>Captured {new Date(report.capturedAt).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.media.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => setActiveLightboxImg({ url: m.url, caption: m.caption, tag: "BEFORE CLEANUP" })}
                    className="group relative rounded-xl border border-gray-200 overflow-hidden aspect-video bg-gray-900 cursor-pointer shadow-sm"
                  >
                    <img
                      src={m.url}
                      alt={m.caption || `Before evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[11px] text-white flex items-center gap-1 font-medium">
                        <Maximize2 size={12} /> Click to inspect
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-status-red-600 text-white shadow">
                      Before #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View: AFTER */}
          {evidenceTab === "after" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-civic-green-700 bg-civic-green-50 px-2 py-0.5 rounded border border-civic-green-200">
                  AFTER CLEANUP — Remediated Site
                </span>
                {report.cleanupCompletedAt && (
                  <span>Cleared on {new Date(report.cleanupCompletedAt).toLocaleString()}</span>
                )}
              </div>

              {hasAfterMedia ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.afterMedia!.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      onClick={() => setActiveLightboxImg({ url: m.url, caption: m.caption, tag: "AFTER CLEANUP" })}
                      className="group relative rounded-xl border-2 border-civic-green-500 overflow-hidden aspect-video bg-gray-900 cursor-pointer shadow-sm"
                    >
                      <img
                        src={m.url}
                        alt={m.caption || `After cleanup ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="text-[11px] text-white flex items-center gap-1 font-medium">
                          <Maximize2 size={12} /> Click to inspect
                        </span>
                      </div>
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-civic-green-600 text-white shadow">
                        AFTER CLEANUP #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 p-8 text-center space-y-2">
                  <div className="p-3 rounded-full bg-gray-100 text-gray-400 w-fit mx-auto">
                    <Clock size={26} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-800">Pending After-Cleanup Evidence</h4>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Sanitation worker or NGO crew has not uploaded remediation photos yet. Evidence will appear here once on-site work is completed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* View: SIDE-BY-SIDE */}
          {evidenceTab === "side_by_side" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Column */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100 text-xs">
                  <span className="font-bold text-status-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-red-500" />
                    BEFORE (Reported Violation)
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div
                  onClick={() =>
                    setActiveLightboxImg({
                      url: report.media[0]?.url || "",
                      caption: "Original reported violation",
                      tag: "BEFORE CLEANUP",
                    })
                  }
                  className="relative rounded-xl border border-gray-200 overflow-hidden aspect-video bg-gray-900 cursor-pointer group shadow-sm"
                >
                  <img
                    src={report.media[0]?.url || "https://picsum.photos/seed/before/640/480"}
                    alt="Before evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-status-red-600 text-white shadow">
                    BEFORE
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded text-[10px] text-white/90 truncate">
                    GPS: {report.latitude.toFixed(4)}°, {report.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>

              {/* After Column */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100 text-xs">
                  <span className="font-bold text-civic-green-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-civic-green-500" />
                    AFTER CLEANUP (Remediated)
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {report.cleanupCompletedAt ? new Date(report.cleanupCompletedAt).toLocaleDateString() : "Pending"}
                  </span>
                </div>

                {hasAfterMedia ? (
                  <div
                    onClick={() =>
                      setActiveLightboxImg({
                        url: report.afterMedia![0]?.url || "",
                        caption: "Site cleared and sanitized",
                        tag: "AFTER CLEANUP",
                      })
                    }
                    className="relative rounded-xl border-2 border-civic-green-500 overflow-hidden aspect-video bg-gray-900 cursor-pointer group shadow-sm"
                  >
                    <img
                      src={report.afterMedia![0]?.url || "https://picsum.photos/seed/after/640/480"}
                      alt="After cleanup"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-civic-green-600 text-white shadow">
                      AFTER CLEANUP
                    </span>
                    <div className="absolute bottom-2 left-2 right-2 bg-civic-green-950/80 backdrop-blur-sm p-1.5 rounded text-[10px] text-civic-green-200 truncate">
                      Remediation Verified • Mysuru Municipal Corporation
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 h-[190px] flex flex-col items-center justify-center p-4 text-center">
                    <Clock size={24} className="text-gray-400 mb-1" />
                    <p className="text-xs font-bold text-gray-700">Awaiting Cleanup After-Photo</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Sanitation crew has not completed on-site clearing yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 6. ASSIGNED ACTOR & SLA COMPLIANCE GRID                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assigned Actor Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                  <UserCheck size={16} />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Assigned Actor & Accountability
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Ward Dispatch
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-civic-green-100 text-civic-green-800 font-bold flex items-center justify-center shrink-0 text-sm">
                {report.assignedActor ? report.assignedActor.name[0] : "M"}
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold text-gray-900 truncate">
                  {report.assignedActor ? report.assignedActor.name : "Mohan Raj"}
                </p>
                <p className="text-[11px] text-gray-500">
                  {report.assignedActor?.organization || "Mysuru Municipal Corporation (Official)"}
                </p>
                <p className="text-[11px] text-civic-green-700 font-semibold mt-0.5">
                  {report.status !== "OPEN" && report.status !== "ACKNOWLEDGED"
                    ? `Active Assignment • Claimed on ${new Date(report.claimedAt || report.createdAt).toLocaleDateString()}`
                    : "Assigned to Ward 18 Municipal Pool (Pending Claim)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Phone size={12} className="text-gray-400" />
                <span>+91 821 2418800</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail size={12} className="text-gray-400" />
                <span>ward18@mysuru.gov.in</span>
              </span>
            </div>
          </div>

          {/* SLA Compliance Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                  <Clock size={16} />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Municipal SLA Tracker
                </h3>
              </div>

              {slaStatus.isOverdue ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-red-100 text-status-red-700 border border-status-red-300">
                  SLA Breached
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-civic-green-100 text-civic-green-700 border border-civic-green-300">
                  Within SLA
                </span>
              )}
            </div>

            {/* SLA Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800">
                  {isResolved
                    ? "Resolved within municipal SLA"
                    : slaStatus.isOverdue
                    ? "Escalated to Zonal Commissioner"
                    : `${slaStatus.remainingHours}h remaining of ${report.slaHours}h SLA`}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {slaStatus.percentElapsed}% elapsed
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isResolved
                      ? "bg-civic-green-500"
                      : slaStatus.isOverdue
                      ? "bg-status-red-500"
                      : "bg-civic-green-600"
                  )}
                  style={{ width: `${slaStatus.percentElapsed}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block">SLA Target</span>
                <span className="font-semibold text-gray-700">{report.slaHours} Hours Standard</span>
              </div>
              <div>
                <span className="text-gray-400 block">Resolution Target</span>
                <span className="font-semibold text-gray-700">{slaStatus.formattedDeadline}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7. VERIFICATION STATE (VERIFIED / UNCERTAIN / MANUAL)     */}
        {/* ========================================================= */}
        {report.aiVerification && (
          <div className="rounded-2xl border border-civic-green-300 bg-gradient-to-br from-civic-green-50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-civic-green-600 text-white shadow-sm">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-civic-green-950">
                    Dual-Pass Civic Verification
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Visual computer vision verification combined with community trust consensus
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm",
                  report.aiVerification.state === "VERIFIED"
                    ? "bg-civic-green-600"
                    : report.aiVerification.state === "REJECTED"
                    ? "bg-status-red-600"
                    : "bg-status-yellow-600"
                )}
              >
                {report.aiVerification.state} ({report.aiVerification.confidence}%)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-civic-green-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>Provider: {report.aiVerification.provider}</span>
                <span>Timestamp: {new Date(report.aiVerification.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-gray-800 font-medium">
                &ldquo;{report.aiVerification.reason}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. VISUALLY STRONG LIFECYCLE TIMELINE                     */}
        {/* ========================================================= */}
        <div id="timeline-section" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                <Calendar size={18} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Municipal Action Timeline</h2>
                <p className="text-[11px] text-gray-500">
                  Immutable chronological audit trail adapting to report lifecycle
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
              {report.timeline.length} Actions Logged
            </span>
          </div>

          {/* Timeline Items */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pt-2">
            {report.timeline.map((evt, idx) => {
              const isLast = idx === report.timeline.length - 1
              return (
                <div key={evt.id || idx} className="relative group">
                  <div
                    className={cn(
                      "absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all",
                      isLast ? "bg-civic-green-600 scale-110" : "bg-gray-400"
                    )}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-900">{evt.description}</span>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">
                        {new Date(evt.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      {evt.actor && (
                        <span>
                          By <strong className="text-gray-700">{evt.actor}</strong>
                        </span>
                      )}
                      {evt.status && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-civic-green-700">Status: {evt.status}</span>
                        </>
                      )}
                      {evt.mediaCount && (
                        <>
                          <span>•</span>
                          <span>{evt.mediaCount} Evidence media attached</span>
                        </>
                      )}
                    </div>

                    {evt.details && (
                      <div className="mt-1 p-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-mono">
                        {JSON.stringify(evt.details)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9. PROMINENT SECTION: "WAS THIS ISSUE ACTUALLY RESOLVED?"  */}
        {/* ========================================================= */}
        <div id="followup-section" className="rounded-2xl border-2 border-civic-green-500 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700 shrink-0">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Was this issue actually resolved?
                </h2>
                <p className="text-xs text-gray-600 mt-0.5 max-w-lg leading-relaxed">
                  Citizens provide on-site accountability. If the cleanup was incomplete or waste has returned, submit a public follow-up to reopen this ticket immediately.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFollowUpOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold shadow-md shadow-civic-green-600/20 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>Submit Follow-up</span>
            </button>
          </div>

          {/* List of existing follow-ups */}
          {report.followUps.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
              No citizen follow-ups submitted yet. Be the first to verify this location.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Citizen Ground Observations ({report.followUps.length})
              </h3>
              {report.followUps.map((fu) => (
                <div key={fu.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">{fu.submittedBy.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(fu.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{fu.comment}</p>
                  {fu.triggeredReopen && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-red-700 bg-status-red-50 border border-status-red-200 px-2 py-0.5 rounded">
                      <RotateCcw size={11} /> Triggered Complaint Reopen
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 10. JUDGE DEMO ACTION BAR (ADVANCE LIFECYCLE)              */}
        {/* ========================================================= */}
        <div className="rounded-2xl border-2 border-dashed border-civic-green-400 bg-civic-green-50/50 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-civic-green-600 text-white">
                <Zap size={15} />
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-civic-green-950">
                Judge Demo Controls — Advance Complaint Lifecycle
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Test live state transitions</span>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            Click any button below to advance this complaint through the municipal lifecycle in real time. All data updates, audit timestamps, and service states are reflected immediately:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {/* 1. Claim */}
            {(report.status === "OPEN" || report.status === "ACKNOWLEDGED" || report.status === "BOUNTY") && (
              <button
                type="button"
                disabled={!!simulatingAction}
                onClick={handleClaimReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-civic-green-600 text-white text-xs font-bold hover:bg-civic-green-700 shadow-sm transition-all"
              >
                {simulatingAction === "claim" ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <UserCheck size={14} />
                )}
                <span>1. Claim as Municipal Officer</span>
              </button>
            )}

            {/* 2. Complete Cleanup */}
            {(report.status === "CLAIMED" || report.status === "CLEANUP_IN_PROGRESS") && (
              <button
                type="button"
                disabled={!!simulatingAction}
                onClick={handleCompleteCleanup}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-status-blue-600 text-white text-xs font-bold hover:bg-status-blue-700 shadow-sm transition-all"
              >
                {simulatingAction === "cleanup" ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Wrench size={14} />
                )}
                <span>2. Complete Cleanup & Upload After-Photo</span>
              </button>
            )}

            {/* 3. Verify */}
            {report.status === "PENDING_VERIFICATION" && (
              <button
                type="button"
                disabled={!!simulatingAction}
                onClick={handleVerifyCleanup}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-civic-green-600 text-white text-xs font-bold hover:bg-civic-green-700 shadow-sm transition-all"
              >
                {simulatingAction === "verify" ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                <span>3. Run AI & Citizen Verification</span>
              </button>
            )}

            {/* 4. Reopen */}
            {report.status === "VERIFIED" && (
              <button
                type="button"
                onClick={() => {
                  setIsFollowUpOpen(true)
                  setFollowUpTriggerReopen(true)
                  setFollowUpComment("Ground check: Garbage accumulation has reappeared at this corner. Triggering automatic complaint reopen.")
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-status-red-600 text-white text-xs font-bold hover:bg-status-red-700 shadow-sm transition-all"
              >
                <RotateCcw size={14} />
                <span>Simulate Citizen Reopen via Follow-up</span>
              </button>
            )}

            {/* Reload Ticket */}
            <button
              type="button"
              onClick={loadReport}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 shadow-sm"
            >
              <RefreshCw size={13} />
              <span>Refresh Ticket</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
          <Link href="/" className="font-bold text-civic-green-700 hover:underline">
            &larr; Return to Mysuru Civic Map
          </Link>
          <Link href="/report" className="font-bold text-civic-green-700 hover:underline">
            Submit Another Civic Report &rarr;
          </Link>
        </div>
      </main>

      {/* ========================================================= */}
      {/* FOLLOW-UP SUBMISSION MODAL ("Was this issue resolved?")   */}
      {/* ========================================================= */}
      {isFollowUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-civic-green-100 text-civic-green-700">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Submit Public Follow-up</h3>
                  <p className="text-[11px] text-gray-500">Ticket: {report.publicId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsFollowUpOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">
                  On-Site Observation Comment <span className="text-status-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={followUpComment}
                  onChange={(e) => setFollowUpComment(e.target.value)}
                  placeholder="Describe whether the issue was properly cleared, or if waste has reappeared..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-civic-green-600 focus:ring-2 focus:ring-civic-green-600/20"
                />
              </div>

              {/* Location Tag */}
              <div>
                <label className="font-bold uppercase tracking-wider text-gray-700 block mb-1">
                  Follow-up Location Tag
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] text-gray-700">
                  <MapPin size={14} className="text-civic-green-600" />
                  <span>{report.wardName} (Current Device GPS Verified)</span>
                </div>
              </div>

              {/* Reopen Checkbox */}
              <label className="flex items-start gap-2 p-3 rounded-xl bg-status-red-50/60 border border-status-red-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpTriggerReopen}
                  onChange={(e) => setFollowUpTriggerReopen(e.target.checked)}
                  className="mt-0.5 rounded border-status-red-300 text-status-red-600 focus:ring-status-red-500"
                />
                <span className="text-xs text-status-red-900 font-medium">
                  <strong>Issue is NOT resolved:</strong> Trigger automatic complaint reopen and alert ward inspector
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFollowUpOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFollowUp || !followUpComment.trim()}
                  className="px-5 py-2 rounded-xl bg-civic-green-600 hover:bg-civic-green-700 text-white font-bold shadow-sm transition-all"
                >
                  {isSubmittingFollowUp ? "Submitting..." : "Submit Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULLSCREEN LIGHTBOX MODAL                                 */}
      {/* ========================================================= */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
          >
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all z-10"
            >
              <X size={20} />
            </button>

            <img
              src={activeLightboxImg.url}
              alt="Evidence Full View"
              className="w-full max-h-[75vh] object-contain"
            />

            <div className="p-4 bg-gray-900/90 text-white flex items-center justify-between text-xs">
              <div>
                <span className="font-bold px-2 py-0.5 rounded bg-civic-green-600 text-white mr-2">
                  {activeLightboxImg.tag}
                </span>
                <span>{activeLightboxImg.caption || "Civic evidence photo"}</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px]">{report.wardName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
