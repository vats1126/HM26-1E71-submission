import { useState, useCallback, useMemo } from "react"
import { Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import { type Report, type ReportStatus, type FilterMode } from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { AlertTriangle, Check, User, ShieldCheck, Award, RotateCcw, Wrench, MessageSquare, Clock, Navigation, MapPin } from "lucide-react"

// ---------- Icon mapping for live activity ----------

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  AlertTriangle: <AlertTriangle size={14} />,
  UserCheck: <User size={14} />,
  CheckCircle: <Check size={14} />,
  ShieldCheck: <ShieldCheck size={14} />,
  Award: <Award size={14} />,
  MessageSquare: <MessageSquare size={14} />,
  Wrench: <Wrench size={14} />,
  RotateCcw: <RotateCcw size={14} />,
  Navigation: <Navigation size={14} />,
}

// ---------- Marker rendering ----------

function markerColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    OPEN: "#ef4444",
    ACKNOWLEDGED: "#eab308",
    CLAIMED: "#3b82f6",
    CLEANUP_IN_PROGRESS: "#3b82f6",
    PENDING_VERIFICATION: "#a855f7",
    VERIFIED: "#22c55e",
    BOUNTY: "#f97316",
    FLAGGED: "#f59e0b",
    REOPENED: "#ef4444",
  }
  return colors[status] ?? "#6b7280"
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

let styleInjected = false

function ensureStyles() {
  if (typeof window === "undefined" || styleInjected) return
  styleInjected = true
  const el = document.createElement("style")
  el.textContent = `
    .cc-marker { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.25); cursor: pointer; transition: transform 0.15s; }
    .cc-marker:hover { transform: scale(1.1); }
    .cc-marker-new { animation: cc-pulse 1.5s ease-out; }
    @keyframes cc-pulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 70% { box-shadow: 0 0 0 12px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
    .cc-popup .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); padding: 0; }
    .cc-popup .leaflet-popup-content { margin: 10px 12px; }
    .cc-popup .leaflet-popup-tip { box-shadow: none; }
    .leaflet-control-zoom a { border-radius: 8px !important; }
  `
  document.head.appendChild(el)
}

if (typeof window !== "undefined") ensureStyles()

function makeMarkerIcon(status: ReportStatus, isNew?: boolean): L.DivIcon {
  const color = markerColor(status)
  const size = isNew ? 14 : 32
  const innerSize = isNew ? 4 : 10
  return L.divIcon({
    className: `cc-marker${isNew ? " cc-marker-new" : ""}`,
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; box-shadow: 0 2px 8px ${hexToRgba(color, 0.35)}; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: ${innerSize}px; height: ${innerSize}px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  })
}

function makeAccuracyIcon(accuracy: number): L.CircleOptions {
  return {
    color: "#3b82f6",
    fillColor: "#3b82f6",
    fillOpacity: 0.06,
    weight: 1,
    opacity: 0.25,
    dashArray: "4 4",
    radius: accuracy,
  }
}

// ---------- Report marker ----------

interface ReportMarkerProps {
  report: Report
  isSelected?: boolean
  isNew?: boolean
  onClick?: (report: Report) => void
}

export function ReportMarker({ report, isSelected, isNew, onClick }: ReportMarkerProps) {
  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={makeMarkerIcon(report.status, isNew)}
      eventHandlers={{ click: () => onClick?.(report) }}
      zIndexOffset={isSelected ? 2000 : 0}
    >
      {isSelected && (
        <Popup className="cc-popup" offset={[0, -18]}>
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1.5">{report.publicId}</p>
            <StatusBadge status={report.status} size="sm" />
            <p className="text-sm font-medium text-gray-900 mt-1.5">
              {report.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{report.wardName}</p>
          </div>
        </Popup>
      )}
    </Marker>
  )
}

// ---------- Accuracy circle ----------

interface AccuracyCircleProps {
  lat: number
  lng: number
  accuracy: number
  pulse?: boolean
}

export function AccuracyCircle({ lat, lng, accuracy, pulse }: AccuracyCircleProps) {
  return (
    <Circle
      center={[lat, lng]}
      pathOptions={{
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.05,
        weight: 1,
        opacity: 0.2,
        dashArray: "4 4",
      }}
      radius={accuracy}
    />
  )
}

// ---------- Current location marker ----------

interface CurrentLocationProps {
  lat: number
  lng: number
  accuracy?: number
}

export function CurrentLocationMarker({ lat, lng, accuracy }: CurrentLocationProps) {
  return (
    <>
      {accuracy && <AccuracyCircle lat={lat} lng={lng} accuracy={accuracy} />}
      <Marker
        position={[lat, lng]}
        icon={L.divIcon({
          className: "",
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        })}
      />
    </>
  )
}

// ---------- Map legend ----------

const STATUS_LEGEND_ITEMS: Array<{ status: ReportStatus; label: string }> = [
  { status: "OPEN", label: "Open" },
  { status: "CLAIMED", label: "Claimed / In Progress" },
  { status: "PENDING_VERIFICATION", label: "Pending Verification" },
  { status: "VERIFIED", label: "Verified" },
  { status: "BOUNTY", label: "Bounty Available" },
  { status: "FLAGGED", label: "Flagged" },
  { status: "REOPENED", label: "Reopened" },
]

interface MapLegendProps {
  className?: string
  compact?: boolean
}

