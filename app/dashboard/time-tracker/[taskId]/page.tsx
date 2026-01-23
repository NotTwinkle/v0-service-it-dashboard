"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Clock } from "lucide-react"

// Mock task data
const taskDatabase: Record<
  string,
  {
    id: number
    name: string
    project: string
    client: string
    initiative: string
    source: string
    estimated: number
    logged: number
  }
> = {
  "1": {
    id: 1,
    name: "Fix login authentication",
    project: "Project Alpha",
    client: "Client A",
    initiative: "Authentication Redesign",
    source: "Asana",
    estimated: 4,
    logged: 3.5,
  },
  "2": {
    id: 2,
    name: "Update database schema",
    project: "Project Beta",
    client: "Client B",
    initiative: "Database Migration",
    source: "Ivanti ITSM",
    estimated: 6,
    logged: 5.2,
  },
  "3": {
    id: 3,
    name: "Code review PR #234",
    project: "Project Gamma",
    client: "Internal",
    initiative: "Quality Assurance",
    source: "GitHub",
    estimated: 2,
    logged: 1.8,
  },
  "4": {
    id: 4,
    name: "Design new dashboard layout",
    project: "Project Alpha",
    client: "Client A",
    initiative: "Dashboard Redesign",
    source: "Google Sheets",
    estimated: 5,
    logged: 0,
  },
}

export default function TimeTrackerPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.taskId as string

  const [task, setTask] = useState<(typeof taskDatabase)["1"] | null>(null)
  const [timeSpent, setTimeSpent] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/auth/login")
      return
    }

    // Load task data
    const taskData = taskDatabase[taskId]
    if (taskData) {
      setTask(taskData)
    }
  }, [taskId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!timeSpent) {
      alert("Please enter the time spent")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true)
      setIsLoading(false)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }, 500)
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading task...</p>
      </div>
    )
  }

  const remainingHours = task.estimated - task.logged

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-4 text-white">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20">
                <Clock className="w-6 h-6 text-[#f16a21]" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Time Tracker</h1>
                <p className="text-[10px] text-orange-100 font-medium">Log your work hours</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSuccess && (
          <div className="flex gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl mb-8 shadow-sm animate-in slide-in-from-top-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 mb-1">Time logged successfully!</p>
              <p className="text-sm text-green-800">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#404040]">{task.name}</CardTitle>
                <CardDescription className="text-gray-600">Log your time for this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task Info */}
                <div className="grid grid-cols-2 gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Project</p>
                    <p className="text-sm font-bold text-[#404040]">{task.project}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Client</p>
                    <p className="text-sm font-bold text-[#404040]">{task.client}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Initiative</p>
                    <p className="text-sm font-bold text-[#404040]">{task.initiative}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Source System</p>
                    <p className="text-sm font-bold text-[#404040]">{task.source}</p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">Estimated Hours</p>
                    <p className="text-3xl font-extrabold text-blue-900">{task.estimated}h</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">Already Logged</p>
                    <p className="text-3xl font-extrabold text-blue-900">{task.logged}h</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 mb-2">Remaining</p>
                    <p className={`text-3xl font-extrabold ${remainingHours >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {remainingHours.toFixed(1)}h
                    </p>
                  </div>
                </div>

                {/* Time Entry Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#404040]">Hours Spent Today</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:border-gray-400 font-medium"
                      />
                      <span className="flex items-center text-gray-600 font-semibold px-3">hours</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Use decimal format: 1.5, 2.25, etc.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#404040]">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you work on? Any blockers or achievements?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:border-gray-400 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !timeSpent}
                    className="w-full bg-gradient-to-r from-[#f16a21] to-[#f79021] hover:from-[#f79021] hover:to-[#f16a21] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-900/25 hover:shadow-xl hover:shadow-orange-900/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging Time...
                      </span>
                    ) : (
                      "Log Time Entry"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#404040]">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-5 bg-white rounded-xl border border-orange-200 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Status</p>
                  <p className="text-lg font-bold text-[#404040]">In Progress</p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-orange-200 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">Progress</p>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#f16a21] via-[#f79021] to-[#f79021] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((task.logged / task.estimated) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-lg font-bold text-[#404040]">
                    {((task.logged / task.estimated) * 100).toFixed(0)}% Complete
                  </p>
                </div>

                <div className="p-5 bg-white rounded-xl border border-orange-200 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Est. Completion</p>
                  <p className="text-lg font-bold text-[#404040]">
                    {remainingHours > 0 ? "Not yet completed" : "Completed"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
