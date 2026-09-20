import { cn } from "@/lib/utils"
import { FileQuestion, AlertCircle, CheckCircle } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "success" | "warning" | "error"
  className?: string
}

const variantStyles = {
  default: {
    bg: "bg-gray-50",
    iconWrapper: "bg-gray-100 text-gray-400",
    border: "border-gray-200",
  },
  success: {
    bg: "bg-civic-green-50",
    iconWrapper: "bg-civic-green-100 text-civic-green-600",
    border: "border-civic-green-200",
  },
  warning: {
    bg: "bg-status-yellow-50",
    iconWrapper: "bg-status-yellow-100 text-status-yellow-600",
    border: "border-status-yellow-200",
  },
  error: {
    bg: "bg-status-red-50",
    iconWrapper: "bg-status-red-100 text-status-red-600",
    border: "border-status-red-200",
  },
}

export function EmptyState({ icon, title, description, action, variant = "default", className }: EmptyStateProps) {
  const vs = variantStyles[variant]
  const defaultIcon = icon ?? (
    variant === "success"
      ? <CheckCircle size={32} />
      : variant === "error"
      ? <AlertCircle size={32} />
      : <FileQuestion size={32} />
  )

  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border", vs.bg, vs.border, className)}>
      <div className={cn("p-3 rounded-full", vs.iconWrapper, "mb-4")}>
        {defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
