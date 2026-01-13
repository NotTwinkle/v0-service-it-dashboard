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
import { LogOut, Clock, Target, TrendingUp, AlertCircle, ChevronRight, Zap } from "lucide-react"

// Mock user data
const userTaskData = [
  { name: "Development", value: 60, hours: 24 },
  { name: "Meetings", value: 20, hours: 8 },
  { name: "Code Review", value: 15, hours: 6 },
  { name: "Other", value: 5, hours: 2 },
]

const weeklyTimeData = [
  { day: "Mon", logged: 8.2, target: 8, estimated: 8 },
  { day: "Tue", logged: 7.8, target: 8, estimated: 8 },
  { day: "Wed", logged: 8.5, target: 8, estimated: 8 },
  { day: "Thu", logged: 7.9, target: 8, estimated: 8 },
  { day: "Fri", logged: 8.1, target: 8, estimated: 8 },
]

const userTasks = [
  { id: 1, name: "Fix login authentication", project: "Alpha", estimated: 4, logged: 3.5, status: "In Progress" },
  { id: 2, name: "Update database schema", project: "Beta", estimated: 6, logged: 5.2, status: "In Progress" },
  { id: 3, name: "Code review PR #234", project: "Gamma", estimated: 2, logged: 1.8, status: "Completed" },
  { id: 4, name: "Design new dashboard layout", project: "Alpha", estimated: 5, logged: 0, status: "Not Started" },
]

const COLORS = ["#FF6B35", "#1B3A6B", "#5F6368", "#FF8C5A"]

const timeReconciliation = {
  asana: { hours: 62, color: "#FF6B35", team: "Project Management" },
  ivanti: { hours: 45, color: "#1B3A6B", team: "IT Support" },
  timeTracker: { hours: 63, color: "#5F6368", team: "Time Logging" },
}

const calculateTotal = () => {
  return timeReconciliation.asana.hours + timeReconciliation.ivanti.hours + timeReconciliation.timeTracker.hours
}

const calculateAverage = () => {
  return (calculateTotal() / 3).toFixed(1)
}

const getVariance = (value: number) => {
  const avg = Number.parseFloat(calculateAverage())
  return (value - avg).toFixed(1)
}

