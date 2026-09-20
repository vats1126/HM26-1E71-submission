"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { getLiveStats, mockReportsService, mockActivityService } from "@/lib/mock-data"
import { type Report, type FilterMode } from "@/lib/types"
import { MapPin, Plus } from "lucide-react"
import Link from "next/link"

// Dynamically load the map section so Leaflet only initializes on the client
const MapSection = dynamic(
  () => import("@/components/map/MapSection"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-civic-green-600 border-t-transparent animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Map Canvas…</p>
        </div>
      </div>
    ),
  }
)

function StatusCount({ status, count }: { status: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-gray-500">{status}</span>
      <span className="text-sm sm:text-base font-bold text-gray-900">{count.toLocaleString()}</span>
    </div>
  )
}

export default function HomePage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [allReports, setAllReports] = useState<Report[]>(() => mockReportsService.getReports())
  const [stats, setStats] = useState(() => getLiveStats())
  const [activityEvents, setActivityEvents] = useState(() => mockActivityService.getLiveActivity())
  const [mapReady, setMapReady] = useState(false)

  // Sync reports with Supabase backend and local storage on mount and when window regains focus
  useEffect(() => {
    const refreshData = async () => {
      let reports = mockReportsService.getReports()
      try {
        const res = await fetch("/api/reports")
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.reports) && json.reports.length > 0) {
            const liveMap = new Map<string, Report>()
            json.reports.forEach((r: Report) => {
              liveMap.set(r.id, r)
              if (r.publicId) liveMap.set(r.publicId, r)
            })
            const nonDuplicateMock = reports.filter((r) => !liveMap.has(r.id) && !liveMap.has(r.publicId))
            reports = [...json.reports, ...nonDuplicateMock]
          }
        }
      } catch {
        // Fallback cleanly to local storage / mock reports
      }
      setAllReports(reports)
      setStats(getLiveStats(reports))
    }
    refreshData()
    window.addEventListener("focus", refreshData)
    return () => window.removeEventListener("focus", refreshData)
  }, [])

  const filteredReports = useMemo(() => {
    switch (filterMode) {
      case "open":
        return allReports.filter((r) => r.status === "OPEN" || r.status === "REOPENED")
      case "in_progress":
        return allReports.filter(
          (r) => r.status === "CLAIMED" || r.status === "CLEANUP_IN_PROGRESS"
        )
      case "pending_verification":
        return allReports.filter((r) => r.status === "PENDING_VERIFICATION")
      case "verified":
        return allReports.filter((r) => r.status === "VERIFIED")
      case "bounty":
        return allReports.filter((r) => r.status === "BOUNTY" || (r.isOverdue && r.bountyAmount))
      case "flagged":
        return allReports.filter((r) => r.status === "FLAGGED")
      default:
        return allReports
    }
  }, [filterMode, allReports])

  const filterCounts = useMemo(() => {
    return {
      all: allReports.length,
      open: allReports.filter((r) => r.status === "OPEN" || r.status === "REOPENED").length,
      in_progress: allReports.filter(
        (r) => r.status === "CLAIMED" || r.status === "CLEANUP_IN_PROGRESS"
      ).length,
      pending_verification: allReports.filter((r) => r.status === "PENDING_VERIFICATION").length,
      verified: allReports.filter((r) => r.status === "VERIFIED").length,
      bounty: allReports.filter((r) => r.status === "BOUNTY" || (r.isOverdue && r.bountyAmount)).length,
      flagged: allReports.filter((r) => r.status === "FLAGGED").length,
    }
  }, [allReports])

  // Simulated live activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = mockActivityService.generateEvent()
      setActivityEvents((prev) => {
        const updated = [newEvent, ...prev].slice(0, 16)
        return updated
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report)
  }, [])

  const handleMapClick = useCallback(() => {
    setSelectedReport(null)
  }, [])

  const handleFilterChange = useCallback((mode: FilterMode) => {
    setFilterMode(mode)
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 flex flex-col">
      {/* Stats overlay — top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-2">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200/80 shadow-sm px-2.5 py-1.5">
                <MapPin size={16} className="text-civic-green-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">Mysuru</span>
                <span className="text-[10px] text-gray-500 font-medium hidden xs:inline">
                  Civic Map
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200/80 shadow-sm px-3 py-1.5">
                <StatusCount status="Total" count={stats.totalReports} />
                <div className="w-px h-4 bg-gray-200" />
                <StatusCount status="Open" count={stats.open} />
                <div className="w-px h-4 bg-gray-200" />
                <StatusCount status="Resolved" count={stats.resolved} />
                <div className="w-px h-4 bg-gray-200" />
                <StatusCount status="Overdue" count={stats.overdue} />
              </div>
            </div>
            <Link
              href="/report"
              className="pointer-events-auto inline-flex items-center gap-1.5 bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Map section — loaded client-only */}
      <div className="relative flex-1 w-full h-full">
        <MapSection
          reports={filteredReports}
          selectedReport={selectedReport}
          filterMode={filterMode}
          onFilterChange={handleFilterChange}
          filterCounts={filterCounts}
          activityEvents={activityEvents}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          onReportDeselect={() => setSelectedReport(null)}
          onMapReady={() => setMapReady(true)}
          mapReady={mapReady}
        />
      </div>

      {/* Mobile Fixed Center-Bottom CTA: + REPORT ISSUE */}
      {!selectedReport && (
        <div className="md:hidden fixed bottom-18 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 bg-civic-green-600 hover:bg-civic-green-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl shadow-civic-green-700/50 border-2 border-white/90 backdrop-blur-md tracking-wider transition-all"
            aria-label="Report civic issue"
          >
            <Plus size={18} className="stroke-[3]" />
            <span>+ REPORT ISSUE</span>
          </Link>
        </div>
      )}
    </div>
  )
}
