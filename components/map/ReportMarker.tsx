import { useState } from "react"
import { Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { STATUS_CONFIG, type Report, type ReportStatus } from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

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

let styleInjected = false
const CC_MARKER_CLASS = "cc-marker"

function injectStyles() {
  if (typeof window === "undefined" || styleInjected) return
  styleInjected = true
  const el = document.createElement("style")
  el.textContent = `
    .${CC_MARKER_CLASS} {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.15s;
    }
    .${CC_MARKER_CLASS}:hover {
      transform: scale(1.12);
    }
    .cc-marker-new {
      animation: cc-pulse 1.5s ease-out;
    }
    @keyframes cc-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
      70% { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
    .cc-popup .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .cc-popup .leaflet-popup-content {
      margin: 10px 12px;
    }
    .cc-popup .leaflet-popup-tip {
      box-shadow: none;
    }
  `
  document.head.appendChild(el)
}

if (typeof window !== "undefined") {
  injectStyles()
}

function makeMarkerIcon(status: ReportStatus, isNew?: boolean): L.DivIcon {
  const color = markerColor(status)
  const size = isNew ? 14 : 32
  const innerSize = isNew ? 4 : 10
  const shadow = hexToRgba(color, isNew ? 0.4 : 0.35)
  return L.divIcon({
    className: `${CC_MARKER_CLASS}${isNew ? " cc-marker-new" : ""}`,
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; box-shadow: 0 2px 8px ${shadow}; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: ${innerSize}px; height: ${innerSize}px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  })
}

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
      eventHandlers={{
        click: () => onClick?.(report),
      }}
      zIndexOffset={isSelected ? 2000 : 0}
    >
      {isSelected && (
        <Popup className="cc-popup" offset={[0, -18]}>
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1.5">{report.publicId}</p>
            <StatusBadge status={report.status} size="sm" pulse={false} />
            <p className="text-sm font-medium text-gray-900 mt-1.5">
              {formatCategory(report.category)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{report.wardName}</p>
          </div>
        </Popup>
      )}
    </Marker>
  )
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
