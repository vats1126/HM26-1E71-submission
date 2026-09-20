import React, { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, Wifi, WifiOff, Pause, Play } from "lucide-react"
import { useToast } from "./Toast"

interface OfflineQueueItem {
  id: string
  action: string
  data: Record<string, unknown>
  timestamp: string
  synced: boolean
}

let globalQueueRef: OfflineQueueItem[] = []

export function getOfflineQueue(): OfflineQueueItem[] {
  return globalQueueRef
}

export function addToOfflineQueue(action: string, data: Record<string, unknown>) {
  const item: OfflineQueueItem = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    data,
    timestamp: new Date().toISOString(),
    synced: false,
  }
  globalQueueRef.push(item)
}

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [queue, setQueue] = useState<OfflineQueueItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine)
    updateOnline()
    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

  useEffect(() => {
    setQueue([...globalQueueRef])
  }, [globalQueueRef.length])

  const syncQueue = useCallback(() => {
    const pending = globalQueueRef.filter((q) => !q.synced)
    if (!isOnline || pending.length === 0) return
    setIsSyncing(true)
    setTimeout(() => {
      globalQueueRef.forEach((item) => { item.synced = true })
      setQueue([...globalQueueRef])
      setIsSyncing(false)
      showToast("Report synced successfully", "success")
    }, 1500)
  }, [isOnline, showToast])

  useEffect(() => {
    if (isOnline && globalQueueRef.some((q) => !q.synced)) {
      syncQueue()
    }
  }, [isOnline, syncQueue])

  const pendingCount = queue.filter((q) => !q.synced).length
  const syncedCount = queue.filter((q) => q.synced).length

  if (!isOnline || pendingCount > 0) {
    return (
      <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
        <div className="bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="text-civic-green-400" size={16} />
            ) : (
              <WifiOff className="text-status-orange-400" size={16} />
            )}
            <span className="text-sm font-medium">
              {isOnline
                ? pendingCount > 0
                  ? `Offline — ${pendingCount} report${pendingCount > 1 ? "s" : ""} saved locally`
                  : "Online"
                : "Internet unavailable"}
            </span>
            {isSyncing && (
              <span className="flex items-center gap-1.5 text-civic-green-400 text-xs">
                <div className="h-2 w-2 rounded-full bg-civic-green-400 animate-pulse" />
                Syncing…
              </span>
            )}
          </div>
          {pendingCount > 0 && (
            <>
              <span className="text-xs text-gray-400">
                {syncedCount} synced · {pendingCount} pending
              </span>
              <button
                onClick={syncQueue}
                disabled={!isOnline || isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-civic-green-700 hover:bg-civic-green-800 disabled:opacity-50 text-xs font-medium text-white transition-colors"
              >
                {isSyncing ? <Pause size={12} /> : <Play size={12} />}
                {isSyncing ? "Syncing" : "Sync Now"}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}

interface OfflineQueueProps {
  className?: string
}

export function OfflineQueue({ className }: OfflineQueueProps) {
  if (globalQueueRef.length === 0) return null

  return (
    <div className={cn("rounded-xl bg-gray-50 border border-gray-200 p-4", className)}>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <AlertTriangle size={14} className="text-status-yellow-500" />
        Offline Queue
      </h4>
      <div className="space-y-2">
        {globalQueueRef.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between gap-2 text-xs rounded-md px-3 py-2",
              item.synced ? "bg-civic-green-50 text-civic-green-700" : "bg-status-orange-50 text-status-orange-700"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {item.synced ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              <span className="truncate">{item.action}</span>
            </div>
            <span className="text-gray-400 shrink-0">
              {new Date(item.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
