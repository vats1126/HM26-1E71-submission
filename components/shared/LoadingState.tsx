import { cn } from "@/lib/utils"

interface LoadingStateProps {
  lines?: number
  width?: string
  height?: string
  className?: string
}

export function LoadingState({ lines = 3, width = "100%", height = "1rem", className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-2", className)} aria-label="Loading" role="progressbar" aria-busy="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-md bg-gray-200"
          style={{ width, height: i === lines - 1 ? "1.5rem" : height }}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <div className="animate-pulse rounded-full bg-gray-200 h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="animate-pulse rounded h-4 bg-gray-200 w-3/4" />
          <div className="animate-pulse rounded h-3 bg-gray-200 w-1/2" />
        </div>
      </div>
      <div className="animate-pulse rounded h-20 bg-gray-100 mt-3" />
    </div>
  )
}
