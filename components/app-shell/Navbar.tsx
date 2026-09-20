"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home, Flag, BarChart3, Users, LayoutDashboard, User,
  Menu, X, ShieldCheck, Plus, ChevronDown, LogOut, Bell,
  FileText, Heart, Eye, Trophy, Shield,
} from "lucide-react"
import { useRole, ROLE_CONFIG, type DemoRole } from "@/lib/role-context"
import { notificationService } from "@/lib/notifications"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

// Map icon string names to actual Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Home, FileText, Bell, User, LayoutDashboard, Shield,
  Heart, Eye, BarChart3, Trophy, Users, Plus, Flag,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Home
}

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { role, setRole, clearRole } = useRole()

  // Poll notification count
  useEffect(() => {
    const update = () => setUnreadCount(notificationService.getUnreadCount())
    update()
    const interval = setInterval(update, 3000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Get role-specific nav links
  const navLinks = role ? ROLE_CONFIG[role].navLinks : ROLE_CONFIG.citizen.navLinks
  const roleLabel = role ? ROLE_CONFIG[role].label : "Select Role"

  // Should show "Report Issue" CTA?
  const showReportCTA = role === "citizen" || role === "officer"

  // Don't render navbar on welcome page
  if (pathname === "/welcome") return null

  return (
    <header className={cn("sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Mysuru Janseva home">
            <div className="w-8 h-8 rounded-lg bg-civic-green-600 flex items-center justify-center group-hover:bg-civic-green-700 transition-colors">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900 tracking-tight">Mysuru Janseva</span>
              <span className="text-xs text-gray-500 ml-1.5 font-medium">Mysuru</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Primary">
            {navLinks
              .filter((l) => l.label !== "Notifications") // Notifications handled separately
              .map((link) => {
              const Icon = getIcon(link.icon)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-civic-green-50 text-civic-green-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Report CTA - desktop */}
            {showReportCTA && (
              <Link
                href="/report"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Plus size={16} />
                Report Issue
              </Link>
            )}

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-status-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Demo Role Switcher with Two-Track Grouping */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setRoleSwitcherOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                  roleSwitcherOpen
                    ? "border-civic-green-300 bg-civic-green-50 text-civic-green-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-civic-green-500" />
                <span className="hidden lg:inline">DEMO:</span>
                <span className="truncate max-w-[110px]">{roleLabel}</span>
                <ChevronDown size={12} className={cn("transition-transform", roleSwitcherOpen && "rotate-180")} />
              </button>

              {roleSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleSwitcherOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-xl py-1.5 z-20">
                    {/* Track 1: CIVIC / PUBLIC */}
                    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                      <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
                        Civic / Public
                      </p>
                    </div>
                    {(["citizen", "public"] as DemoRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setRoleSwitcherOpen(false) }}
                        className={cn(
                          "flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs transition-colors",
                          r === role
                            ? "bg-blue-50 text-blue-900 font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <span className={cn("p-1 rounded-md", r === role ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}>
                          {React.createElement(getIcon(ROLE_CONFIG[r].icon), { size: 14 })}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs leading-tight">{ROLE_CONFIG[r].label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{ROLE_CONFIG[r].subtitle}</div>
                        </div>
                        {r === role && <span className="text-xs text-blue-600 font-bold">✓</span>}
                      </button>
                    ))}

                    {/* Track 2: OPERATIONS */}
                    <div className="px-3 py-1.5 bg-gray-50 border-y border-gray-100 mt-1">
                      <p className="text-[10px] font-extrabold text-civic-green-700 uppercase tracking-wider">
                        Operations & Field
                      </p>
                    </div>
                    {(["officer", "ngo"] as DemoRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setRoleSwitcherOpen(false) }}
                        className={cn(
                          "flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs transition-colors",
                          r === role
                            ? "bg-civic-green-50 text-civic-green-900 font-bold"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <span className={cn("p-1 rounded-md", r === role ? "bg-civic-green-100 text-civic-green-700" : "bg-gray-100 text-gray-500")}>
                          {React.createElement(getIcon(ROLE_CONFIG[r].icon), { size: 14 })}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs leading-tight">{ROLE_CONFIG[r].label}</div>
                          <div className="text-[10px] text-gray-400 truncate">{ROLE_CONFIG[r].subtitle}</div>
                        </div>
                        {r === role && <span className="text-xs text-civic-green-600 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2 p-1.5 rounded-lg transition-colors",
                  userMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"
                )}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-civic-green-100 flex items-center justify-center text-civic-green-700 text-xs font-bold">
                  Y
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-1.5 z-20 scale-in">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">You (Demo Citizen)</p>
                      <p className="text-xs text-gray-500">citizen@mysurujanaseva.in</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} /> Profile
                      </Link>
                      {(role === "officer") && (
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      {/* Mobile theme toggle */}
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <ThemeToggle variant="pill" className="w-full justify-center" />
                      </div>

                      {/* Mobile role switcher grouped by track */}
                      <div className="sm:hidden border-b border-gray-100 pb-1 mb-1">
                        <p className="px-3 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-gray-50">Civic / Public</p>
                        {(["citizen", "public"] as DemoRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => { setRole(r); setUserMenuOpen(false) }}
                            className={cn(
                              "flex items-center justify-between w-full px-3 py-1.5 text-xs text-left",
                              r === role ? "text-blue-700 font-bold bg-blue-50/60" : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {React.createElement(getIcon(ROLE_CONFIG[r].icon), { size: 13 })}
                              {ROLE_CONFIG[r].label}
                            </span>
                            {r === role && <span className="text-blue-600 font-bold">✓</span>}
                          </button>
                        ))}

                        <p className="px-3 py-1 text-[10px] font-bold text-civic-green-700 uppercase tracking-wider bg-gray-50 mt-1">Operations & Field</p>
                        {(["officer", "ngo"] as DemoRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => { setRole(r); setUserMenuOpen(false) }}
                            className={cn(
                              "flex items-center justify-between w-full px-3 py-1.5 text-xs text-left",
                              r === role ? "text-civic-green-700 font-bold bg-civic-green-50/60" : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {React.createElement(getIcon(ROLE_CONFIG[r].icon), { size: 13 })}
                              {ROLE_CONFIG[r].label}
                            </span>
                            {r === role && <span className="text-civic-green-600 font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { clearRole(); setUserMenuOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-status-red-600 hover:bg-status-red-50"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1" role="navigation" aria-label="Mobile primary">
            {navLinks.map((link) => {
              const Icon = getIcon(link.icon)
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-civic-green-50 text-civic-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
            {showReportCTA && (
              <Link
                href="/report"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-civic-green-600 text-white shadow-sm"
              >
                <Plus size={18} />
                Report Issue
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