export function MapLegend({ className, compact = false }: MapLegendProps) {
  return (
    <div className={cn("bg-white/95 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-3", className)}>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Legend</p>
      <div className="space-y-1.5">
        {STATUS_LEGEND_ITEMS.map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full shrink-0", `bg-${status.toLowerCase().replace(/_/g, "-")}`)}
              style={{ backgroundColor: markerColor(status) }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Map filters ----------

export interface MapFiltersProps {
  mode: FilterMode
  onModeChange: (mode: FilterMode) => void
  counts?: Partial<Record<FilterMode, number>>
  className?: string
}

export const FILTER_OPTIONS: Array<{ key: FilterMode; label: string; activeClass: string }> = [
  { key: "all", label: "All", activeClass: "bg-gray-900 text-white border-gray-900 shadow-sm" },
  { key: "open", label: "Open", activeClass: "bg-red-600 text-white border-red-600 shadow-sm" },
  { key: "in_progress", label: "Claimed / In Progress", activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm" },
  { key: "pending_verification", label: "Pending Verification", activeClass: "bg-purple-600 text-white border-purple-600 shadow-sm" },
  { key: "verified", label: "Verified", activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm" },
  { key: "bounty", label: "Bounty", activeClass: "bg-orange-600 text-white border-orange-600 shadow-sm" },
  { key: "flagged", label: "Flagged", activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm" },
]

export function MapFilters({ mode, onModeChange, counts, className }: MapFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="group" aria-label="Map filters">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = mode === opt.key
        const count = counts?.[opt.key]
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onModeChange(opt.key)}
            className={cn(
              "h-8 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1.5 select-none shrink-0 cursor-pointer",
              isActive
                ? opt.activeClass
                : "bg-white/95 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900 shadow-xs"
            )}
            aria-pressed={isActive}
          >
            <span>{opt.label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------- Live activity feed ----------

interface LiveActivityProps {
  events: Array<{
    id: string
    type: string
    description: string
    wardNumber: number
    timestamp: string
    icon: string
    color: string
  }>
  className?: string
  showLiveIndicator?: boolean
}

export function LiveActivity({ events, className, showLiveIndicator = true }: LiveActivityProps) {
  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  const eventColors: Record<string, string> = {
    new_report: "text-status-open",
    claimed: "text-status-blue-600",
    cleanup_started: "text-status-blue-600",
    cleanup_completed: "text-civic-green-600",
    verified: "text-civic-green-600",
    followup: "text-status-purple-600",
    bounty: "text-status-orange-600",
    reopened: "text-status-open",
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {showLiveIndicator && (
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-status-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live</span>
        </div>
      )}
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className={cn("mt-0.5 shrink-0", event.color)}>
              {ACTIVITY_ICONS[event.icon] ?? <AlertTriangle size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800 leading-snug">{event.description}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Ward {event.wardNumber} · {formatTime(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Selected report preview card ----------

interface ReportPreviewCardProps {
  report: Report
  onClick: () => void
}

export function ReportPreviewCard({ report, onClick }: ReportPreviewCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-civic-green-200"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`View report ${report.publicId}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-xs font-mono text-gray-500">{report.publicId}</p>
          <h3 className="text-sm font-semibold text-gray-900 truncate mt-0.5">
            {report.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h3>
        </div>
        <StatusBadge status={report.status} size="sm" />
      </div>

      <div className="space-y-1 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-2">
          <Navigation size={12} className="text-gray-400" />
          <span className="truncate">{report.wardName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-gray-400" />
          <span>{new Date(report.capturedAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-gray-400" />
          <span>±{report.gpsAccuracy}m accuracy</span>
        </div>
      </div>

      {report.media.length > 0 && (
        <div className="flex gap-1.5 mb-3">
          {report.media.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200"
            >
              <img
                src={m.thumbnailUrl ?? m.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {report.isOverdue && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-md bg-status-red-50 border border-status-red-200">
          <AlertTriangle size={12} className="text-status-red-600" />
          <span className="text-xs font-medium text-status-red-700">SLA breached</span>
        </div>
      )}

      {report.bountyAmount && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-md bg-status-orange-50 border border-status-orange-200">
          <Award size={12} className="text-status-orange-600" />
          <span className="text-xs font-medium text-status-orange-700">
            Bounty: +{report.bountyAmount} pts
          </span>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onClick() }}
        className="w-full py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-semibold transition-colors"
      >
        View Report
      </button>
    </div>
  )
}

// ---------- Map recenter button ----------

interface RecenterButtonProps {
  className?: string
}

export function RecenterButton({ className }: RecenterButtonProps) {
  const map = useMap()
  const MYSRU_CENTER: [number, number] = [12.29584, 76.63942]

  const recenter = useCallback(() => {
    map.setView(MYSRU_CENTER, 13, { animate: true })
  }, [map])

  return (
    <button
      onClick={recenter}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors",
        className
      )}
      aria-label="Recenter map on Mysuru"
    >
      <Navigation size={13} />
      Recenter
    </button>
  )
}

// ---------- Map controls (zoom + recenter) ----------

export function MapControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RecenterButton />
    </div>
  )
}

// ---------- Empty map state ----------

export function MapEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10", className)}>
      <div className="text-center">
        <AlertTriangle size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">No reports in this area</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting filters or zooming out</p>
      </div>
    </div>
  )
}
