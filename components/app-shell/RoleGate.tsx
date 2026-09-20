"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"

interface RoleGateProps {
  children: React.ReactNode
}

export function RoleGate({ children }: RoleGateProps) {
  const { role, isFirstVisit, isHydrating } = useRole()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only redirect AFTER hydration is complete, role is confirmed absent, and it's a first visit.
    // Never redirect during isHydrating (pre-localStorage phase) to avoid spurious /welcome redirect on refresh.
    if (!isHydrating && isFirstVisit && !role && pathname !== "/welcome") {
      router.replace("/welcome")
    }
  }, [isHydrating, isFirstVisit, role, pathname, router])

  // Always render the welcome page without any gate check
  if (pathname === "/welcome") {
    return <>{children}</>
  }

  // During hydration: render children so the page isn't blank while localStorage is loading
  if (isHydrating) {
    return <>{children}</>
  }

  // After hydration: if genuinely a first visit with no role, show nothing while redirect fires
  if (isFirstVisit && !role) {
    return null
  }

  return <>{children}</>
}
