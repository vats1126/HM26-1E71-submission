"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type DemoRole = "citizen" | "officer" | "ngo" | "public"
export type RoleTrack = "civic" | "operations"

export interface RoleTrackInfo {
  id: RoleTrack
  name: string
  title: string
  description: string
  badgeColor: string
  roles: DemoRole[]
}

export const ROLE_TRACKS: Record<RoleTrack, RoleTrackInfo> = {
  civic: {
    id: "civic",
    name: "CIVIC / PUBLIC",
    title: "Civic & Public",
    description: "Community reporting, transparency, and public oversight",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    roles: ["citizen", "public"],
  },
  operations: {
    id: "operations",
    name: "OPERATIONS",
    title: "Operations & Field",
    description: "Field cleanup remediation, municipal SLA execution, and bounty claims",
    badgeColor: "bg-civic-green-100 text-civic-green-800 border-civic-green-200",
    roles: ["officer", "ngo"],
  },
}

export interface RoleConfigItem {
  label: string
  subtitle: string
  track: RoleTrack
  trackLabel: string
  description: string
  badge: string
  icon: string
  capabilities: string[]
  navLinks: { href: string; label: string; icon: string }[]
  bottomNavItems: { href: string; label: string; icon: string }[]
}

export const ROLE_CONFIG: Record<DemoRole, RoleConfigItem> = {
  citizen: {
    label: "Citizen",
    subtitle: "Civic Reporter & Community Member",
    track: "civic",
    trackLabel: "CIVIC / PUBLIC",
    description: "Report issues, track own reports, follow up, notifications, profile.",
    badge: "Active Reporting",
    icon: "User",
    capabilities: [
      "Report civic issues with GPS watermarks",
      "Track personal reports and municipal updates",
      "Submit ground follow-up verifications",
      "Earn civic points and receive instant notifications",
    ],
    navLinks: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/my-reports", label: "My Reports", icon: "FileText" },
      { href: "/notifications", label: "Notifications", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
    bottomNavItems: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/my-reports", label: "My Reports", icon: "FileText" },
      { href: "/notifications", label: "Alerts", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
  },
  public: {
    label: "Public Visitor",
    subtitle: "Read-only Civic Transparency",
    track: "civic",
    trackLabel: "CIVIC / PUBLIC",
    description: "Read-only civic information (public map, public reports, transparency stats, leaderboard). NO operational actions.",
    badge: "Read-Only",
    icon: "Eye",
    capabilities: [
      "Explore public Mysuru civic incident map",
      "View open public reports and SLA statuses",
      "Inspect municipal transparency and ward analytics",
      "Browse community civic leaderboards",
    ],
    navLinks: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/transparency", label: "Transparency", icon: "BarChart3" },
      { href: "/leaderboard", label: "Leaderboard", icon: "Trophy" },
    ],
    bottomNavItems: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/transparency", label: "Data", icon: "BarChart3" },
      { href: "/leaderboard", label: "Leaders", icon: "Trophy" },
    ],
  },
  officer: {
    label: "Municipal Officer",
    subtitle: "MCC Ward Sanitation Official",
    track: "operations",
    trackLabel: "OPERATIONS",
    description: "Claim report, start cleanup, complete cleanup, upload evidence, AI & manual verification, SLA management.",
    badge: "Official Authority",
    icon: "Shield",
    capabilities: [
      "Claim reports assigned to ward jurisdiction",
      "Initiate and manage on-site sanitation cleanups",
      "Upload after-cleanup evidence photos",
      "Run AI dual-pass & manual resolution verification",
      "Monitor municipal SLA compliance and escalation queues",
    ],
    navLinks: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/dashboard", label: "Operations", icon: "LayoutDashboard" },
      { href: "/notifications", label: "Notifications", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
    bottomNavItems: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/dashboard", label: "Ops", icon: "LayoutDashboard" },
      { href: "/notifications", label: "Alerts", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
  },
  ngo: {
    label: "NGO / Community",
    subtitle: "Civic Cleanup Partner",
    track: "operations",
    trackLabel: "OPERATIONS",
    description: "Claim cleanup bounties, execute community cleanups, upload after-evidence, earn cleanup points/bounties.",
    badge: "Action Partner",
    icon: "Heart",
    capabilities: [
      "Browse and claim overdue civic cleanup bounties",
      "Mobilize community volunteer cleanup drives",
      "Upload verified after-remediation photos",
      "Earn community bounties and sponsor recognition",
      "Submit on-ground follow-ups on contested sites",
    ],
    navLinks: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/bounties", label: "Cleanup Bounties", icon: "Heart" },
      { href: "/notifications", label: "Notifications", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
    bottomNavItems: [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/bounties", label: "Bounties", icon: "Heart" },
      { href: "/notifications", label: "Alerts", icon: "Bell" },
      { href: "/profile", label: "Profile", icon: "User" },
    ],
  },
}

export interface ActionPermission {
  allowed: boolean
  reason?: string
  suggestedRole?: DemoRole
}

/**
 * Action permission checker with role track awareness.
 * - "claim_report", "start_cleanup", "verify_cleanup", "view_dashboard" -> ONLY "officer"
 * - "claim_bounty" -> ONLY "ngo"
 * - "report_issue" -> "citizen" and "officer" (prompts public to switch to citizen)
 * - "submit_followup" -> "citizen" and "ngo"
 * - "view_transparency", "view_leaderboard" -> everyone
 */
export function getActionPermission(role: DemoRole | null, action: string): ActionPermission {
  if (!role) {
    return {
      allowed: false,
      reason: "Please select a role to perform this action.",
      suggestedRole: "citizen",
    }
  }

  switch (action) {
    case "claim_report":
    case "start_cleanup":
    case "verify_cleanup":
    case "view_dashboard":
      if (role === "officer") {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: "Operational action restricted to Municipal Officers.",
        suggestedRole: "officer",
      }

    case "claim_bounty":
      if (role === "ngo") {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: "Bounties can only be claimed by registered NGOs or Community Teams.",
        suggestedRole: "ngo",
      }

    case "report_issue":
      if (role === "citizen" || role === "officer") {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: "Public Visitors have read-only access. Switch to Citizen role to report civic issues.",
        suggestedRole: "citizen",
      }

    case "submit_followup":
      if (role === "citizen" || role === "ngo") {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: "Ground follow-up submissions are available for Citizens and NGO partners.",
        suggestedRole: "citizen",
      }

    case "view_transparency":
    case "view_leaderboard":
      return { allowed: true }

    default:
      return { allowed: false, reason: "Action not permitted for this role." }
  }
}

export function canPerformAction(role: DemoRole | null, action: string): boolean {
  return getActionPermission(role, action).allowed
}

export function getRoleTrack(role: DemoRole | null): RoleTrackInfo {
  if (!role) return ROLE_TRACKS.civic
  const trackKey = ROLE_CONFIG[role]?.track || "civic"
  return ROLE_TRACKS[trackKey]
}

interface RoleContextType {
  role: DemoRole | null
  track: RoleTrackInfo | null
  setRole: (role: DemoRole) => void
  isFirstVisit: boolean
  /** True while localStorage has not yet been read (pre-hydration). RoleGate must not redirect during this window. */
  isHydrating: boolean
  clearRole: () => void
}

const SESSION_KEY = "cleancity_demo_role"
const LEGACY_STORAGE_KEY = "cleancity_demo_role"

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole | null>(null)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Remove any stale legacy localStorage role to avoid auto-restoring an old role across sessions
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Ignore storage access errors
    }

    // Active session persistence uses sessionStorage:
    // Fresh tab/session starts clean, while refresh within the same session preserves the role.
    try {
      const stored = sessionStorage.getItem(SESSION_KEY) as DemoRole | null
      if (stored && stored in ROLE_CONFIG) {
        setRoleState(stored)
        setIsFirstVisit(false)
      } else {
        setRoleState(null)
        setIsFirstVisit(true)
      }
    } catch {
      setRoleState(null)
      setIsFirstVisit(true)
    }
  }, [])

  const setRole = (newRole: DemoRole) => {
    setRoleState(newRole)
    setIsFirstVisit(false)
    try {
      sessionStorage.setItem(SESSION_KEY, newRole)
    } catch {
      // Ignore storage access errors
    }
  }

  const clearRole = () => {
    setRoleState(null)
    setIsFirstVisit(true)
    try {
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Ignore storage access errors
    }
  }

  const track = role ? getRoleTrack(role) : null

  // Prevent hydration mismatch — NEVER expose isFirstVisit:true before localStorage is read,
  // because that would cause RoleGate to redirect every refresh to /welcome.
  if (!mounted) {
    return (
      <RoleContext.Provider value={{ role: null, track: null, setRole, isFirstVisit: false, isHydrating: true, clearRole }}>
        {children}
      </RoleContext.Provider>
    )
  }

  return (
    <RoleContext.Provider value={{ role, track, setRole, isFirstVisit, isHydrating: false, clearRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
