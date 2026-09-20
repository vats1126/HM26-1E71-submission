"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  Award,
  ChevronRight,
  ExternalLink,
  Camera,
  Upload,
  X,
  Check,
  FileText,
  Eye,
  Building2,
  Wrench,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  AlertCircle,
  HelpCircle,
  Trash2,
} from "lucide-react"
import {
  mockReportsService,
  mockActivityService,
  getCurrentUser,
  getLiveStats,
} from "@/lib/mock-data"
import {
  type Report,
  type ReportStatus,
  type ReportMedia,
  type AIVerificationState,
  type TimelineEvent,
  STATUS_CONFIG,
} from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useToast } from "@/components/shared/Toast"
import { cn } from "@/lib/utils"

type DashboardFilter =
  | "ALL"
  | "OPEN"
  | "CLAIMED"
  | "CLEANUP_IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "BOUNTY"
  | "REOPENED"

// Sample realistic "after-cleanup" photos for instant demo selection
const SAMPLE_AFTER_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=640&q=80",
    caption: "Mysuru street pavement cleared and swept clean",
  },
  {
    url: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=640&q=80",
    caption: "Sanitized corner with waste collected into bins",
  },
  {
    url: "https://images.unsplash.com/photo-1584467741215-511cfb1c4c86?auto=format&fit=crop&w=640&q=80",
    caption: "Drainage cleared and silt removed by MCC team",
  },
]

