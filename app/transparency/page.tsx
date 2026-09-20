"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart3,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { mockTransparencyService, mockReportsService } from "@/lib/mock-data"
import { type TransparencyStats } from "@/lib/types"
import { StatusBadge } from "@/components/shared/StatusBadge"

export default function TransparencyPage() {
  const [stats, setStats] = useState<TransparencyStats>(() => mockTransparencyService.getStats())

  useEffect(() => {
    // Recalculate based on current live reports in service
    const currentReports = mockReportsService.getReports()
    setStats(mockTransparencyService.getStats())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-800">
                  <BarChart3 size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Public Transparency Portal
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open Data
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Real-time municipal performance, ward-level SLA compliance, and civic resolution metrics for Mysuru
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors"
              >
                Operations Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Reports</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{stats.totalReports}</p>
            <p className="text-xs text-gray-400 mt-1">Across all 21 Wards</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved & Verified</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.verified}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              {Math.round((stats.verified / (stats.totalReports || 1)) * 100)}% resolution rate
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Avg Resolution Time</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{stats.averageResolutionHours}h</p>
            <p className="text-xs text-blue-700 font-semibold mt-1">Under 48h SLA baseline</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">SLA Overdue</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{stats.overdue}</p>
            <p className="text-xs text-rose-600 font-semibold mt-1">Escalated for priority</p>
          </div>
        </section>

        {/* Resolution Breakdown & Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resolution Actors Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Resolution Breakdown by Actor</h2>
              <span className="text-xs font-semibold text-gray-500">Government vs NGO/Civic</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-700">Mysuru Municipal Corporation (MCC)</span>
                  <span className="text-blue-700">{stats.governmentResolutions} issues ({Math.round((stats.governmentResolutions / (stats.verified || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((stats.governmentResolutions / (stats.verified || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-700">NGOs & Civic Action Collectives</span>
                  <span className="text-emerald-700">{stats.ngoCommunityResolutions} issues ({Math.round((stats.ngoCommunityResolutions / (stats.verified || 1)) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((stats.ngoCommunityResolutions / (stats.verified || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">Cooperative Public Sanitation Framework</p>
                <p>
                  Issues are dynamically routed to both the municipal sanitation workforce and verified civil society partners, ensuring rapid turnaround on chronic garbage dumps and public waste.
                </p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Complaint Lifecycle Distribution</h2>
              <span className="text-xs font-semibold text-gray-500">Live Statuses</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.statusDistribution.map((item) => (
                <div key={item.status} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div>
                    <StatusBadge status={item.status} size="sm" />
                    <p className="text-lg font-black text-gray-900 mt-1">{item.count}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward-level Performance Table */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Ward Performance & SLA Compliance</h2>
              <p className="text-xs text-gray-500 mt-0.5">Performance index across all 21 administrative wards of Mysuru</p>
            </div>
            <Link
              href="/"
              className="text-xs text-civic-green-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore on Map</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <th className="py-3 px-4">Ward</th>
                  <th className="py-3 px-4">Total Reports</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4">Open</th>
                  <th className="py-3 px-4">Overdue</th>
                  <th className="py-3 px-4">Avg SLA Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.wardStatistics.slice(0, 10).map((ward) => (
                  <tr key={ward.wardNumber} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{ward.wardName}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{ward.reports}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{ward.resolved}</td>
                    <td className="py-3 px-4 text-red-600 font-semibold">{ward.open}</td>
                    <td className="py-3 px-4 text-rose-600 font-semibold">{ward.overdue}</td>
                    <td className="py-3 px-4 text-gray-600">{ward.avgResolutionHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
