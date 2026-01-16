"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Filter, Users, Clock, TrendingUp, AlertCircle, ChevronRight, BarChart3, Zap } from "lucide-react"

// Aggregated data across all users/teams
const allUsersTaskData = [
  { name: "Development", value: 45, hours: 180 },
  { name: "Design", value: 25, hours: 100 },
  { name: "Support", value: 20, hours: 80 },
  { name: "Admin", value: 10, hours: 40 },
]

const teamTimeTrackingData = [
  { day: "Mon", estimated: 80, actual: 78, target: 80 },
  { day: "Tue", estimated: 80, actual: 82, target: 80 },
  { day: "Wed", estimated: 80, actual: 79, target: 80 },
  { day: "Thu", estimated: 80, actual: 85, target: 80 },
  { day: "Fri", estimated: 80, actual: 76, target: 80 },
  { day: "Sat", estimated: 40, actual: 12, target: 40 },
  { day: "Sun", estimated: 40, actual: 8, target: 40 },
]

const projectDistribution = [
  { name: "Project Alpha", tasks: 45, completion: 72, teamMembers: 8 },
  { name: "Project Beta", tasks: 32, completion: 58, teamMembers: 6 },
  { name: "Project Gamma", tasks: 56, completion: 85, teamMembers: 10 },
  { name: "Project Delta", tasks: 24, completion: 35, teamMembers: 4 },
]

// Platform reconciliation data (aggregated across all users)
const platformReconciliation = {
  asana: { totalHours: 420, users: 12, avgPerUser: 35 },
  ivanti: { totalHours: 380, users: 10, avgPerUser: 38 },
  timeTracker: { totalHours: 450, users: 15, avgPerUser: 30 },
  innovation: { totalHours: 320, users: 8, avgPerUser: 40 },
}

const teamBreakdown = [
  { name: "Engineering Team", members: 12, hours: 480, compliance: 95 },
  { name: "Design Team", members: 6, hours: 240, compliance: 88 },
  { name: "Support Team", members: 8, hours: 320, compliance: 92 },
  { name: "Management", members: 4, hours: 160, compliance: 100 },
]

const COLORS = ["#f16a21", "#2d307a", "#979897", "#f79021", "#b9b6dd"]

