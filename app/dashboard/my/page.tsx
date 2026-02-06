"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { LogOut, Clock, Target, TrendingUp, AlertCircle, Zap, Menu, X } from "lucide-react"

const COLORS = ["#f16a21", "#2d307a", "#979897", "#f79021", "#10B981"]

function YourTimeTrackerCard({
  totalHours,
  categories,
  dateLabel,
}: {
  totalHours: number
  categories: { name: string; hours: number }[]
  dateLabel: string
}) {
  const maxHours = Math.max(...categories.map((c) => c.hours), 1)
  return (
    <div className="platform-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">T</span>
            </div>
            <h3 className="text-lg font-bold text-[#404040]">Time Tracker</h3>
          </div>
          <p className="text-sm text-gray-500">Your logged hours • {dateLabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your total</p>
          <p className="text-2xl font-bold mt-1 text-[#979897]">{totalHours.toFixed(1)}h</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold text-[#404040] mt-1">{categories.length}</p>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your hours by category</p>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No time entries in this date range.</p>
        ) : (
          categories.map((cat, idx) => {
            const pct = (cat.hours / maxHours) * 100
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 truncate pr-2">{cat.name || "Uncategorized"}</p>
                  <span className="text-xs font-bold text-gray-600 shrink-0">{cat.hours.toFixed(1)}h</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function AsanaCard({ estimatedHours, loading, dateLabel }: { estimatedHours: number | null; loading: boolean; dateLabel: string }) {
  return (
    <div className="platform-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">A</span>
            </div>
            <h3 className="text-lg font-bold text-[#404040]">Asana (your projects)</h3>
          </div>
          <p className="text-sm text-gray-500">Estimated vs your actual • {dateLabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total estimated (selected)</p>
          {loading ? (
            <p className="text-2xl font-bold mt-1 text-gray-400">Loading...</p>
          ) : estimatedHours !== null ? (
            <p className="text-2xl font-bold mt-1 text-[#f16a21]">{estimatedHours.toFixed(1)}h</p>
          ) : (
            <p className="text-2xl font-bold mt-1 text-gray-400">—</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Source</p>
        <p className="text-sm text-gray-600">
          ManHours Estimate (direct) or Mandays Estimate × 8 (converted to hours)
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Calculated per project from Asana task custom fields
        </p>
      </div>
    </div>
  )
}

function PlatformVariancePlaceholder({ title, color, icon, description }: { title: string; color: string; icon: string; description: string }) {
  return (
    <div className="platform-card opacity-90 border border-dashed border-gray-300 bg-gray-50/50">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200">
          <span className="text-lg font-bold" style={{ color }}>{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-[#404040]">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <p className="text-sm text-gray-400 italic">Connect to see your variance</p>
    </div>
  )
}

interface Timelog {
  row_id: string
  date: string
  starttime: string
  endtime: string
  calculated_hours: number
  category_id: number | null
  category_name: string | null
  project_name: string
  asana_project_gid: string
  user_name: string
  user_email: string
}

interface TimelogGroup {
  date: string
  logs: Timelog[]
  total_hours: number
}

function defaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export default function UserDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [todayLogged, setTodayLogged] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [timelogs, setTimelogs] = useState<Timelog[]>([])
  const [groupedTimelogs, setGroupedTimelogs] = useState<TimelogGroup[]>([])
  const [timelogSummary, setTimelogSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(defaultDateRange)
  const [asanaEstimatedHours, setAsanaEstimatedHours] = useState<number | null>(null)
  const [asanaLoading, setAsanaLoading] = useState(false)
  const [userVarianceLoading, setUserVarianceLoading] = useState(false)
  const [userVarianceError, setUserVarianceError] = useState<string | null>(null)
  const [userVarianceProjects, setUserVarianceProjects] = useState<any[]>([])
  const [userVarianceSummary, setUserVarianceSummary] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/auth/login")
      return
    }
    const userData = JSON.parse(session)
    setUserEmail(userData.email)
    setUserName(userData.name ?? userData.email?.split("@")[0] ?? null)
    fetchUserTimelogs(userData.email, dateRange.startDate, dateRange.endDate)
    fetchUserVariance(userData.email, dateRange.startDate, dateRange.endDate)
  }, [router])

  const fetchUserVariance = async (email: string, startDate: string, endDate: string) => {
    try {
      setUserVarianceLoading(true)
      setUserVarianceError(null)
      const response = await fetch(
        `/api/projects/variance/user?email=${encodeURIComponent(email)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      )
      const data = await response.json()
      
      if (data.success) {
        setUserVarianceProjects(data.projects || [])
        setUserVarianceSummary(data.summary || null)
        // Use variance API's estimated total (keeps this aligned with org dashboard logic)
        const totalEstimated = (data.summary?.total_estimated_hours ?? 0) as number
        setAsanaEstimatedHours(Math.round(Number(totalEstimated) * 100) / 100)
      } else {
        setUserVarianceError(data.error || "Failed to load your project variance")
        setUserVarianceProjects([])
        setUserVarianceSummary(null)
        setAsanaEstimatedHours(null)
      }
    } catch (error) {
      console.error("Error fetching user variance:", error)
      setUserVarianceError("Failed to load your project variance")
      setUserVarianceProjects([])
      setUserVarianceSummary(null)
      setAsanaEstimatedHours(null)
    } finally {
      setUserVarianceLoading(false)
    }
  }

  const applyDateRange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end })
    if (userEmail) {
      setLoading(true)
      fetchUserTimelogs(userEmail, start, end).finally(() => setLoading(false))
      fetchUserVariance(userEmail, start, end)
    }
  }

  const fetchUserTimelogs = async (email: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      let url = `/api/db/timelogs/user?email=${encodeURIComponent(email)}`
      if (startDate && endDate) {
        url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      }
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setTimelogs(data.timelogs)
        setGroupedTimelogs(data.grouped_by_date)
        setTimelogSummary(data.summary)
        const today = new Date().toISOString().split("T")[0]
        const todayLogs = (data.timelogs || []).filter((log: Timelog) => log.date === today)
        const todayTotal = todayLogs.reduce((sum: number, log: Timelog) => sum + log.calculated_hours, 0)
        setTodayLogged(Math.round(todayTotal * 100) / 100)
      } else {
        console.error("Failed to fetch timelogs:", data.error)
      }
    } catch (error) {
      console.error("Error fetching user timelogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    router.push("/")
  }

  // Close the menu on outside click / Escape
  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest("[data-header-menu-root='true']")) return
      setIsMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("pointerdown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("pointerdown", onPointerDown)
    }
  }, [isMenuOpen])

  if (!userEmail || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your timelogs...</p>
        </div>
      </div>
    )
  }

  const weeklyFromUserLogs = (() => {
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const map: Record<string, number> = {}
    dayOrder.forEach((d) => (map[d] = 0))
    groupedTimelogs.forEach((g) => {
      const d = new Date(g.date + "T00:00:00")
      const day = dayOrder[d.getDay()]
      map[day] = (map[day] || 0) + g.total_hours
    })
    return dayOrder.map((day) => ({ day, logged: Math.round(map[day] * 100) / 100 }))
  })()

  const yourActivityHours = (() => {
    const map: Record<string, number> = {}
    timelogs.forEach((log) => {
      const name = log.category_name || "Uncategorized"
      map[name] = (map[name] || 0) + (log.calculated_hours || 0)
    })
    return Object.entries(map)
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours)
  })()

  const yourCategoriesCount = yourActivityHours.length
  const yourTotalInRange = timelogSummary?.total_hours ?? 0
  const dateLabel = `${dateRange.startDate} → ${dateRange.endDate}`
  const welcomeName = userName || userEmail?.split("@")[0] || "there"

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200 group-hover:scale-105">
                <img src="/Service IT Logo Remake.avif" alt="Service IT+ logo" className="w-8 h-8 object-contain" />
              </div>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4" data-header-menu-root="true">
              <div className="text-sm text-right hidden lg:block">
                <p className="text-orange-100 text-xs font-medium">Signed in as</p>
                <p className="font-semibold text-white">{userName || userEmail}</p>
              </div>
              <div className="flex items-center gap-2 relative">
                {/* Navigation */}
                <Button asChild variant="ghost" className="hidden lg:inline-flex h-9 px-4 text-white hover:bg-white/10 border-0 font-medium">
                  <Link href="/dashboard/variance">Variance</Link>
                </Button>

                {/* Navigation menu removed for security */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hidden text-white hover:bg-white/10"
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white text-[#404040] shadow-xl ring-1 ring-black/10 overflow-hidden lg:hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{userName || userEmail}</p>
                    </div>
                    <div className="p-2">
                      {/* Navigation links removed for security */}
                    </div>
                  </div>
                )}

                {/* Logout: compact on small screens */}
                <Button onClick={handleLogout} variant="ghost" className="h-9 px-3 sm:px-4 text-white hover:bg-white/10 border-0 font-medium">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-4xl font-bold text-[#404040]">Welcome back, {welcomeName}!</h2>
              <p className="text-gray-600 mt-2">Your personal dashboard • Time Tracker, Asana &amp; Ivanti variance</p>
            </div>
          </div>
        </div>

        {todayLogged < 8 && (
          <div className="flex gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl mb-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">Your time tracking reminder</p>
              <p className="text-sm text-amber-700">
                You&apos;ve logged <span className="font-bold">{todayLogged}h</span> today. Your target is <span className="font-bold">8 hours</span>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Your today</p>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{todayLogged}h</p>
            <p className="text-xs text-gray-500 mt-2">Of your 8h target</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Your total hours</p>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">{timelogSummary?.total_hours ?? 0}h</p>
            <p className="text-xs text-gray-500 mt-2">In selected range</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Your entries</p>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{timelogSummary?.total_entries ?? 0}</p>
            <p className="text-xs text-gray-500 mt-2">Time entries</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Your categories</p>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">{yourCategoriesCount}</p>
            <p className="text-xs text-gray-500 mt-2">In selected range</p>
          </div>
        </div>

        {/* Platform variance — your Time Tracker + Asana / Ivanti placeholders */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-[#404040]">Your platform variance</h3>
              <p className="text-gray-600 mt-2">Time Tracker (your data) vs Asana &amp; Ivanti • {dateLabel}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Date range</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v && dateRange.endDate && v <= dateRange.endDate)
                      setDateRange((r) => ({ ...r, startDate: v }))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-[#404040] text-sm font-medium"
                />
                <span className="text-gray-500">→</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v && dateRange.startDate && dateRange.startDate <= v)
                      setDateRange((r) => ({ ...r, endDate: v }))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-[#404040] text-sm font-medium"
                />
                <Button
                  size="sm"
                  onClick={() => applyDateRange(dateRange.startDate, dateRange.endDate)}
                  className="bg-[#f16a21] hover:bg-[#f79021] text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <YourTimeTrackerCard
              totalHours={yourTotalInRange}
              categories={yourActivityHours}
              dateLabel={dateLabel}
            />
            <AsanaCard
              estimatedHours={asanaEstimatedHours}
              loading={userVarianceLoading}
              dateLabel={dateLabel}
            />
            <PlatformVariancePlaceholder
              title="Ivanti"
              color="#2d307a"
              icon="I"
              description="IT support • estimated vs actual"
            />
          </div>

          <div className="premium-card p-6">
            <h4 className="text-lg font-bold text-[#404040] mb-6">Your summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Your logged (Time Tracker)</span>
                <span className="text-2xl font-bold text-[#404040]">{Number(yourTotalInRange).toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Asana estimated (your projects)</span>
                <span className="text-2xl font-bold text-orange-600">
                  {asanaEstimatedHours !== null ? `${asanaEstimatedHours.toFixed(1)}h` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Asana actual (you)</span>
                <span className="text-2xl font-bold text-blue-600">
                  {userVarianceSummary ? `${Number(userVarianceSummary.total_actual_hours ?? 0).toFixed(1)}h` : '—'}
                </span>
              </div>
            </div>
            {userVarianceSummary && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                  Projects: <span className="font-semibold">{userVarianceSummary.total_projects ?? 0}</span>
                </span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                  Projects with actual: <span className="font-semibold">{userVarianceSummary.projects_with_actual ?? 0}</span>
                </span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                  Variance:{" "}
                  <span className={`font-semibold ${Number(userVarianceSummary.total_variance_hours ?? 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {Number(userVarianceSummary.total_variance_hours ?? 0) >= 0 ? "+" : ""}
                    {Number(userVarianceSummary.total_variance_hours ?? 0).toFixed(1)}h
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Your project variance (aligned with org dashboard) */}
          <div className="premium-card p-6 mt-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h4 className="text-lg font-bold text-[#404040]">Your project variance (Asana)</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Estimated vs your actual hours (matched by reference_number and/or company_id) • {dateLabel}
                </p>
              </div>
            </div>

            {userVarianceError && (
              <div className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{userVarianceError}</p>
              </div>
            )}

            {userVarianceLoading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading your project variance...</p>
              </div>
            ) : userVarianceProjects.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-600">No project variance found for this range.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tip: ensure your timelogs have either reference_number (Asana project GID) or company_id.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userVarianceProjects.slice(0, 15).map((p: any) => (
                  <div key={p.asana_project_gid} className="border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                    <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#404040] truncate">
                          {p.asana_project_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-full">
                            {p.entry_count ?? 0} entries
                          </span>
                          {p.matched_by && (
                            <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-full">
                              matched: {p.matched_by}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Estimated</p>
                          <p className="text-lg font-bold text-orange-600">{Number(p.estimated_hours ?? 0).toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Actual (you)</p>
                          <p className="text-lg font-bold text-emerald-600">{Number(p.actual_hours ?? 0).toFixed(1)}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Variance</p>
                          <p className={`text-lg font-bold ${Number(p.variance_hours ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {Number(p.variance_hours ?? 0) >= 0 ? "+" : ""}
                            {Number(p.variance_hours ?? 0).toFixed(1)}h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {userVarianceProjects.length > 15 && (
                  <p className="text-xs text-gray-500 pt-2">
                    Showing top 15 by absolute variance (of {userVarianceProjects.length}).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Your task distribution — your categories only */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-[#404040] mb-2">Your task distribution</h3>
            <p className="text-sm text-gray-600 mb-6">Your hours by category • {dateLabel}</p>
            {yourActivityHours.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No category data in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={yourActivityHours.map((c) => ({ name: c.name, value: c.hours }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}h`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {yourActivityHours.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}h`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Your weekly trend */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-[#404040] mb-2">Your weekly pattern</h3>
            <p className="text-sm text-gray-600 mb-6">Your logged hours by day of week • {dateLabel}</p>
            {weeklyFromUserLogs.every((d) => d.logged === 0) ? (
              <p className="text-center text-gray-500 py-8">No time logged in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyFromUserLogs} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`${Number(v).toFixed(1)}h`, "Logged"]} />
                  <Legend />
                  <Line type="monotone" dataKey="logged" stroke="#f16a21" strokeWidth={2} name="Logged Hours" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Your Time Logs */}
        <div className="premium-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#404040] mb-2">Your time logs</h3>
              <p className="text-sm text-gray-600">Your entries from Time Tracker • {dateLabel}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && dateRange.endDate && v <= dateRange.endDate) setDateRange((r) => ({ ...r, startDate: v }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  const v = e.target.value
                  if (v && dateRange.startDate && dateRange.startDate <= v) setDateRange((r) => ({ ...r, endDate: v }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              />
              <Button
                size="sm"
                onClick={() => applyDateRange(dateRange.startDate, dateRange.endDate)}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true)
                  fetchUserTimelogs(userEmail!, dateRange.startDate, dateRange.endDate).finally(() => setLoading(false))
                }}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>

          {timelogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No time logs in this range</p>
              <p className="text-sm text-gray-400 mt-1">Your entries will appear here when you log time</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTimelogs.map((group) => (
                <div key={group.date} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#404040]">
                        {new Date(group.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">{group.logs.length} entries</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 uppercase font-semibold">Total</p>
                      <p className="text-xl font-bold text-orange-600">{group.total_hours.toFixed(2)}h</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left font-semibold text-gray-700 py-3 px-6">Category</th>
                          <th className="text-left font-semibold text-gray-700 py-3 px-4">Start</th>
                          <th className="text-left font-semibold text-gray-700 py-3 px-4">End</th>
                          <th className="text-center font-semibold text-gray-700 py-3 px-4">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.logs.map((log) => (
                          <tr key={log.row_id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              {log.category_name ? (
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                  {log.category_name}
                                </span>
                              ) : (
                                <span className="italic text-gray-400 text-sm">No category</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-gray-700 font-mono text-xs">{log.starttime}</td>
                            <td className="py-4 px-4 text-gray-700 font-mono text-xs">{log.endtime}</td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                                {log.calculated_hours.toFixed(2)}h
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shadow-sm ring-1 ring-orange-100 overflow-hidden">
                <img src="/SERVICEITLOGO.png" alt="Service IT+ logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold tracking-wide text-[#404040]">
                  Service IT+
                </p>
                <p className="text-xs text-gray-500">
                  © 2025 Service IT+. All rights reserved.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
              <Link href="/dashboard/reports" className="hover:text-[#404040] transition-colors">
                Reports
              </Link>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
              <Link href="/dashboard/tasks" className="hover:text-[#404040] transition-colors">
                Tasks
              </Link>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
              <Link href="/" className="hover:text-[#404040] transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
