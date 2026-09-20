"use client"

import React from "react"
import Link from "next/link"
import { FileText, Plus, Clock, ExternalLink } from "lucide-react"
import { getCurrentUser, mockReportsService } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { STATUS_CONFIG } from "@/lib/types"

export default function MyReportsPage() {
  const user = getCurrentUser()
  const allReports = mockReportsService.getReports()
  const myReports = allReports.filter((r) => r.reporter.id === user.id)

  const statusCounts = {
    total: myReports.length,
    open: myReports.filter((r) => r.status === "OPEN" || r.status === "REOPENED").length,
    inProgress: myReports.filter((r) => r.status === "CLAIMED" || r.status === "CLEANUP_IN_PROGRESS").length,
    resolved: myReports.filter((r) => r.status === "VERIFIED").length,
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <FileText size={22} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">My Reports</h1>
                <p className="text-xs text-gray-500">
                  Track all your submitted civic reports
                </p>
              </div>
            </div>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span>New Report</span>
            </Link>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: "Total", value: statusCounts.total, color: "text-gray-900" },
              { label: "Open", value: statusCounts.open, color: "text-status-orange-600" },
              { label: "In Progress", value: statusCounts.inProgress, color: "text-blue-600" },
              { label: "Resolved", value: statusCounts.resolved, color: "text-civic-green-600" },
            ].map((s) => (
              <div key={s.label} className="text-center py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Reports list */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        {myReports.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-700">No reports yet</h3>
            <p className="text-xs text-gray-500 mt-1">Submit your first civic report to start tracking.</p>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold"
            >
              <Plus size={14} /> Report an Issue
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Report ID</div>
              <div className="col-span-3">Issue</div>
              <div className="col-span-2">Ward</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Last Update</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-100">
              {myReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/report/${report.publicId}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                    <div className="col-span-2">
                      <span className="font-mono text-xs font-bold text-gray-700">{report.publicId}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-semibold text-gray-900 truncate block">
                        {report.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-600">{report.wardName}</span>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="text-xs font-bold text-civic-green-600">View →</span>
                    </div>
                  </div>
                  {/* Mobile card */}
                  <div className="sm:hidden p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-700">{report.publicId}</span>
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {report.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.wardName}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
