"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Heart,
  Coins,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  Award,
  Users,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { mockReportsService, getCurrentUser } from "@/lib/mock-data"
import { type Report, type ReportMedia, STATUS_CONFIG } from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useToast } from "@/components/shared/Toast"
import { useRole } from "@/lib/role-context"
import { cn } from "@/lib/utils"

export default function BountiesPage() {
  const { showToast } = useToast()
  const { role } = useRole()
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState<"available" | "my_bounties" | "completed">("available")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Cleanup evidence modal
  const [cleanupReport, setCleanupReport] = useState<Report | null>(null)
  const [cleanupNotes, setCleanupNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshData = useCallback(() => {
    setReports(mockReportsService.getReports())
  }, [])

  useEffect(() => {
    refreshData()
    window.addEventListener("focus", refreshData)
    return () => window.removeEventListener("focus", refreshData)
  }, [refreshData])

  // All eligible bounties (status === "BOUNTY" or overdue with bountyAmount)
  const bountyReports = useMemo(() => {
    return reports.filter((r) => r.status === "BOUNTY" || (r.isOverdue && r.bountyAmount))
  }, [reports])

  // Claimed by NGO
  const myClaimedBounties = useMemo(() => {
    return reports.filter(
      (r) =>
        (r.status === "CLAIMED" || r.status === "CLEANUP_IN_PROGRESS") &&
        r.assignedActor?.organization?.toLowerCase().includes("guardian")
    )
  }, [reports])

  // Completed NGO cleanups
  const completedBounties = useMemo(() => {
    return reports.filter(
      (r) =>
        (r.status === "PENDING_VERIFICATION" || r.status === "VERIFIED") &&
        r.assignedActor?.organization?.toLowerCase().includes("guardian")
    )
  }, [reports])

  // Claim bounty action
  const handleClaimBounty = (report: Report) => {
    const updated = mockReportsService.claimBounty(report.id)
    if (updated) {
      // Set assigned actor as NGO
      updated.assignedActor = {
        id: "ngo1",
        name: "Mysuru Green Guardians",
        role: "ngo",
        organization: "Mysuru Green Guardians (Verified NGO)",
      }
      showToast(`Bounty for ${report.publicId} claimed! +${report.bountyAmount || 150} points upon completion.`, "success")
      refreshData()
    }
  }

  // Start cleanup action
  const handleStartCleanup = (report: Report) => {
    const updated = mockReportsService.startCleanup(report.id)
    if (updated) {
      showToast(`Cleanup started on ${report.publicId}. Community volunteers deployed!`, "success")
      refreshData()
    }
  }

  // Complete cleanup modal submit
  const handleCompleteCleanupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cleanupReport) return
    setIsSubmitting(true)

    const afterMedia: ReportMedia[] = [
      {
        id: `${cleanupReport.id}-ngo-after-1`,
        type: "image",
        url: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=640&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=160&q=80",
        capturedAt: new Date().toISOString(),
        caption: cleanupNotes || "Community volunteer team cleared and sanitized the area.",
      },
    ]

    const updated = mockReportsService.completeCleanup(cleanupReport.id, afterMedia, cleanupNotes)
    setIsSubmitting(false)
    setCleanupReport(null)
    setCleanupNotes("")

    if (updated) {
      showToast(`Cleanup completed for ${cleanupReport.publicId}! Submitted for verification.`, "success")
      refreshData()
    }
  }

  const displayedList =
    activeTab === "available"
      ? bountyReports
      : activeTab === "my_bounties"
      ? myClaimedBounties
      : completedBounties

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* NGO Header */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Heart size={22} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      COMMUNITY CLEANUP WORKSPACE
                    </h1>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                      VERIFIED NGO / COMMUNITY
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Mysuru Green Guardians · Civic Action & Cleanup Bounties Initiative
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats & map link */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-xs font-bold text-purple-700 block">Active Bounties</span>
                <span className="text-lg font-black text-purple-900">{bountyReports.length}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-civic-green-50 border border-civic-green-200 text-center">
                <span className="text-xs font-bold text-civic-green-700 block">Cleanups Done</span>
                <span className="text-lg font-black text-civic-green-900">{completedBounties.length}</span>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
              >
                <MapPin size={14} className="text-civic-green-600" />
                <span>Civic Map</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-6">
          <button
            onClick={() => setActiveTab("available")}
            className={cn(
              "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
              activeTab === "available"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            <Coins size={16} />
            <span>Available Bounties ({bountyReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("my_bounties")}
            className={cn(
              "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
              activeTab === "my_bounties"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            <Wrench size={16} />
            <span>Claimed by Us ({myClaimedBounties.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
              activeTab === "completed"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            <CheckCircle2 size={16} />
            <span>Completed Cleanups ({completedBounties.length})</span>
          </button>
        </div>

        {/* Bounties Grid */}
        {displayedList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Coins size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">No bounties in this tab</h3>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === "available"
                ? "No unassigned cleanup bounties at this moment. Check back soon!"
                : activeTab === "my_bounties"
                ? "Your organization has not claimed any active bounties yet."
                : "No completed cleanups to display yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedList.map((report) => {
              const bountyPoints = report.bountyAmount || 150
              return (
                <div
                  key={report.id}
                  className="rounded-2xl border-2 border-purple-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-600">{report.publicId}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-orange-100 text-status-orange-700 border border-status-orange-300 text-xs font-black">
                        <Coins size={13} /> +{bountyPoints} PTS
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 capitalize">
                        {report.category.replace(/_/g, " ")}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-purple-600" />
                        <span className="font-medium text-gray-800">{report.wardName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      {report.isOverdue && (
                        <div className="flex items-center gap-1 text-status-red-600 font-semibold">
                          <AlertTriangle size={12} />
                          <span>SLA Turnaround Breached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/report/${report.publicId}`}
                      className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Public View</span>
                      <ChevronRight size={14} />
                    </Link>

                    {activeTab === "available" && (
                      <button
                        onClick={() => handleClaimBounty(report)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Claim Bounty
                      </button>
                    )}

                    {activeTab === "my_bounties" && (
                      <div className="flex gap-2">
                        {report.status === "CLAIMED" && (
                          <button
                            onClick={() => handleStartCleanup(report)}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all"
                          >
                            Start Cleanup
                          </button>
                        )}
                        <button
                          onClick={() => setCleanupReport(report)}
                          className="px-3 py-1.5 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold transition-all"
                        >
                          Upload Proof
                        </button>
                      </div>
                    )}

                    {activeTab === "completed" && (
                      <span className="text-xs font-bold text-civic-green-600 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        {report.status === "VERIFIED" ? "Verified (+Points Credited)" : "Under Review"}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Complete Cleanup Evidence Modal */}
      {cleanupReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Submit Cleanup Proof — {cleanupReport.publicId}
              </h3>
              <button
                onClick={() => setCleanupReport(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteCleanupSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Community Action Notes
                </label>
                <textarea
                  value={cleanupNotes}
                  onChange={(e) => setCleanupNotes(e.target.value)}
                  placeholder="Describe the cleanup: volunteers involved, waste bags collected, sanitization done..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden min-h-[90px]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-800">
                <p className="font-bold">After Evidence Attached:</p>
                <p className="text-[11px] text-purple-600 mt-0.5">
                  Verified volunteer team photo with cleared site watermark.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCleanupReport(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Submit Proof & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
