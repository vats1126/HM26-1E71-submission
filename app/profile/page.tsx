"use client"

import React from "react"
import Link from "next/link"
import {
  User,
  ShieldCheck,
  Award,
  Star,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  CheckCircle2,
} from "lucide-react"
import { getCurrentUser, mockReportsService } from "@/lib/mock-data"

export default function ProfilePage() {
  const user = getCurrentUser()
  const userReports = mockReportsService.getReports().filter((r) => r.reporter.id === user.id)

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header Profile Card */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-civic-green-100 text-civic-green-700 font-extrabold text-2xl flex items-center justify-center border-2 border-civic-green-300 overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name[0]
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-civic-green-50 text-civic-green-700 border border-civic-green-200 text-xs font-bold self-center sm:self-auto">
                  Citizen Level 2
                </span>
              </div>
              <p className="text-xs text-gray-500">{user.email} · Member since August 2025</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="text-orange-600 font-black text-sm">{user.points}</span>
                  <span className="text-gray-500 font-normal">Civic Points</span>
                </div>
                <div className="w-px h-3.5 bg-gray-200" />
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="text-civic-green-600 font-black text-sm">{user.trustScore}%</span>
                  <span className="text-gray-500 font-normal">Trust Score</span>
                </div>
                <div className="w-px h-3.5 bg-gray-200" />
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="text-blue-600 font-black text-sm">{user.reportsSubmitted}</span>
                  <span className="text-gray-500 font-normal">Reports Filed</span>
                </div>
              </div>
            </div>

            <Link
              href="/report"
              className="px-4 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Badges Earned */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">Earned Badges & Recognition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {user.badges.map((badge, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{badge.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* User Submitted Reports */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Your Civic Reports</h2>
            <span className="text-xs text-gray-500">{userReports.length} total</span>
          </div>

          <div className="divide-y divide-gray-100">
            {userReports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.publicId}`}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors block"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-700">{report.publicId}</span>
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {report.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{report.wardName} · Logged {new Date(report.capturedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-civic-green-700">View Status →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
