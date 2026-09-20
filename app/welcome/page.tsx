"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useRole, type DemoRole, ROLE_CONFIG } from "@/lib/role-context"
import { ShieldCheck, User, Shield, Heart, Eye, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const ROLE_ICONS: Record<DemoRole, React.ReactNode> = {
  citizen: <User className="w-8 h-8 text-blue-500" />,
  officer: <Shield className="w-8 h-8 text-civic-green-600" />,
  ngo: <Heart className="w-8 h-8 text-purple-500" />,
  public: <Eye className="w-8 h-8 text-gray-500" />,
}

const ROLE_COLORS: Record<DemoRole, { selected: string; icon_bg: string }> = {
  citizen: { selected: "border-blue-500 bg-blue-50/60", icon_bg: "bg-blue-100" },
  officer: { selected: "border-civic-green-500 bg-civic-green-50/60", icon_bg: "bg-civic-green-100" },
  ngo: { selected: "border-purple-500 bg-purple-50/60", icon_bg: "bg-purple-100" },
  public: { selected: "border-gray-400 bg-gray-50/80", icon_bg: "bg-gray-100" },
}

const ROLES: DemoRole[] = ["citizen", "officer", "ngo", "public"]

export default function WelcomePage() {
  const router = useRouter()
  const { setRole } = useRole()
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null)

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole)
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-civic-green-50/30 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-civic-green-600 flex items-center justify-center shadow-lg shadow-civic-green-600/20">
              <ShieldCheck size={36} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Who are you?
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Welcome to Mysuru Janseva — Mysuru&apos;s Civic Issue Reporting Platform
          </p>
          <p className="text-sm text-gray-500 pt-1 font-medium">
            Select your role to get started:
          </p>
        </div>

        {/* Track 1: CIVIC / PUBLIC */}
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Civic / Public Track
            </span>
            <span className="text-xs text-gray-500">Citizen reporting & public observation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {(["citizen", "public"] as DemoRole[]).map((roleKey) => {
              const config = ROLE_CONFIG[roleKey]
              const isSelected = selectedRole === roleKey
              return (
                <button
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  type="button"
                  className={cn(
                    "relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left group",
                    isSelected
                      ? ROLE_COLORS[roleKey].selected
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn("p-2.5 rounded-xl shrink-0", ROLE_COLORS[roleKey].icon_bg)}>
                      {ROLE_ICONS[roleKey]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900">{config.label}</h3>
                        <span className="text-[10px] font-medium text-gray-400">({config.subtitle})</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={20} className="text-civic-green-600" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Track 2: OPERATIONS */}
        <div className="w-full space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-civic-green-700 bg-civic-green-50 px-2.5 py-1 rounded-md border border-civic-green-200">
              Operations Track
            </span>
            <span className="text-xs text-gray-500">Field remediation, claims & verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {(["officer", "ngo"] as DemoRole[]).map((roleKey) => {
              const config = ROLE_CONFIG[roleKey]
              const isSelected = selectedRole === roleKey
              return (
                <button
                  key={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  type="button"
                  className={cn(
                    "relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left group",
                    isSelected
                      ? ROLE_COLORS[roleKey].selected
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn("p-2.5 rounded-xl shrink-0", ROLE_COLORS[roleKey].icon_bg)}>
                      {ROLE_ICONS[roleKey]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900">{config.label}</h3>
                        <span className="text-[10px] font-medium text-gray-400">({config.subtitle})</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={20} className="text-civic-green-600" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-sm flex flex-col items-center gap-4 pt-4">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            type="button"
            className={cn(
              "w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-sm",
              selectedRole
                ? "bg-civic-green-600 text-white hover:bg-civic-green-700 hover:shadow-md active:scale-[0.99]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            CONTINUE
          </button>
          <p className="text-xs text-gray-400 text-center">
            This is a demo role selector. You can switch roles anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