export default function PublicDashboard() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const totalHours = platformReconciliation.asana.totalHours + 
                     platformReconciliation.ivanti.totalHours + 
                     platformReconciliation.timeTracker.totalHours + 
                     platformReconciliation.innovation.totalHours

  const totalUsers = platformReconciliation.asana.users + 
                     platformReconciliation.ivanti.users + 
                     platformReconciliation.timeTracker.users + 
                     platformReconciliation.innovation.users

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-200 group-hover:scale-105">
                <img src="/SERVICEITLOGO.png" alt="Service IT+ logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">Service IT+ Dashboard</h1>
                <p className="text-[10px] text-orange-100 font-medium tracking-wide">Organization Overview (All Teams)</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/my">
                <Button
                  variant="ghost"
                  className="hidden md:flex h-9 px-4 text-white hover:bg-white/10 border-0 font-medium"
                >
                  My Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="hidden sm:flex h-9 px-4 text-white hover:bg-white/10 border-0 font-medium"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="h-9 px-6 bg-white text-[#f16a21] border-0 rounded-full shadow-md shadow-orange-900/20 hover:-translate-y-0.5 hover:scale-105 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-900/30 active:scale-100 transition-all duration-200 ease-out font-semibold tracking-wide">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#f16a21]">
              <Filter className="w-5 h-5" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant="outline" 
                className={`rounded-full font-medium transition-all ${selectedClient ? "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100" : "hover:border-orange-200"}`}
              >
                Select Client
              </Button>
              <Button 
                variant="outline" 
                className={`rounded-full font-medium transition-all ${selectedProject ? "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100" : "hover:border-orange-200"}`}
              >
                Select Initiative/Project
              </Button>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Organization Overview</h2>
              <p className="text-gray-600 mt-2">Aggregated data across all teams and platforms</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group bg-white border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-orange-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">157</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">Across all systems</p>
            </CardContent>
          </Card>
          <Card className="group bg-white border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-emerald-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Hours Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-emerald-600">{totalHours}h</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">This week (all teams)</p>
            </CardContent>
          </Card>
          <Card className="group bg-white border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-orange-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-[#f16a21]">{totalUsers}</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">Across all platforms</p>
            </CardContent>
          </Card>
          <Card className="group bg-white border-blue-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-blue-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-blue-600">72%</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">Organization-wide</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Reconciliation Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Platform Reconciliation</h3>
            <p className="text-gray-600">Compare hours logged across all platforms to identify discrepancies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-orange-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#f16a21]">A</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Asana</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Hours</p>
                    <p className="text-3xl font-extrabold text-[#f16a21]">{platformReconciliation.asana.totalHours}h</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">{platformReconciliation.asana.users}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg per User</p>
                    <p className="text-lg font-semibold text-gray-700">{platformReconciliation.asana.avgPerUser}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">I</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Ivanti</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Hours</p>
                    <p className="text-3xl font-extrabold text-blue-600">{platformReconciliation.ivanti.totalHours}h</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">{platformReconciliation.ivanti.users}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg per User</p>
                    <p className="text-lg font-semibold text-gray-700">{platformReconciliation.ivanti.avgPerUser}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Time Tracker</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Hours</p>
                    <p className="text-3xl font-extrabold text-gray-600">{platformReconciliation.timeTracker.totalHours}h</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">{platformReconciliation.timeTracker.users}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg per User</p>
                    <p className="text-lg font-semibold text-gray-700">{platformReconciliation.timeTracker.avgPerUser}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Innovation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Total Hours</p>
                    <p className="text-3xl font-extrabold text-emerald-600">{platformReconciliation.innovation.totalHours}h</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">{platformReconciliation.innovation.users}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg per User</p>
                    <p className="text-lg font-semibold text-gray-700">{platformReconciliation.innovation.avgPerUser}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Breakdown */}
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Team Performance</CardTitle>
              <CardDescription className="text-gray-600">Hours logged and compliance by team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {teamBreakdown.map((team) => (
                  <div key={team.name} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#f16a21]" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 group-hover:text-[#f16a21] transition-colors">{team.name}</span>
                          <p className="text-xs text-gray-500">{team.members} members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Hours</p>
                          <p className="text-xl font-bold text-gray-900">{team.hours}h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Compliance</p>
                          <p className={`text-xl font-bold ${team.compliance >= 95 ? "text-emerald-600" : team.compliance >= 90 ? "text-[#f16a21]" : "text-red-600"}`}>
                            {team.compliance}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          team.compliance >= 95
                            ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400"
                            : team.compliance >= 90
                              ? "bg-gradient-to-r from-[#f16a21] via-[#f79021] to-[#f79021]"
                              : "bg-gradient-to-r from-red-600 via-red-500 to-red-400"
                        }`}
                        style={{ width: `${team.compliance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Distribution Pie Chart */}
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Task Distribution by Category</CardTitle>
              <CardDescription className="text-gray-600">Breakdown of all tasks across categories (All Teams)</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allUsersTaskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allUsersTaskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Time Tracking */}
          <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Weekly Time Tracking</CardTitle>
              <CardDescription className="text-gray-600">Team totals: Estimated vs Actual hours logged</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamTimeTrackingData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#f16a21" radius={[4, 4, 0, 0]} name="Estimated (Team Total)" />
                  <Bar dataKey="actual" fill="#2d307a" radius={[4, 4, 0, 0]} name="Actual Logged (All Teams)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress */}
        <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Project Progress Overview</CardTitle>
              <CardDescription className="text-gray-600">Completion percentage and task count by project (All Teams)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projectDistribution.map((project) => (
                <div key={project.name} className="group">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <span className="font-semibold text-gray-900 group-hover:text-[#f16a21] transition-colors block">{project.name}</span>
                      <span className="text-xs text-gray-500">{project.teamMembers} team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {project.tasks} tasks
                      </span>
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        {project.completion}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#f16a21] via-[#f79021] to-[#f79021] h-2.5 rounded-full transition-all duration-500 ease-out group-hover:from-[#f79021] group-hover:via-[#f16a21] group-hover:to-[#f16a21]"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm font-semibold tracking-wide text-gray-900">
                  Service IT+
                </p>
                <p className="text-xs text-gray-500">
                  © 2025 Service IT+. All rights reserved.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </a>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" />
              <a href="#" className="hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
