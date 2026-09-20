"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home, Plus, BarChart3, Users, ShieldCheck,
  FileText, Bell, User, LayoutDashboard, Heart,
  Eye, Trophy, Shield,
} from "lucide-react"
import { useRole, ROLE_CONFIG } from "@/lib/role-context"
import { notificationService } from "@/lib/notifications"

// Map icon string names to components
const ICON_MAP: Record<string, React.ElementType> = {
  Home, FileText, Bell, User, LayoutDashboard, Shield,
  Heart, Eye, BarChart3, Trophy, Users, Plus,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Home
}

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()
  const { role } = useRole()
  const [unreadCount, setUnreadCount] = useState(0)

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

  // Don't render on welcome page
  if (pathname === "/welcome") return null

  const items = role ? ROLE_CONFIG[role].bottomNavItems : ROLE_CONFIG.citizen.bottomNavItems

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-lg safe-area-pb",
        className
      )}
      role="navigation"
      aria-label="Primary actions"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1 min-h-14">
        {items.map((item) => {
          const Icon = getIcon(item.icon)
          const active = isActive(item.href)
          const isNotifications = item.href === "/notifications"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] transition-colors",
                active
                  ? "text-civic-green-600"
                  : "text-gray-500"
              )}
            >
              <div className="relative">
                <Icon size={20} />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-status-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                active ? "font-semibold" : ""
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
