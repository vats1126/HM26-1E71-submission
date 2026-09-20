"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Bell, Check, CheckCheck, Trash2,
  FileText, MapPin, Wrench, Eye, ShieldCheck,
  XCircle, HelpCircle, RotateCcw, MessageCircle, Award,
  UserCheck,
} from "lucide-react"
import { notificationService, type Notification } from "@/lib/notifications"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, MapPin, UserCheck, Wrench, CheckCircle: Check,
  Eye, ShieldCheck, XCircle, HelpCircle, RotateCcw,
  MessageCircle, Award,
}

function getNotifIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Bell
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const refresh = useCallback(() => {
    setNotifications(notificationService.getNotifications())
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id)
    refresh()
  }

  const markAllAsRead = () => {
    notificationService.markAllAsRead()
    refresh()
  }

  const clearAll = () => {
    notificationService.clearAll()
    refresh()
  }

  const handleCardClick = (notif: Notification) => {
    if (!notif.read) {
      notificationService.markAsRead(notif.id)
      refresh()
    }
    const targetId = notif.reportPublicId || notif.reportId
    if (targetId) {
      router.push(`/report/${targetId}`)
    }
  }

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700">
                <Bell size={22} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">Notifications</h1>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-civic-green-600 hover:text-civic-green-700 px-3 py-1.5 rounded-lg hover:bg-civic-green-50 transition-colors"
                >
                  <CheckCheck size={14} className="inline mr-1" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 mt-4">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  filter === f
                    ? "bg-civic-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Notification List */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-700">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Notifications appear when your reports change status.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const Icon = getNotifIcon(notif.icon)
              return (
                <div
                  key={notif.id}
                  onClick={() => handleCardClick(notif)}
                  className={cn(
                    "rounded-xl border p-4 flex items-start gap-3 transition-all cursor-pointer hover:shadow-md active:scale-[0.995]",
                    notif.read
                      ? "bg-white border-gray-200 hover:border-gray-300"
                      : "bg-civic-green-50/60 border-civic-green-200 shadow-xs hover:border-civic-green-300"
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={`Notification: ${notif.title}`}
                >
                  <div className={cn("p-2 rounded-lg shrink-0", notif.read ? "bg-gray-100 text-gray-500" : "bg-white text-civic-green-600 shadow-xs")}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("text-sm font-bold", notif.read ? "text-gray-700" : "text-gray-900")}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-civic-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400">
                        {new Date(notif.timestamp).toLocaleString([], {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      {notif.reportPublicId && (
                        <span className="text-[10px] font-bold text-civic-green-600 hover:underline inline-flex items-center gap-0.5">
                          View Report →
                        </span>
                      )}
                    </div>
                  </div>
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
