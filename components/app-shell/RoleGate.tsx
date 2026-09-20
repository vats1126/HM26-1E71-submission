"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"
import { useEffect } from "react"

interface RoleGateProps {
  children: React.ReactNode
}

export function RoleGate({ children }: RoleGateProps) {
  const { role, isFirstVisit } = useRole()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // If no role selected and not already on welcome page, redirect
    if (isFirstVisit && !role && pathname !== "/welcome") {
      router.replace("/welcome")
    }
  }, [isFirstVisit, role, pathname, router])

  // Don't block the welcome page from rendering
  if (pathname === "/welcome") {
    return <>{children}</>
  }

  // If no role yet (first visit) and not on welcome page, show nothing while redirecting
  if (isFirstVisit && !role) {
    return null
  }

  return <>{children}</>
}
