"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
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
  AreaChart,
  Area,
} from "recharts"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  BarChart3,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
} from "lucide-react"

const COLORS = ["#f16a21", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#f79021", "#2d307a"]

interface ProjectAnalytics {
  project: {
    gid: string
    name: string
    created_at: string
    modified_at: string
    owner: string | null
  }
  date_filter?: {
    startDate: string
    endDate: string
  }
  previous_date_filter?: {
    startDate: string
    endDate: string
  }
  summary: {
    estimated_hours: number
    actual_hours: number
    variance_hours: number
    completion_percentage: number
    status: 'under_budget' | 'over_budget' | 'on_track'
    total_timelog_entries: number
    unique_contributors: number
    total_tasks: number
    completed_tasks: number
    completion_rate: number
  }
  previous_summary?: {
    actual_hours: number
    total_timelog_entries: number
    unique_contributors?: number
  }
  time_series: Array<{ date: string; hours: number }>
  weekly_breakdown: Array<{ week: string; hours: number }>
  contributors: Array<{ name: string; email: string; hours: number; entries: number }>
  categories: Array<{ name: string; hours: number }>
  tasks: Array<{ gid: string; name: string; estimated: number; completed: boolean }>
  timelogs: any[]
  user_activity: Array<{
    name: string
    email: string
    total_hours: number
    total_entries: number
    entries: Array<{
      date: string
      hours: number
      category: string
      task_description?: string
      starttime?: string
      endtime?: string
      notes?: string
    }>
    categories: Array<{ name: string; hours: number }>
    daily_breakdown: Array<{ date: string; hours: number }>
  }>
}

function isoDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00")
  d.setDate(d.getDate() + days)
  return isoDateOnly(d)
}

function formatRangeLabel(start: string, end: string): string {
  // keep it compact: Jan 02 → Jan 31
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" })
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" })
  return `${s} → ${e}`
}

function deltaMeta(current: number, previous: number | null | undefined) {
  if (previous === null || previous === undefined || !Number.isFinite(previous)) return null
  const diff = current - previous
  const pct = previous === 0 ? null : (diff / previous) * 100
  return { diff, pct }
}

function Sparkline({ data, color }: { data: Array<{ date: string; hours: number }>; color: string }) {
  const points = (data || []).slice(-30)
  if (points.length < 2) return null
  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line type="monotone" dataKey="hours" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function startOfWeekISO(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00")
  if (Number.isNaN(d.getTime())) return dateISO
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - day)
  return isoDateOnly(d)
}

