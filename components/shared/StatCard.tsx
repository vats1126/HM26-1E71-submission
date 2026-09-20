import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { direction: "up" | "down" | "neutral"; value: string }
  color?: "green" | "red" | "blue" | "purple" | "orange" | "yellow" | "neutral"
  className?: string
  onClick?: () => void
}

const colorMap = {
  green: { bg: "bg-civic-green-50", text: "text-civic-green-700", icon: "text-civic-green-500", border: "border-civic-green-200" },
  red: { bg: "bg-status-open/5", text: "text-status-open", icon: "text-status-open", border: "border-status-open/20" },
  blue: { bg: "bg-status-blue-50", text: "text-status-blue-700", icon: "text-status-blue-500", border: "border-status-blue-200" },
  purple: { bg: "bg-status-purple-50", text: "text-status-purple-700", icon: "text-status-purple-500", border: "border-status-purple-200" },
  orange: { bg: "bg-status-orange-50", text: "text-status-orange-700", icon: "text-status-orange-500", border: "border-status-orange-200" },
  yellow: { bg: "bg-status-yellow-50", text: "text-status-yellow-700", icon: "text-status-yellow-500", border: "border-status-yellow-200" },
  neutral: { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-400", border: "border-gray-200" },
}

export function StatCard({ label, value, icon, trend, color = "neutral", className, onClick }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md",
        c.bg, c.border,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {icon && (
        <div className={cn("absolute top-3 right-3", c.icon)}>
          {icon}
        </div>
      )}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", c.text)}>{value}</p>
      {trend && (
        <div className={cn(
          "mt-2 text-xs font-medium flex items-center gap-1",
          trend.direction === "up" ? "text-civic-green-600" : trend.direction === "down" ? "text-status-open" : "text-gray-400"
        )}>
          {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}
        </div>
      )}
    </div>
  )
}
