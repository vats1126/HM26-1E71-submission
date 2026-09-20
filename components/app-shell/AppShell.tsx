"use client"
import React from "react"
import { Navbar } from "@/components/app-shell/Navbar"
import { BottomNav } from "@/components/app-shell/BottomNav"
import { ToastProvider } from "@/components/shared/Toast"
import { OfflineBanner } from "@/components/shared/OfflineBanner"
import { RoleProvider } from "@/lib/role-context"
import { RoleGate } from "@/components/app-shell/RoleGate"
import { ThemeProvider } from "@/components/theme/ThemeProvider"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <RoleProvider>
        <ToastProvider>
          <OfflineBanner />
          <Navbar />
          <RoleGate>
            <main className="pb-28 md:pb-0 overflow-x-hidden">
              {children}
            </main>
          </RoleGate>
          <BottomNav />
        </ToastProvider>
      </RoleProvider>
    </ThemeProvider>
  )
}

