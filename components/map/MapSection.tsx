"use client"
import React, { useRef, useCallback, useEffect, useState } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { ReportMarker, MapLegend, MapFilters, LiveActivity, ReportPreviewCard } from "@/components/map/MapComponents"
import { type Report, type FilterMode } from "@/lib/types"
import { Navigation, Compass, Layers, Activity, Map as MapIcon, X } from "lucide-react"
import Link from "next/link"

interface ActivityEvent {
  id: string
  type: string
  description: string
  wardNumber: number
  timestamp: string
  icon: string
  color: string
}

interface MapSectionProps {
  reports: Report[]
  selectedReport: Report | null
  filterMode: FilterMode
  onFilterChange: (mode: FilterMode) => void
  filterCounts?: Partial<Record<FilterMode, number>>
  activityEvents: ActivityEvent[]
  onMarkerClick: (report: Report) => void
  onMapClick: () => void
  onReportDeselect: () => void
  onMapReady: () => void
  mapReady: boolean
}

const MYSRU_CENTER: [number, number] = [12.29584, 76.63942]

// Controller inside MapContainer to invalidate sizes on mount and window resize
function MapController({
  onMapClick,
  onMapReady,
}: {
  onMapClick: () => void
  onMapReady: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    onMapReady()

    // Multi-stage size invalidation ensures the tile layer is perfectly sized
    // regardless of parent CSS transitions or container mounting timings
    map.invalidateSize()
    const t1 = setTimeout(() => map.invalidateSize(), 150)
    const t2 = setTimeout(() => map.invalidateSize(), 500)
    const t3 = setTimeout(() => map.invalidateSize(), 1200)

    const handleResize = () => {
      map.invalidateSize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener("resize", handleResize)
    }
  }, [map, onMapReady])

  useEffect(() => {
    if (!map) return
    const handleClick = (e: L.LeafletMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement | null
      if (
        target?.closest(".leaflet-marker-icon") ||
        target?.closest(".cc-marker") ||
        target?.closest(".leaflet-popup")
      ) {
        return
      }
      onMapClick()
    }
    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [map, onMapClick])

  return null
}