export default function DashboardPage() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("ALL")
  const [activeTab, setActiveTab] = useState<"queue" | "bounties" | "activity">("queue")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWard, setSelectedWard] = useState<string>("ALL")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [activeDetailReportId, setActiveDetailReportId] = useState<string | null>(null)

  // Modals
  const [cleanupModalReport, setCleanupModalReport] = useState<Report | null>(null)
  const [verifyModalReport, setVerifyModalReport] = useState<Report | null>(null)

  // Cleanup evidence modal state
  const [afterPhotos, setAfterPhotos] = useState<Array<{ url: string; caption: string }>>([])
  const [workerNotes, setWorkerNotes] = useState("")
  const [isSubmittingCleanup, setIsSubmittingCleanup] = useState(false)

  // Verification modal state
  const [verifyOutcome, setVerifyOutcome] = useState<AIVerificationState>("VERIFIED")
  const [verifyNotes, setVerifyNotes] = useState("")
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false)

  // Refresh reports from service
  const refreshData = useCallback(() => {
    const updated = mockReportsService.getReports()
    setReports([...updated])
    if (activeDetailReportId) {
      const refreshedDetail = updated.find((r) => r.id === activeDetailReportId || r.publicId === activeDetailReportId)
      if (refreshedDetail) setSelectedReport(refreshedDetail)
    }
  }, [activeDetailReportId])

  useEffect(() => {
    refreshData()
    window.addEventListener("focus", refreshData)
    return () => window.removeEventListener("focus", refreshData)
  }, [refreshData])

  // Current active report for detail slide-over
  const currentDetailReport = useMemo(() => {
    if (!activeDetailReportId) return null
    return reports.find((r) => r.id === activeDetailReportId || r.publicId === activeDetailReportId) || null
  }, [activeDetailReportId, reports])

  // Real-time calculated stats from live reports data
  const stats = useMemo(() => {
    const total = reports.length
    const open = reports.filter((r) => r.status === "OPEN").length
    const claimed = reports.filter((r) => r.status === "CLAIMED").length
    const cleanupInProgress = reports.filter((r) => r.status === "CLEANUP_IN_PROGRESS").length
    const pendingVerification = reports.filter((r) => r.status === "PENDING_VERIFICATION").length
    const verified = reports.filter((r) => r.status === "VERIFIED").length
    const overdue = reports.filter((r) => r.isOverdue).length
    const bounty = reports.filter((r) => r.status === "BOUNTY" || (r.isOverdue && r.bountyAmount)).length
    const reopened = reports.filter((r) => r.status === "REOPENED").length

    return {
      total,
      open,
      claimed,
      cleanupInProgress,
      pendingVerification,
      verified,
      overdue,
      bounty,
      reopened,
    }
  }, [reports])

  // Filtered reports for queue
  const filteredQueue = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      if (activeFilter === "OPEN" && r.status !== "OPEN") return false
      if (activeFilter === "CLAIMED" && r.status !== "CLAIMED") return false
      if (activeFilter === "CLEANUP_IN_PROGRESS" && r.status !== "CLEANUP_IN_PROGRESS") return false
      if (activeFilter === "PENDING_VERIFICATION" && r.status !== "PENDING_VERIFICATION") return false
      if (activeFilter === "VERIFIED" && r.status !== "VERIFIED") return false
      if (activeFilter === "BOUNTY" && r.status !== "BOUNTY" && !(r.isOverdue && r.bountyAmount)) return false
      if (activeFilter === "REOPENED" && r.status !== "REOPENED") return false

      // Ward filter
      if (selectedWard !== "ALL" && r.jurisdiction.wardNumber.toString() !== selectedWard) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesId = r.publicId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        const matchesCategory = r.category.toLowerCase().includes(q)
        const matchesWard = r.wardName.toLowerCase().includes(q) || `ward ${r.jurisdiction.wardNumber}`.includes(q)
        const matchesActor = r.assignedActor?.name.toLowerCase().includes(q) ?? false
        const matchesDesc = r.description.toLowerCase().includes(q)
        return matchesId || matchesCategory || matchesWard || matchesActor || matchesDesc
      }

      return true
    })
  }, [reports, activeFilter, selectedWard, searchQuery])

  // Bounty reports
  const bountyReports = useMemo(() => {
    return reports.filter((r) => r.status === "BOUNTY" || (r.isOverdue && r.bountyAmount))
  }, [reports])

  // Operations Activity list (recent audit events across all reports)
  const operationsActivity = useMemo(() => {
    const events: Array<{
      id: string
      reportId: string
      publicId: string
      type: string
      description: string
      actor?: string
      timestamp: string
      wardName: string
    }> = []

    reports.forEach((r) => {
      r.timeline.forEach((tl) => {
        events.push({
          id: tl.id,
          reportId: r.id,
          publicId: r.publicId,
          type: tl.type,
          description: tl.description,
          actor: tl.actor,
          timestamp: tl.timestamp,
          wardName: r.wardName,
        })
      })
    })

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30)
  }, [reports])

  // --------------------------------------------------------------------------
  // ACTIONS: CLAIM, START CLEANUP, COMPLETE CLEANUP, VERIFY, BOUNTY
  // --------------------------------------------------------------------------

  // B4: CLAIM REPORT
  const handleClaim = (report: Report) => {
    const updated = mockReportsService.claimReport(report.id)
    if (updated) {
      showToast(`Report ${report.publicId} claimed and assigned to Mohan Raj.`, "success")
      refreshData()
    }
  }

  // B5: START CLEANUP
  const handleStartCleanup = (report: Report) => {
    const updated = mockReportsService.startCleanup(report.id)
    if (updated) {
      showToast(`Field team marked ${report.publicId} as Cleanup In Progress.`, "success")
      refreshData()
    }
  }

  // Open after evidence modal
  const openCleanupModal = (report: Report) => {
    setCleanupModalReport(report)
    setAfterPhotos([SAMPLE_AFTER_PHOTOS[0]])
    setWorkerNotes("Pavement completely cleared of waste, sanitized with bleaching powder.")
  }

  // B6: COMPLETE CLEANUP WITH AFTER EVIDENCE
  const handleCompleteCleanupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cleanupModalReport) return
    setIsSubmittingCleanup(true)

    const mediaItems: ReportMedia[] = afterPhotos.map((p, idx) => ({
      id: `${cleanupModalReport.id}-after-${idx + 1}`,
      type: "image",
      url: p.url,
      thumbnailUrl: p.url,
      capturedAt: new Date().toISOString(),
      caption: p.caption || "Completed cleanup proof",
    }))

    const updated = mockReportsService.completeCleanup(cleanupModalReport.id, mediaItems, workerNotes)
    setIsSubmittingCleanup(false)
    setCleanupModalReport(null)

    if (updated) {
      showToast(`${cleanupModalReport.publicId} submitted with evidence. Status: Pending Verification.`, "success")
      refreshData()
    }
  }

  // Open verification modal
  const openVerifyModal = (report: Report) => {
    setVerifyModalReport(report)
    setVerifyOutcome("VERIFIED")
    setVerifyNotes("After-evidence confirms complete site clearance. GPS metadata verified on site.")
  }

  // B7: VERIFICATION
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyModalReport) return
    setIsSubmittingVerify(true)

    const updated = mockReportsService.verifyCleanup(verifyModalReport.id, verifyOutcome, verifyNotes)
    setIsSubmittingVerify(false)
    setVerifyModalReport(null)

    if (updated) {
      const outcomeText =
        verifyOutcome === "VERIFIED"
          ? "Resolution Verified! 150 points credited."
          : verifyOutcome === "REJECTED"
          ? "Resolution Rejected. Report reopened for rework."
          : "Flagged for manual senior inspection."

      showToast(`${verifyModalReport.publicId}: ${outcomeText}`, verifyOutcome === "VERIFIED" ? "success" : "warning")
      refreshData()
    }
  }

  // B8: CLAIM BOUNTY
  const handleClaimBounty = (report: Report) => {
    const updated = mockReportsService.claimBounty(report.id)
    if (updated) {
      showToast(`Bounty for ${report.publicId} claimed (+150 pts target). Proceed with cleanup.`, "success")
      refreshData()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* --------------------------------------------------------------------- */}
      {/* B1. DASHBOARD HEADER */}
      {/* --------------------------------------------------------------------- */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-800">
                  <Building2 size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  CleanCity Operations
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Official Workspace
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Municipal response, field operations, and civic verification workspace
              </p>
            </div>

            {/* Officer details & Quick actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/80 border border-gray-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-civic-green-600 text-white font-bold flex items-center justify-center text-[10px]">
                  MR
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-gray-800">Mohan Raj (Officer)</p>
                  <p className="text-[10px] text-gray-500">Mysuru Municipal Corp · Wards 1–21</p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                title="Refresh Queue"
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <MapPin size={13} className="text-civic-green-600" />
                <span>Public Map</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* --------------------------------------------------------------------- */}
        {/* B2. STATS OVERVIEW CARDS */}
        {/* --------------------------------------------------------------------- */}
        <section aria-label="Operations Overview Metrics">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {/* Total Reports */}
            <button
              onClick={() => {
                setActiveFilter("ALL")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "ALL" && activeTab === "queue"
                  ? "bg-gray-900 text-white border-gray-900 ring-2 ring-gray-900/30 shadow-sm"
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "ALL" && activeTab === "queue" ? "text-gray-300" : "text-gray-500")}>
                Total
              </p>
              <p className="text-xl sm:text-2xl font-extrabold mt-0.5">{stats.total}</p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "ALL" && activeTab === "queue" ? "text-gray-300" : "text-gray-400")}>
                All complaints
              </p>
            </button>

            {/* Open */}
            <button
              onClick={() => {
                setActiveFilter("OPEN")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "OPEN" && activeTab === "queue"
                  ? "bg-red-600 text-white border-red-600 ring-2 ring-red-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-red-100 hover:border-red-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "OPEN" && activeTab === "queue" ? "text-red-100" : "text-red-600")}>
                Open
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeFilter === "OPEN" && activeTab === "queue" ? "text-white" : "text-red-600")}>
                {stats.open}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "OPEN" && activeTab === "queue" ? "text-red-100" : "text-gray-400")}>
                Unassigned
              </p>
            </button>

            {/* Claimed */}
            <button
              onClick={() => {
                setActiveFilter("CLAIMED")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "CLAIMED" && activeTab === "queue"
                  ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-blue-100 hover:border-blue-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "CLAIMED" && activeTab === "queue" ? "text-blue-100" : "text-blue-600")}>
                Claimed
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeFilter === "CLAIMED" && activeTab === "queue" ? "text-white" : "text-blue-600")}>
                {stats.claimed}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "CLAIMED" && activeTab === "queue" ? "text-blue-100" : "text-gray-400")}>
                Assigned
              </p>
            </button>

            {/* In Progress */}
            <button
              onClick={() => {
                setActiveFilter("CLEANUP_IN_PROGRESS")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "CLEANUP_IN_PROGRESS" && activeTab === "queue"
                  ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-indigo-100 hover:border-indigo-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "CLEANUP_IN_PROGRESS" && activeTab === "queue" ? "text-indigo-100" : "text-indigo-600")}>
                In Progress
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeFilter === "CLEANUP_IN_PROGRESS" && activeTab === "queue" ? "text-white" : "text-indigo-600")}>
                {stats.cleanupInProgress}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "CLEANUP_IN_PROGRESS" && activeTab === "queue" ? "text-indigo-100" : "text-gray-400")}>
                Active work
              </p>
            </button>

            {/* Pending Verification */}
            <button
              onClick={() => {
                setActiveFilter("PENDING_VERIFICATION")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "PENDING_VERIFICATION" && activeTab === "queue"
                  ? "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-purple-100 hover:border-purple-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "PENDING_VERIFICATION" && activeTab === "queue" ? "text-purple-100" : "text-purple-600")}>
                Review
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeFilter === "PENDING_VERIFICATION" && activeTab === "queue" ? "text-white" : "text-purple-600")}>
                {stats.pendingVerification}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "PENDING_VERIFICATION" && activeTab === "queue" ? "text-purple-100" : "text-gray-400")}>
                Proof uploaded
              </p>
            </button>

            {/* Verified */}
            <button
              onClick={() => {
                setActiveFilter("VERIFIED")
                setActiveTab("queue")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeFilter === "VERIFIED" && activeTab === "queue"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-emerald-100 hover:border-emerald-300"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeFilter === "VERIFIED" && activeTab === "queue" ? "text-emerald-100" : "text-emerald-700")}>
                Verified
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeFilter === "VERIFIED" && activeTab === "queue" ? "text-white" : "text-emerald-700")}>
                {stats.verified}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeFilter === "VERIFIED" && activeTab === "queue" ? "text-emerald-100" : "text-gray-400")}>
                Resolved
              </p>
            </button>

            {/* Overdue */}
            <button
              onClick={() => {
                setActiveFilter("ALL")
                setActiveTab("queue")
              }}
              className="p-3 rounded-xl border text-left bg-white text-gray-900 border-rose-200 hover:border-rose-400 transition-all hover:shadow-md cursor-pointer"
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Overdue</p>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5">{stats.overdue}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">SLA breach</p>
            </button>

            {/* Bounty */}
            <button
              onClick={() => {
                setActiveTab("bounties")
              }}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer",
                activeTab === "bounties"
                  ? "bg-orange-600 text-white border-orange-600 ring-2 ring-orange-600/30 shadow-sm"
                  : "bg-white text-gray-900 border-orange-200 hover:border-orange-400"
              )}
            >
              <p className={cn("text-[10px] uppercase font-bold tracking-wider", activeTab === "bounties" ? "text-orange-100" : "text-orange-600")}>
                Bounty
              </p>
              <p className={cn("text-xl sm:text-2xl font-extrabold mt-0.5", activeTab === "bounties" ? "text-white" : "text-orange-600")}>
                {stats.bounty}
              </p>
              <p className={cn("text-[10px] mt-0.5", activeTab === "bounties" ? "text-orange-100" : "text-gray-400")}>
                +150 pts
              </p>
            </button>
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* NAVIGATION TABS: REPORT QUEUE / BOUNTY QUEUE / OPERATIONS ACTIVITY */}
        {/* --------------------------------------------------------------------- */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3">
          <div className="flex space-x-2 sm:space-x-6">
            <button
              onClick={() => setActiveTab("queue")}
              className={cn(
                "py-2.5 px-3 border-b-2 font-bold text-sm transition-colors cursor-pointer inline-flex items-center gap-2",
                activeTab === "queue"
                  ? "border-civic-green-600 text-civic-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              )}
            >
              <Layers size={16} />
              <span>Report Queue</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {filteredQueue.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("bounties")}
              className={cn(
                "py-2.5 px-3 border-b-2 font-bold text-sm transition-colors cursor-pointer inline-flex items-center gap-2",
                activeTab === "bounties"
                  ? "border-orange-600 text-orange-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              )}
            >
              <Award size={16} />
              <span>Cleanup Bounties</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
                {bountyReports.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={cn(
                "py-2.5 px-3 border-b-2 font-bold text-sm transition-colors cursor-pointer inline-flex items-center gap-2",
                activeTab === "activity"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              )}
            >
              <Activity size={16} />
              <span>Operations Audit</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {operationsActivity.length}
              </span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* TAB 1: REPORT QUEUE */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            {/* Filter controls & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Report ID (e.g. MC-10042), Issue type, Ward, or Actor…"
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Ward Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-gray-500">Ward:</span>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-civic-green-500"
                  >
                    <option value="ALL">All 21 Wards</option>
                    {Array.from({ length: 21 }, (_, i) => (
                      <option key={i + 1} value={(i + 1).toString()}>
                        Ward {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Buttons Row */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Status:
                </span>
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "OPEN", label: "Open" },
                    { key: "CLAIMED", label: "Claimed" },
                    { key: "CLEANUP_IN_PROGRESS", label: "In Progress" },
                    { key: "PENDING_VERIFICATION", label: "Pending Verification" },
                    { key: "VERIFIED", label: "Verified" },
                    { key: "BOUNTY", label: "Bounties" },
                    { key: "REOPENED", label: "Reopened" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border",
                      activeFilter === f.key
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Table & Mobile Card View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              {filteredQueue.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No reports found</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try adjusting the search query, ward filter, or status selection.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-4">Report ID</th>
                          <th className="py-3 px-4">Issue & Evidence</th>
                          <th className="py-3 px-4">Ward / Location</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">SLA / Age</th>
                          <th className="py-3 px-4">Assigned Actor</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredQueue.map((report) => {
                          const thumbnail = report.media[0]?.thumbnailUrl || report.media[0]?.url
                          return (
                            <tr
                              key={report.id}
                              onClick={() => setActiveDetailReportId(report.id)}
                              className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                            >
                              {/* Report ID */}
                              <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                <span className="group-hover:text-civic-green-700 transition-colors">
                                  {report.publicId}
                                </span>
                              </td>

                              {/* Issue & Thumbnail */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  {thumbnail && (
                                    <img
                                      src={thumbnail}
                                      alt=""
                                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200"
                                    />
                                  )}
                                  <div className="min-w-0 max-w-[200px]">
                                    <p className="font-semibold text-gray-900 truncate">
                                      {report.category
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </p>
                                    <p className="text-[11px] text-gray-500 truncate">
                                      {report.description}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Ward */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-semibold text-gray-800">{report.wardName}</div>
                                <div className="text-[10px] text-gray-400">±{report.gpsAccuracy}m GPS</div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <StatusBadge status={report.status} size="sm" />
                              </td>

                              {/* SLA / Age */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="text-gray-700 font-medium">
                                  {new Date(report.capturedAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                {report.isOverdue ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                    <AlertTriangle size={10} /> SLA Breached
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">
                                    SLA: {report.slaHours}h target
                                  </span>
                                )}
                              </td>

                              {/* Assigned Actor */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {report.assignedActor ? (
                                  <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                                      {report.assignedActor.name[0]}
                                    </div>
                                    <span>{report.assignedActor.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                                )}
                              </td>

                              {/* Action Button */}
                              <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center gap-1.5">
                                  {report.status === "OPEN" && (
                                    <button
                                      type="button"
                                      onClick={() => handleClaim(report)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      Claim Report
                                    </button>
                                  )}

                                  {report.status === "CLAIMED" && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartCleanup(report)}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Wrench size={12} />
                                      Start Cleanup
                                    </button>
                                  )}

                                  {report.status === "CLEANUP_IN_PROGRESS" && (
                                    <button
                                      type="button"
                                      onClick={() => openCleanupModal(report)}
                                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Camera size={12} />
                                      Mark Completed
                                    </button>
                                  )}

                                  {report.status === "PENDING_VERIFICATION" && (
                                    <button
                                      type="button"
                                      onClick={() => openVerifyModal(report)}
                                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Sparkles size={12} />
                                      Verify Resolution
                                    </button>
                                  )}

                                  {report.status === "VERIFIED" && (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                      <CheckCircle2 size={12} />
                                      Verified
                                    </span>
                                  )}

                                  {report.status === "BOUNTY" && (
                                    <button
                                      type="button"
                                      onClick={() => handleClaimBounty(report)}
                                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Award size={12} />
                                      Claim Bounty
                                    </button>
                                  )}

                                  {report.status === "REOPENED" && (
                                    <button
                                      type="button"
                                      onClick={() => handleClaim(report)}
                                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <RotateCcw size={12} />
                                      Re-Claim
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setActiveDetailReportId(report.id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                    title="View Details"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View (< lg) */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {filteredQueue.map((report) => {
                      const thumbnail = report.media[0]?.thumbnailUrl || report.media[0]?.url
                      return (
                        <div
                          key={report.id}
                          onClick={() => setActiveDetailReportId(report.id)}
                          className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-900">
                                {report.publicId}
                              </span>
                              <StatusBadge status={report.status} size="sm" />
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {new Date(report.capturedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {thumbnail && (
                              <img
                                src={thumbnail}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {report.category
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{report.wardName}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs" onClick={(e) => e.stopPropagation()}>
                            <span className="text-gray-500">
                              Actor: {report.assignedActor?.name ?? "Unassigned"}
                            </span>

                            {/* Mobile Actions */}
                            <div>
                              {report.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() => handleClaim(report)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                                >
                                  Claim
                                </button>
                              )}
                              {report.status === "CLAIMED" && (
                                <button
                                  type="button"
                                  onClick={() => handleStartCleanup(report)}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                                >
                                  Start Cleanup
                                </button>
                              )}
                              {report.status === "CLEANUP_IN_PROGRESS" && (
                                <button
                                  type="button"
                                  onClick={() => openCleanupModal(report)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
                                >
                                  Upload Proof
                                </button>
                              )}
                              {report.status === "PENDING_VERIFICATION" && (
                                <button
                                  type="button"
                                  onClick={() => openVerifyModal(report)}
                                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
                                >
                                  Verify
                                </button>
                              )}
                              {report.status === "VERIFIED" && (
                                <span className="text-emerald-700 font-bold text-xs">Verified ✓</span>
                              )}
                              {report.status === "BOUNTY" && (
                                <button
                                  type="button"
                                  onClick={() => handleClaimBounty(report)}
                                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs"
                                >
                                  Claim Bounty
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TAB 2: B8. CLEANUP BOUNTIES QUEUE */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "bounties" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Award size={24} />
                <h2 className="text-xl font-black tracking-tight">Active Cleanup Bounties</h2>
              </div>
              <p className="text-orange-100 text-sm max-w-2xl">
                High-priority or SLA-breached tasks funded by Mysuru Municipal Corporation and CSR partners.
                Officials or certified NGOs earn +150 bonus verification points upon satisfactory resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bountyReports.map((report) => {
                const thumbnail = report.media[0]?.url || "https://picsum.photos/seed/bounty/400/300"
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl border border-orange-200/80 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs text-gray-500">{report.publicId}</span>
                        <h3 className="font-bold text-base text-gray-900 mt-0.5">
                          {report.category
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black border border-orange-300">
                        +150 POINTS
                      </span>
                    </div>

                    <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        <span className="font-semibold text-gray-800">{report.wardName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span>Logged {new Date(report.capturedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 line-clamp-2 pt-1">{report.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <StatusBadge status={report.status} size="sm" />
                      {report.status === "CLAIMED" || report.status === "CLEANUP_IN_PROGRESS" ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                          Assigned to {report.assignedActor?.name ?? "Officer"}
                        </span>
                      ) : report.status === "VERIFIED" ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Completed & Awarded ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaimBounty(report)}
                          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          CLAIM BOUNTY
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TAB 3: B9. OPERATIONS AUDIT & ACTIVITY */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Operations Audit Trail</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Immutable municipal audit log of claims, cleanups, after-evidence uploads, and verifications
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Live Stream
              </span>
            </div>

            <div className="space-y-3 max-w-3xl">
              {operationsActivity.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setActiveDetailReportId(event.reportId)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-700 mt-0.5">
                    {event.type.includes("verified") ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : event.type.includes("cleanup") ? (
                      <Wrench size={16} className="text-indigo-600" />
                    ) : event.type.includes("claimed") ? (
                      <User size={16} className="text-blue-600" />
                    ) : (
                      <Activity size={16} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-900">{event.description}</p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span className="font-mono font-bold text-civic-green-700">{event.publicId}</span>
                      <span>•</span>
                      <span>{event.wardName}</span>
                      {event.actor && (
                        <>
                          <span>•</span>
                          <span className="text-gray-700 font-medium">By {event.actor}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* B10. REPORT DETAIL SLIDE-OVER / MODAL */}
      {/* --------------------------------------------------------------------- */}
      {currentDetailReport && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs fade-in">
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col slide-up"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/80 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {currentDetailReport.publicId}
                  </span>
                  <StatusBadge status={currentDetailReport.status} size="sm" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mt-1">
                  {currentDetailReport.category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailReportId(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 flex-1">
              {/* Contextual Action Bar */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Available Operations Action
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentDetailReport.status === "OPEN" && (
                    <button
                      type="button"
                      onClick={() => handleClaim(currentDetailReport)}
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      Claim This Report (Assign Mohan Raj)
                    </button>
                  )}

                  {currentDetailReport.status === "CLAIMED" && (
                    <button
                      type="button"
                      onClick={() => handleStartCleanup(currentDetailReport)}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Wrench size={14} />
                      Start Cleanup On Site
                    </button>
                  )}

                  {currentDetailReport.status === "CLEANUP_IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => openCleanupModal(currentDetailReport)}
                      className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Camera size={14} />
                      Mark Cleanup Completed (Upload Evidence)
                    </button>
                  )}

                  {currentDetailReport.status === "PENDING_VERIFICATION" && (
                    <button
                      type="button"
                      onClick={() => openVerifyModal(currentDetailReport)}
                      className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      Inspect & Verify Resolution
                    </button>
                  )}

                  {currentDetailReport.status === "VERIFIED" && (
                    <div className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center">
                      ✓ Cleanup Verified and Closed
                    </div>
                  )}

                  {currentDetailReport.status === "BOUNTY" && (
                    <button
                      type="button"
                      onClick={() => handleClaimBounty(currentDetailReport)}
                      className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Award size={14} />
                      Claim Bounty (+150 Points)
                    </button>
                  )}
                </div>
              </div>

              {/* Location & Ward */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Location Information
                </span>
                <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ward:</span>
                    <span className="font-semibold text-gray-900">{currentDetailReport.wardName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coordinates:</span>
                    <span className="font-mono text-gray-700">
                      {currentDetailReport.latitude.toFixed(5)}, {currentDetailReport.longitude.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GPS Accuracy:</span>
                    <span className="text-gray-700">±{currentDetailReport.gpsAccuracy} meters</span>
                  </div>
                </div>
              </div>

              {/* SLA & Officer */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Assignment & SLA Status
                </span>
                <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Actor:</span>
                    <span className="font-semibold text-gray-900">
                      {currentDetailReport.assignedActor?.name ?? "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SLA Standard:</span>
                    <span className="font-semibold text-gray-700">{currentDetailReport.slaHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SLA Condition:</span>
                    <span
                      className={cn(
                        "font-bold",
                        currentDetailReport.isOverdue ? "text-rose-600" : "text-emerald-600"
                      )}
                    >
                      {currentDetailReport.isOverdue ? "BREACHED" : "WITHIN SLA"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Before Evidence Gallery */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Initial Citizen Evidence ({currentDetailReport.media.length})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {currentDetailReport.media.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video relative group"
                    >
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                      {m.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-1 text-[10px] truncate">
                          {m.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* After Evidence Gallery (if present) */}
              {currentDetailReport.afterMedia && currentDetailReport.afterMedia.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Cleanup Proof Evidence ({currentDetailReport.afterMedia.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {currentDetailReport.afterMedia.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50 aspect-video relative group"
                      >
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        {m.caption && (
                          <div className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-white p-1 text-[10px] truncate">
                            {m.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Timeline & Audit Trail
                </span>
                <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-3">
                  {currentDetailReport.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="flex gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-civic-green-600 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{event.description}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                          {event.actor && ` · ${event.actor}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public report link */}
              <div className="pt-2">
                <Link
                  href={`/report/${currentDetailReport.publicId}`}
                  target="_blank"
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Citizen Public View</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* B6. CLEANUP COMPLETION MODAL WITH AFTER-EVIDENCE */}
      {/* --------------------------------------------------------------------- */}
      {cleanupModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Mark Cleanup Completed</h3>
                <p className="text-xs text-gray-500">
                  Upload photographic evidence of the resolved site for {cleanupModalReport.publicId}
                </p>
              </div>
              <button
                onClick={() => setCleanupModalReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteCleanupSubmit} className="space-y-4">
              {/* Photo preview / selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  After-Cleanup Photographic Proof:
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {SAMPLE_AFTER_PHOTOS.map((sample, idx) => {
                    const isSelected = afterPhotos.some((p) => p.url === sample.url)
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setAfterPhotos(afterPhotos.filter((p) => p.url !== sample.url))
                          } else {
                            setAfterPhotos([...afterPhotos, sample])
                          }
                        }}
                        className={cn(
                          "aspect-video rounded-lg overflow-hidden border-2 relative cursor-pointer group transition-all",
                          isSelected ? "border-emerald-600 ring-2 ring-emerald-600/30" : "border-gray-200 opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={sample.url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="text-[11px] text-gray-400 italic">
                  Tap to include or remove photos from the after-evidence payload.
                </p>
              </div>

              {/* Worker Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Field Sanitation Remarks:
                </label>
                <textarea
                  rows={2}
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  placeholder="Describe clearance details, sanitized area, disposal destination..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-civic-green-500 focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCleanupModalReport(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCleanup || afterPhotos.length === 0}
                  className="flex-1 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  {isSubmittingCleanup ? "Submitting…" : "Submit For Verification →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* B7. VERIFICATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {verifyModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900">Verify Resolution</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Compare initial citizen complaint evidence against official cleanup proof for {verifyModalReport.publicId}
                </p>
              </div>
              <button
                onClick={() => setVerifyModalReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {/* Evidence Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                    BEFORE (Citizen Report)
                  </span>
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={verifyModalReport.media[0]?.url || "https://picsum.photos/seed/before/400/300"}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                    AFTER (Field Cleanup Proof)
                  </span>
                  <div className="aspect-video rounded-lg overflow-hidden border border-emerald-300 bg-white">
                    <img
                      src={
                        verifyModalReport.afterMedia?.[0]?.url ||
                        SAMPLE_AFTER_PHOTOS[0].url
                      }
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Simulated AI Confidence Banner */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 flex items-start gap-2.5">
                <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold">AI Verification Match: 94% Confidence</p>
                  <p className="text-purple-700 text-[11px]">
                    Garbage accumulation detected in initial report is 100% absent in after-image. GPS watermark matches coordinates.
                  </p>
                </div>
              </div>

              {/* Simulated Outcomes Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Inspector Resolution Decision:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyOutcome("VERIFIED")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                      verifyOutcome === "VERIFIED"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <p className="text-xs font-bold">✓ VERIFIED (Approve)</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Closes issue & credits points</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyOutcome("REJECTED")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                      verifyOutcome === "REJECTED"
                        ? "border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <p className="text-xs font-bold">✕ REJECTED (Rework)</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Reopens ticket for field crew</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyOutcome("UNCERTAIN")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                      verifyOutcome === "UNCERTAIN"
                        ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <p className="text-xs font-bold">? UNCERTAIN</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Requires clearer photos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyOutcome("MANUAL_REVIEW_REQUIRED")}
                    className={cn(
                      "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                      verifyOutcome === "MANUAL_REVIEW_REQUIRED"
                        ? "border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <p className="text-xs font-bold">⚑ SUPERVISORY CHECK</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Escalate to Chief Officer</p>
                  </button>
                </div>
              </div>

              {/* Inspector Verification Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Verification Audit Log Note:
                </label>
                <input
                  type="text"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Modal action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalReport(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVerify}
                  className="flex-1 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmittingVerify ? "Saving…" : "Confirm Decision →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