export default function ProjectAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const projectGid = params.projectGid as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProjectAnalytics | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(() => {
    const end = isoDateOnly(new Date())
    const start = addDaysISO(end, -29)
    return { startDate: start, endDate: end }
  })

  useEffect(() => {
    fetchAnalytics()
  }, [projectGid])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const qs = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      const response = await fetch(`/api/projects/${projectGid}/analytics?${qs.toString()}`)
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between text-white">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img src="/Service IT Logo Remake.avif" alt="Service IT+" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Project Analytics</h1>
                  <p className="text-xs text-orange-100">Loading...</p>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-[#f16a21] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading project analytics...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between text-white">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img src="/Service IT Logo Remake.avif" alt="Service IT+" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Project Analytics</h1>
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold mb-2">Failed to load analytics</p>
              <p className="text-sm text-gray-500 mb-4">{error || 'Unknown error'}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={fetchAnalytics} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="default">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { project, summary, time_series, weekly_breakdown, contributors, categories, tasks, user_activity, date_filter, previous_date_filter, previous_summary } = data

  const activeRangeLabel = date_filter?.startDate && date_filter?.endDate
    ? formatRangeLabel(date_filter.startDate, date_filter.endDate)
    : formatRangeLabel(dateRange.startDate, dateRange.endDate)

  const prevRangeLabel = previous_date_filter?.startDate && previous_date_filter?.endDate
    ? formatRangeLabel(previous_date_filter.startDate, previous_date_filter.endDate)
    : null

  const actualDelta = deltaMeta(summary.actual_hours, previous_summary?.actual_hours ?? null)
  const entriesDelta = deltaMeta(summary.total_timelog_entries, previous_summary?.total_timelog_entries ?? null)
  const contribDelta = deltaMeta(summary.unique_contributors, previous_summary?.unique_contributors ?? null)
  const prevVariance = previous_summary?.actual_hours !== undefined ? (summary.estimated_hours - previous_summary.actual_hours) : null
  const varianceDelta = deltaMeta(summary.variance_hours, prevVariance)

  // --- Linked interactions (click-to-filter) ---
  const allEntries = user_activity.flatMap((u) =>
    (u.entries || []).map((e) => ({
      email: u.email,
      name: u.name,
      date: e.date,
      hours: e.hours,
      category: e.category,
      task_description: e.task_description,
      starttime: e.starttime,
      endtime: e.endtime,
      notes: e.notes,
    }))
  )

  const filteredEntries = allEntries.filter((e) => {
    if (selectedUserEmail && e.email !== selectedUserEmail) return false
    if (selectedCategory && e.category !== selectedCategory) return false
    return true
  })

  const filteredTimeSeries = (() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((e) => map.set(e.date, (map.get(e.date) || 0) + (e.hours || 0)))
    return Array.from(map.entries())
      .map(([date, hours]) => ({ date, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })()

  const filteredWeekly = (() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((e) => {
      const wk = startOfWeekISO(e.date)
      map.set(wk, (map.get(wk) || 0) + (e.hours || 0))
    })
    return Array.from(map.entries())
      .map(([week, hours]) => ({ week, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => a.week.localeCompare(b.week))
  })()

  const filteredContributors = (() => {
    const map = new Map<string, { name: string; email: string; hours: number; entries: number }>()
    filteredEntries.forEach((e) => {
      if (!map.has(e.email)) map.set(e.email, { name: e.name, email: e.email, hours: 0, entries: 0 })
      const x = map.get(e.email)!
      x.hours += e.hours || 0
      x.entries += 1
    })
    return Array.from(map.values())
      .map((c) => ({ ...c, hours: Math.round(c.hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours)
  })()

  const filteredCategories = (() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((e) => map.set(e.category || "Uncategorized", (map.get(e.category || "Uncategorized") || 0) + (e.hours || 0)))
    return Array.from(map.entries())
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours)
  })()

  const userListForCards = selectedUserEmail
    ? user_activity.filter((u) => u.email === selectedUserEmail)
    : user_activity

  const filterLabelParts = [
    selectedUserEmail ? `User: ${selectedUserEmail}` : null,
    selectedCategory ? `Category: ${selectedCategory}` : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <img src="/Service IT Logo Remake.avif" alt="Service IT+" className="w-8 h-8 object-contain" />
                </div>
              </Link>
              <div>
                <h1 className="text-lg font-bold">Project Analytics</h1>
                <p className="text-xs text-orange-100 truncate max-w-md">{project.name}</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#404040] mb-2">{project.name}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {project.owner && (
              <>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.owner}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Filters (30-second view) */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Start date</p>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">End date</p>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = isoDateOnly(new Date())
                    setDateRange({ startDate: addDaysISO(end, -6), endDate: end })
                  }}
                >
                  Last 7d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = isoDateOnly(new Date())
                    setDateRange({ startDate: addDaysISO(end, -29), endDate: end })
                  }}
                >
                  Last 30d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const end = isoDateOnly(new Date())
                    setDateRange({ startDate: addDaysISO(end, -89), endDate: end })
                  }}
                >
                  Last 90d
                </Button>
                <Button
                  className="bg-[#f16a21] hover:bg-[#f79021] text-white"
                  size="sm"
                  onClick={fetchAnalytics}
                >
                  Apply
                </Button>
              </div>
            </div>

            {(date_filter?.startDate && previous_date_filter?.startDate) && (
              <p className="text-xs text-gray-500 mt-3">
                Showing <span className="font-semibold">{date_filter.startDate}</span> → <span className="font-semibold">{date_filter.endDate}</span>
                {previous_summary && (
                  <>
                    {" "}• Previous: <span className="font-semibold">{previous_date_filter?.startDate}</span> → <span className="font-semibold">{previous_date_filter?.endDate}</span>
                  </>
                )}
              </p>
            )}

            {/* Active filters */}
            {(selectedUserEmail || selectedCategory) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold text-gray-500 mr-1">Active:</p>
                {selectedUserEmail && (
                  <button
                    onClick={() => setSelectedUserEmail(null)}
                    className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                    title="Clear user filter"
                  >
                    {selectedUserEmail} ×
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                    title="Clear category filter"
                  >
                    {selectedCategory} ×
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedUserEmail(null)
                    setSelectedCategory(null)
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Estimated Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-3xl font-bold text-[#f16a21]">{summary.estimated_hours.toFixed(1)}h</p>
                  <p className="text-xs text-gray-500 mt-1">{activeRangeLabel}</p>
                </div>
                <Sparkline data={time_series} color="#f16a21" />
              </div>
              <p className="text-sm text-gray-600 mt-2">From Asana tasks (overall estimate)</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Actual Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-3xl font-bold text-emerald-600">{summary.actual_hours.toFixed(1)}h</p>
                  <p className="text-xs text-gray-500 mt-1">{activeRangeLabel}</p>
                </div>
                <Sparkline data={time_series} color="#10b981" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">{summary.total_timelog_entries} time entries</p>
                {actualDelta && prevRangeLabel && (
                  <p className={`text-xs font-semibold ${actualDelta.diff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {actualDelta.diff >= 0 ? "+" : ""}{actualDelta.diff.toFixed(1)}h
                    {actualDelta.pct !== null ? ` (${actualDelta.pct >= 0 ? "+" : ""}${actualDelta.pct.toFixed(0)}%)` : ""}
                    <span className="text-gray-400 font-normal"> vs {prevRangeLabel}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-sm ${summary.status === 'over_budget' ? 'border-red-100' : summary.status === 'under_budget' ? 'border-emerald-100' : 'border-gray-100'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                {summary.variance_hours >= 0 ? (
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                )}
                Variance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-3xl font-bold ${summary.variance_hours >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {summary.variance_hours >= 0 ? '+' : ''}{summary.variance_hours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activeRangeLabel}</p>
                </div>
                <Sparkline data={time_series} color={summary.variance_hours >= 0 ? "#10b981" : "#ef4444"} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600 capitalize">{summary.status.replace('_', ' ')}</p>
                {varianceDelta && prevRangeLabel && (
                  <p className={`text-xs font-semibold ${varianceDelta.diff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {varianceDelta.diff >= 0 ? "+" : ""}{varianceDelta.diff.toFixed(1)}h
                    <span className="text-gray-400 font-normal"> vs {prevRangeLabel}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-3xl font-bold text-blue-600">{summary.unique_contributors}</p>
                  <p className="text-xs text-gray-500 mt-1">{activeRangeLabel}</p>
                </div>
                {/* sparkline is still hours trend; useful context for this period */}
                <Sparkline data={time_series} color="#3b82f6" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Team members</p>
                {contribDelta && prevRangeLabel && (
                  <p className={`text-xs font-semibold ${contribDelta.diff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {contribDelta.diff >= 0 ? "+" : ""}{contribDelta.diff.toFixed(0)}
                    <span className="text-gray-400 font-normal"> vs {prevRangeLabel}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#f16a21]" />
              Progress Overview
            </CardTitle>
            <CardDescription>
              Completion: {summary.completion_percentage.toFixed(1)}% • Tasks: {summary.completed_tasks}/{summary.total_tasks} completed ({summary.completion_rate.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hours Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Hours Progress</span>
                  <span className="font-semibold">{summary.actual_hours.toFixed(1)}h / {summary.estimated_hours.toFixed(1)}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      summary.completion_percentage >= 100
                        ? 'bg-red-500'
                        : summary.completion_percentage >= 80
                        ? 'bg-orange-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, summary.completion_percentage)}%` }}
                  />
                </div>
              </div>

              {/* Task Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Task Completion</span>
                  <span className="font-semibold">{summary.completed_tasks} / {summary.total_tasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${summary.completion_rate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#f16a21]" />
                Hours Over Time
              </CardTitle>
              <CardDescription>
                Daily hours logged for this project
                {filterLabelParts.length > 0 ? ` • ${filterLabelParts.join(" • ")}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(filteredTimeSeries.length > 0 ? filteredTimeSeries : time_series).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredTimeSeries.length > 0 ? filteredTimeSeries : time_series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#f16a21"
                      fill="#f16a21"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No time data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#f16a21]" />
                Weekly Breakdown
              </CardTitle>
              <CardDescription>
                Hours logged per week
                {filterLabelParts.length > 0 ? ` • ${filterLabelParts.join(" • ")}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(filteredWeekly.length > 0 ? filteredWeekly : weekly_breakdown).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredWeekly.length > 0 ? filteredWeekly : weekly_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                      labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
                    />
                    <Bar dataKey="hours" fill="#f16a21" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No weekly data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contributor Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#f16a21]" />
                Contributor Breakdown
              </CardTitle>
              <CardDescription>
                Click a user to filter the page
                {selectedCategory ? ` • Category: ${selectedCategory}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(filteredContributors.length > 0 ? filteredContributors : contributors).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredContributors.length > 0 ? filteredContributors : contributors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']} />
                    <Bar
                      dataKey="hours"
                      fill="#f16a21"
                      radius={[0, 8, 8, 0]}
                      onClick={(payload: any) => {
                        const email = payload?.email
                        if (!email) return
                        setSelectedUserEmail((prev) => (prev === email ? null : email))
                      }}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No contributor data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#f16a21]" />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Click a category to filter the page
                {selectedUserEmail ? ` • User: ${selectedUserEmail}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(filteredCategories.length > 0 ? filteredCategories : categories).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredCategories.length > 0 ? filteredCategories : categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, hours }) => `${name}: ${hours}h`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="hours"
                      onClick={(payload: any) => {
                        const name = payload?.name
                        if (!name) return
                        setSelectedCategory((prev) => (prev === name ? null : name))
                      }}
                    >
                      {(filteredCategories.length > 0 ? filteredCategories : categories).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}h`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#f16a21]" />
                Tasks Overview
              </CardTitle>
              <CardDescription>
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.gid}
                    className={`p-3 rounded-lg border ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.name}
                          </p>
                          {task.estimated > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Estimated: {task.estimated.toFixed(1)}h
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Activity Section */}
        {user_activity && user_activity.length > 0 && (
          <Card>
            <CardHeader>
              <div className="text-left">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Users className="h-5 w-5 text-[#f16a21]" />
                  User Activity & Progress
                </CardTitle>
                <CardDescription className="text-left">
                  Track individual contributions and time entries for each team member
                </CardDescription>
              </div>
              {/* Search */}
              <div className="mt-4 relative text-left">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-left"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-left">
                {userListForCards
                  .filter(user => 
                    searchTerm === "" ||
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => {
                    const isExpanded = expandedUsers.has(user.email)
                    const percentage = summary.actual_hours > 0 
                      ? (user.total_hours / summary.actual_hours) * 100 
                      : 0

                    return (
                      <div
                        key={user.email}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* User Header */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={() => {
                            setExpandedUsers((prev) => {
                              const next = new Set(prev)
                              if (next.has(user.email)) next.delete(user.email)
                              else next.add(user.email)
                              return next
                            })
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setExpandedUsers((prev) => {
                                const next = new Set(prev)
                                if (next.has(user.email)) next.delete(user.email)
                                else next.add(user.email)
                                return next
                              })
                            }
                          }}
                          className="w-full p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer select-none outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f16a21] to-[#f79021] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">{user.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 text-left">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 ml-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total Hours</p>
                                <p className="text-xl font-bold text-[#f16a21]">{user.total_hours.toFixed(1)}h</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Entries</p>
                                <p className="text-xl font-bold text-gray-700">{user.total_entries}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Contribution</p>
                                <p className="text-xl font-bold text-blue-600">{percentage.toFixed(1)}%</p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="mt-4 text-left">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-[#f16a21] to-[#f79021] transition-all duration-500"
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUserEmail((prev) => (prev === user.email ? null : user.email))
                              }}
                              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                                selectedUserEmail === user.email
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                              title="Filter page to this user"
                            >
                              Focus user
                            </button>
                            {selectedCategory && (
                              <span className="text-xs text-gray-500">
                                Showing category: <span className="font-semibold">{selectedCategory}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6 text-left">
                            {/* Categories Breakdown */}
                            {user.categories.length > 0 && (
                              <div className="text-left">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 text-left">
                                  <Target className="h-4 w-4" />
                                  Work by Category
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {user.categories.map((cat, idx) => (
                                    <div
                                      key={cat.name}
                                      className="bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        <span className="text-sm font-bold text-[#f16a21]">{cat.hours.toFixed(1)}h</span>
                                      </div>
                                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="h-1.5 rounded-full transition-all"
                                          style={{
                                            width: `${(cat.hours / user.total_hours) * 100}%`,
                                            backgroundColor: COLORS[idx % COLORS.length]
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Daily Activity Chart */}
                            {user.daily_breakdown.length > 0 && (
                              <div className="text-left">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 text-left">
                                  <Calendar className="h-4 w-4" />
                                  Daily Activity Timeline
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <AreaChart data={user.daily_breakdown}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                      dataKey="date"
                                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                      formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="hours"
                                      stroke="#f16a21"
                                      fill="#f16a21"
                                      fillOpacity={0.3}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            )}

                            {/* Time Entries List */}
                            <div className="text-left">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 text-left">
                                <FileText className="h-4 w-4" />
                                Recent Time Entries ({user.entries.length})
                              </h4>
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {user.entries
                                  .filter((entry) => (selectedCategory ? entry.category === selectedCategory : true))
                                  .slice(0, 20)
                                  .map((entry, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 rounded-lg border border-gray-200 hover:border-[#f16a21] transition-colors text-left"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center gap-2 mb-1 text-left">
                                          <span className="text-xs font-medium text-gray-500">
                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric'
                                            })}
                                          </span>
                                          {entry.starttime && entry.endtime && (
                                            <>
                                              <span className="text-gray-300">•</span>
                                              <span className="text-xs text-gray-500">
                                                {entry.starttime} - {entry.endtime}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        {entry.task_description && (
                                          <p className="text-sm text-gray-900 font-medium mb-1 text-left">
                                            {entry.task_description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1 text-left">
                                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                            {entry.category}
                                          </span>
                                          <span className="text-xs font-semibold text-[#f16a21]">
                                            {entry.hours.toFixed(1)}h
                                          </span>
                                        </div>
                                        {entry.notes && (
                                          <p className="text-xs text-gray-500 mt-2 italic text-left">
                                            {entry.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {user.entries.length > 20 && (
                                  <p className="text-xs text-gray-500 text-center py-2">
                                    Showing 20 of {user.entries.length} entries
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {userListForCards.filter(user => 
                  searchTerm === "" ||
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