const getVarianceStatus = (variance: number) => {
  const absVariance = Math.abs(variance)
  if (absVariance > 10) return { label: "Critical", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" }
  if (absVariance > 5)
    return { label: "Warning", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
  return { label: "Good", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
}

// Mock project data with platform-specific user contributions
const projects = [
  {
    id: 1,
    name: "Mobile App Redesign",
    platforms: {
      asana: {
        estimated: 62,
        users: [
          { name: "John Doe", logged: 20, estimated: 22 },
          { name: "Sarah Smith", logged: 18, estimated: 20 },
          { name: "Mike Johnson", logged: 24, estimated: 20 },
        ],
      },
      ivanti: {
        estimated: 80,
        users: [
          { name: "Emma Wilson", logged: 15, estimated: 20 },
          { name: "David Brown", logged: 18, estimated: 22 },
          { name: "Lisa Anderson", logged: 12, estimated: 18 },
        ],
      },
      timeTracker: {
        estimated: 100,
        users: [
          { name: "John Doe", logged: 21, estimated: 25 },
          { name: "Sarah Smith", logged: 19, estimated: 20 },
          { name: "Emma Wilson", logged: 16, estimated: 22 },
          { name: "Mike Johnson", logged: 25, estimated: 22 },
          { name: "David Brown", logged: 20, estimated: 22 },
        ],
      },
      innovation: {
        estimated: 120,
        users: [
          { name: "Alice Chen", logged: 40, estimated: 50 },
          { name: "Robert Taylor", logged: 35, estimated: 40 },
          { name: "James Miller", logged: 42, estimated: 50 },
        ],
      },
    },
  },
  {
    id: 2,
    name: "API Integration Phase",
    platforms: {
      asana: {
        estimated: 45,
        users: [
          { name: "John Doe", logged: 18, estimated: 15 },
          { name: "Sarah Smith", logged: 15, estimated: 15 },
          { name: "Mike Johnson", logged: 12, estimated: 15 },
        ],
      },
      ivanti: {
        estimated: 60,
        users: [
          { name: "Emma Wilson", logged: 22, estimated: 20 },
          { name: "David Brown", logged: 20, estimated: 20 },
          { name: "Lisa Anderson", logged: 18, estimated: 20 },
        ],
      },
      timeTracker: {
        estimated: 75,
        users: [
          { name: "John Doe", logged: 16, estimated: 15 },
          { name: "Sarah Smith", logged: 14, estimated: 15 },
          { name: "Emma Wilson", logged: 22, estimated: 20 },
          { name: "Mike Johnson", logged: 13, estimated: 15 },
        ],
      },
      innovation: {
        estimated: 90,
        users: [
          { name: "Alice Chen", logged: 28, estimated: 30 },
          { name: "Robert Taylor", logged: 32, estimated: 30 },
          { name: "James Miller", logged: 30, estimated: 30 },
        ],
      },
    },
  },
  {
    id: 3,
    name: "Database Optimization",
    platforms: {
      asana: {
        estimated: 38,
        users: [
          { name: "John Doe", logged: 14, estimated: 13 },
          { name: "Sarah Smith", logged: 12, estimated: 12 },
          { name: "Mike Johnson", logged: 12, estimated: 13 },
        ],
      },
      ivanti: {
        estimated: 55,
        users: [
          { name: "Emma Wilson", logged: 18, estimated: 18 },
          { name: "David Brown", logged: 20, estimated: 19 },
          { name: "Lisa Anderson", logged: 17, estimated: 18 },
        ],
      },
      timeTracker: {
        estimated: 65,
        users: [
          { name: "John Doe", logged: 13, estimated: 13 },
          { name: "Sarah Smith", logged: 11, estimated: 12 },
          { name: "Emma Wilson", logged: 19, estimated: 18 },
          { name: "Mike Johnson", logged: 12, estimated: 13 },
          { name: "David Brown", logged: 10, estimated: 9 },
        ],
      },
      innovation: {
        estimated: 85,
        users: [
          { name: "Alice Chen", logged: 30, estimated: 28 },
          { name: "Robert Taylor", logged: 28, estimated: 29 },
          { name: "James Miller", logged: 27, estimated: 28 },
        ],
      },
    },
  },
]

interface PlatformUser {
  name: string
  logged: number
  estimated: number
}

interface PlatformData {
  estimated: number
  users: PlatformUser[]
}

const PlatformCard = ({
  title,
  color,
  icon,
  data,
  description,
}: {
  title: string
  color: string
  icon: React.ReactNode
  data: PlatformData
  description: string
}) => {
  const totalLogged = data.users.reduce((sum, user) => sum + user.logged, 0)
  const variance = totalLogged - data.estimated
  const variancePercent = ((variance / data.estimated) * 100).toFixed(1)

  const getStatusColor = (variance: number) => {
    if (variance > 15) return "text-red-600 bg-red-50 border-red-200"
    if (variance > 5) return "text-amber-600 bg-amber-50 border-amber-200"
    if (variance < -15) return "text-green-600 bg-green-50 border-green-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  return (
    <div className="platform-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logged</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {totalLogged}h
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.estimated}h</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</p>
          <p className={`text-2xl font-bold mt-1 ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
            {variance > 0 ? "+" : ""}
            {variance}h
          </p>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Team Breakdown</p>
        {data.users.map((user, idx) => {
          const userVariance = user.logged - user.estimated
          const progressPercent = (user.logged / Math.max(user.estimated, user.logged)) * 100
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <span className={`text-xs font-bold ${userVariance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {userVariance > 0 ? "+" : ""}
                  {userVariance}h
                </span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(progressPercent, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {user.logged}h logged / {user.estimated}h estimated
              </p>
            </div>
          )
        })}
      </div>

      {/* Status Badge */}
      <div className={`mt-6 p-3 rounded-lg text-xs font-medium text-center ${getStatusColor(variance)}`}>
        {variance > 15
          ? "Over Budget"
          : variance > 5
            ? "Above Estimate"
            : variance < -15
              ? "Ahead of Schedule"
              : "On Track"}
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [todayLogged, setTodayLogged] = useState(7.5)
  const [selectedProjectId, setSelectedProjectId] = useState(1) // Add project selector state

  useEffect(() => {
    // Check if user is authenticated
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(session)
    setUserEmail(userData.email)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    router.push("/")
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/serviceitlogo.png" alt="Service IT+" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">Service IT+</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm text-right hidden sm:block">
                <p className="text-gray-600 text-xs">Signed in as</p>
                <p className="font-semibold text-gray-900">{userEmail}</p>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600 mt-2">Here's your personalized dashboard and time reconciliation</p>
            </div>
          </div>
        </div>

        {todayLogged < 8 && (
          <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Time Tracking Reminder</p>
              <p className="text-sm text-amber-700 mt-1">You've logged {todayLogged}h today. Target is 8 hours.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Today's Logged</p>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600">{todayLogged}h</p>
            <p className="text-xs text-gray-500 mt-2">Of 8-hour target</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Weekly Progress</p>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">40.5h</p>
            <p className="text-xs text-gray-500 mt-2">Of 40-hour target</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">2</p>
            <p className="text-xs text-gray-500 mt-2">In progress</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Completion</p>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600">75%</p>
            <p className="text-xs text-gray-500 mt-2">This week</p>
          </div>
        </div>

        {/* Time Entry Reconciliation Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Time Entry Reconciliation</h3>
              <p className="text-gray-600 mt-2">Compare hours logged across all platforms to identify discrepancies</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Asana */}
            <PlatformCard
              title="Asana"
              color="#FF6B35"
              icon={
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-600">A</span>
                </div>
              }
              data={selectedProject.platforms.asana}
              description="Project Management"
            />

            {/* Ivanti */}
            <PlatformCard
              title="Ivanti"
              color="#1B3A6B"
              icon={
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">I</span>
                </div>
              }
              data={selectedProject.platforms.ivanti}
              description="IT Support System"
            />

            {/* Time Tracker */}
            <PlatformCard
              title="Time Tracker"
              color="#5F6368"
              icon={
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">T</span>
                </div>
              }
              data={selectedProject.platforms.timeTracker}
              description="Internal Logging"
            />

            {/* Innovation */}
            <PlatformCard
              title="Innovation"
              color="#10B981"
              icon={
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-600">N</span>
                </div>
              }
              data={selectedProject.platforms.innovation}
              description="Innovation Projects"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary Card */}
            <div className="premium-card p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-6">Summary Overview</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Combined Total</span>
                  <span className="text-2xl font-bold text-gray-900">{calculateTotal()}h</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average per Platform</span>
                  <span className="text-2xl font-bold text-orange-600">{calculateAverage()}h</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="premium-card p-6 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200">
              <h4 className="text-lg font-bold text-orange-900 mb-4">Action Required</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-900">Ivanti Under-logged</p>
                    <p className="text-xs text-orange-700 mt-1">
                      IT Support is {Math.abs(Number(getVariance(timeReconciliation.ivanti.hours)))}h below average
                    </p>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
                Review Discrepancies
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Distribution */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Task Distribution</h3>
            <p className="text-sm text-gray-600 mb-6">Breakdown of your tasks by category</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTaskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTaskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Time Trend */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Weekly Time Tracking</h3>
            <p className="text-sm text-gray-600 mb-6">Your logged hours vs target</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logged" stroke="#FF6B35" strokeWidth={2} name="Logged Hours" />
                <Line type="monotone" dataKey="target" stroke="#1B3A6B" strokeWidth={2} name="Target Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Your Active Tasks</h3>
          <p className="text-sm text-gray-600 mb-6">Tasks assigned to you from all integrated platforms</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-700 py-4 px-4">Task Name</th>
                  <th className="text-left font-semibold text-gray-700 py-4 px-4">Project</th>
                  <th className="text-center font-semibold text-gray-700 py-4 px-4">Estimated</th>
                  <th className="text-center font-semibold text-gray-700 py-4 px-4">Logged</th>
                  <th className="text-center font-semibold text-gray-700 py-4 px-4">Variance</th>
                  <th className="text-center font-semibold text-gray-700 py-4 px-4">Status</th>
                  <th className="text-center font-semibold text-gray-700 py-4 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {userTasks.map((task) => {
                  const variance = task.estimated - task.logged
                  const isOverdue = variance < 0
                  return (
                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">{task.name}</td>
                      <td className="py-4 px-4 text-gray-600">{task.project}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{task.estimated}h</td>
                      <td className="py-4 px-4 text-center font-medium text-gray-900">{task.logged}h</td>
                      <td
                        className={`py-4 px-4 text-center font-medium ${isOverdue ? "text-red-600" : "text-green-600"}`}
                      >
                        {variance > 0 ? `+${variance}h` : `${variance}h`}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link href={`/user/time-tracker/${task.id}`}>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded">
                            Log Time
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