export default function MapSection({
  reports,
  selectedReport,
  filterMode,
  onFilterChange,
  filterCounts,
  activityEvents,
  onMarkerClick,
  onMapClick,
  onReportDeselect,
  onMapReady,
  mapReady,
}: MapSectionProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mobileTab, setMobileTab] = useState<"map" | "activity" | "filters">("map")
  const [legendOpen, setLegendOpen] = useState(true)

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(MYSRU_CENTER, 13, { duration: 1.2 })
    }
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 1. Map container fills full canvas */}
      <div className="absolute inset-0 w-full h-full">
        <MapContainer
          center={MYSRU_CENTER}
          zoom={13}
          minZoom={10}
          maxZoom={18}
          className="w-full h-full"
          ref={mapRef}
          whenReady={onMapReady}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapController onMapClick={onMapClick} onMapReady={onMapReady} />
          {mapReady && (
            <>
              {reports.map((report) => (
                <ReportMarker
                  key={report.id}
                  report={report}
                  isSelected={report.id === selectedReport?.id}
                  onClick={onMarkerClick}
                />
              ))}
            </>
          )}
        </MapContainer>
      </div>

      {/* 2. Top-Left Filter Bar (Desktop / Tablet) */}
      <div className="hidden md:block absolute top-16 left-4 z-20 max-w-2xl">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-lg p-3">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Filter Reports
              </span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                {reports.length} visible
              </span>
            </div>
            <button
              onClick={handleRecenter}
              type="button"
              className="text-xs text-civic-green-700 hover:text-civic-green-800 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Recenter map on Mysuru center"
            >
              <Navigation size={12} />
              Recenter Map
            </button>
          </div>
          <MapFilters
            mode={filterMode}
            onModeChange={onFilterChange}
            counts={filterCounts}
          />
        </div>
      </div>

      {/* 3. Right Side Panel (Desktop): Recent Activity OR Selected Report Details */}
      <div className="hidden md:flex absolute top-16 right-4 z-20 w-80 sm:w-88 max-h-[calc(100vh-6rem)] flex-col pointer-events-auto">
        {selectedReport ? (
          <div className="fade-in bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-xl p-4">
            <ReportPreviewCard
              report={selectedReport}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={onReportDeselect}
                type="button"
                className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                Back to Feed
              </button>
              <Link
                href={`/report/${selectedReport.publicId}`}
                className="flex-1 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-semibold text-center transition-colors shadow-sm"
              >
                View Report →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-xl p-4 flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>
            <LiveActivity
              events={activityEvents}
              showLiveIndicator={false}
              className="flex-1 overflow-y-auto pr-1"
            />
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href="/report"
                className="block w-full py-2.5 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold text-center transition-colors shadow-sm active:scale-[0.98]"
              >
                + Report an Issue
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. Map Legend (Bottom-Left Desktop) */}
      <div className="hidden sm:block absolute bottom-4 left-4 z-20 max-w-xs pointer-events-auto">
        {legendOpen ? (
          <div className="relative">
            <MapLegend />
            <button
              onClick={() => setLegendOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-md text-xs cursor-pointer"
              title="Minimize legend"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLegendOpen(true)}
            className="bg-white/95 backdrop-blur border border-gray-200 shadow-md px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers size={13} className="text-civic-green-600" />
            Show Legend
          </button>
        )}
      </div>

      {/* 5. Mobile Controls & Drawers (< md) */}
      <div className="md:hidden">
        {/* Mobile top floating bar for filters & recenter */}
        <div className="absolute top-14 left-2 right-2 z-20 flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg p-1 border border-gray-200 shadow-sm inline-flex">
              <button
                onClick={() => setMobileTab(mobileTab === "filters" ? "map" : "filters")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  mobileTab === "filters"
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Filter ({filterMode})
              </button>
              <button
                onClick={() => setMobileTab(mobileTab === "activity" ? "map" : "activity")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                  mobileTab === "activity"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Activity size={12} />
                Activity ({activityEvents.length})
              </button>
            </div>
          </div>
          <button
            onClick={handleRecenter}
            className="bg-white/90 backdrop-blur p-2 rounded-lg border border-gray-200 shadow-sm text-civic-green-700 shrink-0"
            title="Recenter"
          >
            <Navigation size={14} />
          </button>
        </div>

        {/* Mobile Filters Dropdown */}
        {mobileTab === "filters" && (
          <div className="absolute top-26 left-2 right-2 z-30 bg-white rounded-xl border border-gray-200 shadow-2xl p-3 fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">Filter By Status</span>
              <button
                onClick={() => setMobileTab("map")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            </div>
            <MapFilters
              mode={filterMode}
              onModeChange={(m) => {
                onFilterChange(m)
                setMobileTab("map")
              }}
              counts={filterCounts}
            />
          </div>
        )}

        {/* Mobile Activity Drawer */}
        {mobileTab === "activity" && (
          <div className="absolute top-26 left-2 right-2 max-h-[60vh] z-30 bg-white rounded-xl border border-gray-200 shadow-2xl p-4 flex flex-col fade-in">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Live Mysuru Activity</span>
              <button
                onClick={() => setMobileTab("map")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
            <LiveActivity
              events={activityEvents}
              showLiveIndicator={false}
              className="flex-1 overflow-y-auto"
            />
          </div>
        )}

        {/* Mobile Selected Report Bottom Sheet (Resting cleanly above BottomNav) */}
        {selectedReport && mobileTab === "map" && (
          <div className="fixed bottom-16 sm:bottom-20 left-2 right-2 max-w-md mx-auto z-40 slide-up pointer-events-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />
                <button
                  onClick={onReportDeselect}
                  className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  aria-label="Close sheet"
                >
                  <X size={16} />
                </button>
              </div>

              <ReportPreviewCard
                report={selectedReport}
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onReportDeselect}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all text-center"
                >
                  Close
                </button>
                <Link
                  href={`/report/${selectedReport.publicId}`}
                  className="flex-1 py-2.5 rounded-xl bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span>View Report</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Loading state overlay while map initializes */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-xs z-10 pointer-events-none">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-xs w-full mx-4 text-center">
            <div className="w-12 h-12 rounded-full bg-civic-green-100 flex items-center justify-center mx-auto mb-3">
              <Navigation size={24} className="text-civic-green-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Loading Mysuru Map</h3>
            <p className="text-xs text-gray-500 mb-3">Initializing map tiles and report coordinates…</p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-24 rounded-full bg-civic-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
