import { useCallback, useEffect, useRef, useState } from "react"
import { Marker, useMap } from "react-leaflet"
import { MYSRU_CENTER, MOCK_REPORTS } from "@/lib/mock-data"
import { STATUS_CONFIG, type Report, type ReportStatus } from "@/lib/types"
import { useToast } from "@/components/shared/Toast"
import L from "leaflet"

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const STATUS_COLOR_MAP: Record<ReportStatus, string> = {
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

// Pre-create icon cache
const iconCache = new Map<string, L.DivIcon>()

function getMarkerIcon(status: ReportStatus, isNew = false): L.DivIcon {
  const key = `${status}-${isNew}`
  if (iconCache.has(key)) return iconCache.get(key)!

  const color = STATUS_COLOR_MAP[status] ?? "#6b7280"
  const size = isNew ? 14 : 32
  const pulseClass = isNew ? 'style="animation: leaflet-pulse 1.5s ease-out infinite"' : ""

  const icon = L.divIcon({
    className: "",
    html: `<div class="report-marker ${isNew ? "report-marker-new" : ""}" ${pulseClass} style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px ${hexToRgba(color, 0.4)}; border: 2px solid white; cursor: pointer; transition: transform 0.15s;"><div style="width: ${isNew ? 4 : 10}px; height: ${isNew ? 4 : 10}px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  })

  iconCache.set(key, icon)
  return icon
}

// Inject pulse keyframes once
if (typeof window !== "undefined") {
  const id = "leaflet-clean-city-styles"
  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes leaflet-pulse {
        0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
        70% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
      }
    `
    document.head.appendChild(style)
  }
}

interface ReportMarkerLayerProps {
  reports: Report[]
  selectedReportId?: string
  onSelect: (report: Report) => void
  highlightedLat?: number
  highlightedLng?: number
}

export function ReportMarkerLayer({ reports, selectedReportId, onSelect, highlightedLat, highlightedLng }: ReportMarkerLayerProps) {
  const map = useMap()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const timer = setTimeout(() => {
      if (mounted) setReady(true)
    }, 50)
    return () => { mounted = false; clearTimeout(timer) }
  }, [map])

  // Renders nothing — markers are placed via Leaflet directly
  // We use a different approach: render markers inside MapContainer
  return null
}

// This component renders actual markers inside MapContainer
// MarkerLayer must be inside MapContainer for useMap to work
interface MarkerLayerProps {
  reports: Report[]
  selectedReportId?: string
  onSelect: (report: Report) => void
}

export function MarkerLayer({ reports, selectedReportId, onSelect }: MarkerLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    // Markers are rendered by react-leaflet, just need map ready
  }, [map])

  return (
    <>
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={getMarkerIcon(report.status, false)}
          eventHandlers={{
            click: () => onSelect(report),
          }}
          zIndexOffset={report.id === selectedReportId ? 1000 : 0}
        />
      ))}
    </>
  )
}

// Current location marker
interface CurrentLocationMarkerProps {
  lat: number
  lng: number
  accuracy: number
  showAccuracy?: boolean
}

export function CurrentLocationMarker({ lat, lng, accuracy, showAccuracy = true }: CurrentLocationMarkerProps) {
  const map = useMap()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const timer = setTimeout(() => { if (mounted) setReady(true) }, 50)
    return () => { mounted = false; clearTimeout(timer) }
  }, [map])

  if (!ready) return null

  return (
    <>
      {showAccuracy && (
        <Circle
          center={[lat, lng]}
          radius={accuracy}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.08,
            weight: 1,
            opacity: 0.2,
          }}
        />
      )}
      <Marker
        position={[lat, lng]}
        icon={L.divIcon({
          className: "",
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%; margin: 3px;"></div></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        })}
      />
    </>
  )
}

import { Circle } from "react-leaflet"
