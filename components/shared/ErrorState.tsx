import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ErrorStateProps {
  type?: "error" | "warning" | "info" | "not_found" | "unauthorized" | "offline" | "sync_failed" | "moderation" | "server"
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const typeConfig = {
  error: { icon: AlertTriangle, bg: "bg-status-red-50", iconBg: "bg-status-red-100 text-status-red-600", border: "border-status-red-200" },
  warning: { icon: AlertTriangle, bg: "bg-status-yellow-50", iconBg: "bg-status-yellow-100 text-status-yellow-600", border: "border-status-yellow-200" },
  info: { icon: Info, bg: "bg-status-blue-50", iconBg: "bg-status-blue-100 text-status-blue-600", border: "border-status-blue-200" },
  not_found: { icon: AlertTriangle, bg: "bg-gray-50", iconBg: "bg-gray-100 text-gray-500", border: "border-gray-200" },
  unauthorized: { icon: AlertTriangle, bg: "bg-status-orange-50", iconBg: "bg-status-orange-100 text-status-orange-600", border: "border-status-orange-200" },
  offline: { icon: AlertTriangle, bg: "bg-status-orange-50", iconBg: "bg-status-orange-100 text-status-orange-600", border: "border-status-orange-200" },
  sync_failed: { icon: AlertTriangle, bg: "bg-status-red-50", iconBg: "bg-status-red-100 text-status-red-600", border: "border-status-red-200" },
  moderation: { icon: AlertTriangle, bg: "bg-status-yellow-50", iconBg: "bg-status-yellow-100 text-status-yellow-600", border: "border-status-yellow-200" },
  server: { icon: AlertTriangle, bg: "bg-status-red-50", iconBg: "bg-status-red-100 text-status-red-600", border: "border-status-red-200" },
}

export function ErrorState({ type = "error", title, description, action, className }: ErrorStateProps) {
  const cfg = typeConfig[type] ?? typeConfig.error
  const Icon = cfg.icon

  return (
    <div className={cn("flex flex-col items-center justify-center text-center rounded-xl border p-8", cfg.bg, cfg.border, className)}>
      <div className={cn("p-3 rounded-full mb-4", cfg.iconBg)}>
        <Icon size={28} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
