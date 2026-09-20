// Notification system for CleanCity
// Lightweight local/demo notifications backed by localStorage

export type NotificationType =
  | "REPORT_SUBMITTED"
  | "REPORT_ROUTED"
  | "REPORT_CLAIMED"
  | "CLEANUP_STARTED"
  | "CLEANUP_COMPLETED"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "UNCERTAIN"
  | "REOPENED"
  | "FOLLOW_UP_RECEIVED"
  | "BOUNTY_CREATED"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  reportId?: string
  reportPublicId?: string
  timestamp: string
  read: boolean
  icon: string
  color: string
}

interface NotificationTemplate {
  title: string
  messageTemplate: string
  icon: string
  color: string
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  REPORT_SUBMITTED: {
    title: "Report Submitted",
    messageTemplate: "Your report {publicId} has been submitted and routed to {wardName}.",
    icon: "FileText",
    color: "text-civic-green-600",
  },
  REPORT_ROUTED: {
    title: "Report Routed",
    messageTemplate: "Report {publicId} has been routed to the responsible ward officer.",
    icon: "MapPin",
    color: "text-blue-600",
  },
  REPORT_CLAIMED: {
    title: "Report Claimed",
    messageTemplate: "Report {publicId} has been claimed by {actorName}.",
    icon: "UserCheck",
    color: "text-indigo-600",
  },
  CLEANUP_STARTED: {
    title: "Cleanup Started",
    messageTemplate: "Cleanup has started on report {publicId} by {actorName}.",
    icon: "Wrench",
    color: "text-orange-600",
  },
  CLEANUP_COMPLETED: {
    title: "Cleanup Completed",
    messageTemplate: "Cleanup completed on report {publicId}. Pending verification.",
    icon: "CheckCircle",
    color: "text-emerald-600",
  },
  PENDING_VERIFICATION: {
    title: "Pending Verification",
    messageTemplate: "Report {publicId} is awaiting AI & officer verification.",
    icon: "Eye",
    color: "text-amber-600",
  },
  VERIFIED: {
    title: "Issue Resolved",
    messageTemplate: "Report {publicId} has been verified. The issue is resolved!",
    icon: "ShieldCheck",
    color: "text-civic-green-700",
  },
  REJECTED: {
    title: "Verification Rejected",
    messageTemplate: "Verification for report {publicId} was rejected. Cleanup may need to be redone.",
    icon: "XCircle",
    color: "text-red-600",
  },
  UNCERTAIN: {
    title: "Manual Review Required",
    messageTemplate: "Report {publicId} requires manual review — verification was inconclusive.",
    icon: "HelpCircle",
    color: "text-yellow-600",
  },
  REOPENED: {
    title: "Report Reopened",
    messageTemplate: "Report {publicId} has been reopened based on new evidence.",
    icon: "RotateCcw",
    color: "text-red-500",
  },
  FOLLOW_UP_RECEIVED: {
    title: "Follow-up Received",
    messageTemplate: "A citizen follow-up was submitted on report {publicId}.",
    icon: "MessageCircle",
    color: "text-blue-500",
  },
  BOUNTY_CREATED: {
    title: "Bounty Available",
    messageTemplate: "A cleanup bounty has been created for report {publicId}.",
    icon: "Award",
    color: "text-purple-600",
  },
}

const STORAGE_KEY = "cleancity_notifications"

const DEFAULT_SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-seed-1",
    type: "CLEANUP_COMPLETED",
    title: "Cleanup Completed",
    message: "Cleanup completed on report MC-1002 (Ward 18 Kuvempunagar) by Ward Officer Mohan Raj. Awaiting verification.",
    reportId: "report-1002",
    reportPublicId: "MC-1002",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    icon: "CheckCircle",
    color: "text-emerald-600",
  },
  {
    id: "notif-seed-2",
    type: "REPORT_CLAIMED",
    title: "Report Claimed",
    message: "Report MC-1004 has been claimed for site action by Municipal Officer Mohan Raj.",
    reportId: "report-1004",
    reportPublicId: "MC-1004",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    icon: "UserCheck",
    color: "text-indigo-600",
  },
  {
    id: "notif-seed-3",
    type: "VERIFIED",
    title: "Issue Resolved",
    message: "Report MC-1001 has been verified with AI dual-pass confirmation. The issue is resolved!",
    reportId: "report-1001",
    reportPublicId: "MC-1001",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    icon: "ShieldCheck",
    color: "text-civic-green-700",
  },
  {
    id: "notif-seed-4",
    type: "REPORT_SUBMITTED",
    title: "Report Submitted",
    message: "Your report MC-1005 was registered and routed to Ward 10 (Saraswathipuram).",
    reportId: "report-1005",
    reportPublicId: "MC-1005",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    icon: "FileText",
    color: "text-civic-green-600",
  },
]

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") return DEFAULT_SEED_NOTIFICATIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_NOTIFICATIONS))
      return DEFAULT_SEED_NOTIFICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_SEED_NOTIFICATIONS
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)))
  } catch {
    // localStorage full — silently ignore
  }
}

export const notificationService = {
  getNotifications(): Notification[] {
    return getStoredNotifications()
  },

  addNotification(
    type: NotificationType,
    data: {
      reportId?: string
      reportPublicId?: string
      actorName?: string
      wardName?: string
    } = {}
  ): Notification {
    const template = NOTIFICATION_TEMPLATES[type]
    let message = template.messageTemplate
    if (data.reportPublicId) message = message.replace("{publicId}", data.reportPublicId)
    if (data.actorName) message = message.replace("{actorName}", data.actorName)
    if (data.wardName) message = message.replace("{wardName}", data.wardName)
    // Clean up any unreplaced placeholders
    message = message.replace(/\{[^}]+\}/g, "—")

    const notification: Notification = {
      id: generateId(),
      type,
      title: template.title,
      message,
      reportId: data.reportId,
      reportPublicId: data.reportPublicId,
      timestamp: new Date().toISOString(),
      read: false,
      icon: template.icon,
      color: template.color,
    }

    const existing = getStoredNotifications()
    saveNotifications([notification, ...existing])
    return notification
  },

  markAsRead(id: string): void {
    const notifications = getStoredNotifications()
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    saveNotifications(updated)
  },

  markAllAsRead(): void {
    const notifications = getStoredNotifications()
    const updated = notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updated)
  },

  getUnreadCount(): number {
    return getStoredNotifications().filter((n) => !n.read).length
  },

  clearAll(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  },
}
