"use client"
import React, { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X, Info, AlertTriangle, CheckCircle } from "lucide-react"

type ToastVariant = "default" | "success" | "error" | "warning"

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  icon?: React.ReactNode
  duration?: number
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, icon?: React.ReactNode, duration?: number) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const variantConfig = {
  default: { bg: "bg-gray-900", icon: "text-gray-300", iconWrapper: "bg-gray-700" },
  success: { bg: "bg-civic-green-700", icon: "text-civic-green-200", iconWrapper: "bg-civic-green-800" },
  error: { bg: "bg-status-red-700", icon: "text-status-red-200", iconWrapper: "bg-status-red-800" },
  warning: { bg: "bg-status-yellow-600", icon: "text-status-yellow-200", iconWrapper: "bg-status-yellow-700" },
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const showToast = useCallback((message: string, variant: ToastVariant = "default", icon?: React.ReactNode, duration = 4000) => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { id, message, variant, icon, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const cfg = variantConfig[t.variant]
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg p-3 shadow-lg animate-slide-up min-w-0",
                cfg.bg,
                t.variant === "warning" && "border border-status-yellow-500"
              )}
              role="alert"
            >
              <div className={cn("p-1.5 rounded-md shrink-0", cfg.iconWrapper)}>
                {t.icon ?? (
                  t.variant === "success" ? <CheckCircle size={16} /> :
                  t.variant === "error" ? <AlertTriangle size={16} /> :
                  t.variant === "warning" ? <AlertTriangle size={16} /> :
                  <Info size={16} />
                )}
              </div>
              <p className="text-sm text-white flex-1 text-balance">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-white/70 hover:text-white transition-colors p-0.5 shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
