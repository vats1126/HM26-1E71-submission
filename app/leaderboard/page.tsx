"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Users,
  Award,
  ShieldCheck,
  Star,
  Flame,
  TrendingUp,
  Building2,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { mockLeaderboardService, getCurrentUser } from "@/lib/mock-data"
import { type LeaderboardEntry, type NGOLeaderboardEntry } from "@/lib/types"

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"citizens" | "ngos">("citizens")
  const citizenLeaders = mockLeaderboardService.getCitizenLeaderboard()
  const ngoLeaders = mockLeaderboardService.getNGOLeaderboard()
  const currentUser = getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-800">
                  <Award size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Civic Leaderboard & Recognition
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Season 1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Recognizing active Mysuru citizens, ward champions, and civic cleanup organizations
              </p>
            </div>

            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-civic-green-600 hover:bg-civic-green-700 text-white text-xs font-bold transition-colors shadow-sm self-start md:self-auto"
            >
              <Plus size={15} />
              <span>Report Issue & Earn Points</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Toggle between Citizen Champions and NGO Collectives */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 max-w-sm shadow-xs">
          <button
            onClick={() => setTab("citizens")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "citizens" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Citizen Champions
          </button>
          <button
            onClick={() => setTab("ngos")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "ngos" ? "bg-gray-900 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            NGO & Civic Groups
          </button>
        </div>

        {/* Citizen Leaderboard */}
        {tab === "citizens" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Top Civic Reporters</h2>
              <span className="text-xs text-gray-400">Updated Hourly</span>
            </div>

            <div className="divide-y divide-gray-100">
              {citizenLeaders.map((entry) => {
                const isCurrent = entry.user.id === currentUser.id
                return (
                  <div
                    key={entry.rank}
                    className={`p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50/80 transition-colors ${
                      isCurrent ? "bg-civic-green-50/50" : ""
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-8 flex items-center justify-center font-black text-sm text-gray-700">
                      {entry.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </div>

                    {/* Avatar & User Details */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-civic-green-100 text-civic-green-800 font-bold flex items-center justify-center shrink-0 overflow-hidden border border-civic-green-200">
                        {entry.user.avatar ? (
                          <img src={entry.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          entry.user.name[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-gray-900 truncate">{entry.user.name}</p>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-civic-green-100 text-civic-green-800">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {entry.reports} reports · {entry.followUps} follow-ups · Trust {entry.trustScore}%
                        </p>
                      </div>
                    </div>

                    {/* Points Total */}
                    <div className="text-right shrink-0">
                      <p className="text-base sm:text-lg font-black text-gray-900">
                        {entry.points.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        Points
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* NGO Leaderboard */}
        {tab === "ngos" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ngoLeaders.map((ngo) => (
              <div
                key={ngo.rank}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-black flex items-center justify-center text-sm">
                    #{ngo.rank}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    Verified NGO
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-900">{ngo.organization}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{ngo.members} Active Volunteers</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Resolved</span>
                    <span className="font-black text-sm text-gray-800">{ngo.resolvedIssues}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px]">Bounties</span>
                    <span className="font-black text-sm text-orange-600">{ngo.bountiesCompleted}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Cleanup Score</span>
                  <span className="text-lg font-black text-civic-green-700">{ngo.cleanupPoints} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
