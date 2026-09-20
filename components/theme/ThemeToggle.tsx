"use client"

import React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "icon" | "pill"
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer",
          theme === "dark"
            ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
            : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
          className
        )}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <>
            <Sun size={14} className="text-amber-400" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-slate-600" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-lg transition-colors cursor-pointer",
        theme === "dark"
          ? "text-amber-300 hover:bg-slate-800 hover:text-amber-200"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={18} className="transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  )
}
