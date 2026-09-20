"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { STATUS_CONFIG, type ReportStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: ReportStatus
  size?: "sm" | "md" | "lg"
  showDot?: boolean
  pulse?: boolean
  className?: string
}

export function StatusBadge({ status, size = "md", showDot = true, pulse = false, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return null

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm font-medium",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses[size],
        cfg.bg,
        cfg.color,
        className
      )}
      role="status"
      aria-label={`Status: ${cfg.label}`}
    >
      {showDot && (
        <span
          className={cn("status-dot", cfg.dotColor, pulse && "pulse-animation")}
          aria-hidden="true"
        />
      )}
      {cfg.label}
    </span>
  )
}
