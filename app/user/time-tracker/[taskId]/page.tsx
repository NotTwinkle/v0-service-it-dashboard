"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"

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
        router.push("/user/dashboard")
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Time Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSuccess && (
          <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-8">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Time logged successfully!</p>
              <p className="text-sm text-green-800">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>{task.name}</CardTitle>
                <CardDescription>Log your time for this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Project</p>
                    <p className="text-sm font-semibold text-gray-900">{task.project}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Client</p>
                    <p className="text-sm font-semibold text-gray-900">{task.client}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Initiative</p>
                    <p className="text-sm font-semibold text-gray-900">{task.initiative}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Source System</p>
                    <p className="text-sm font-semibold text-gray-900">{task.source}</p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Estimated Hours</p>
                    <p className="text-2xl font-bold text-blue-900">{task.estimated}h</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Already Logged</p>
                    <p className="text-2xl font-bold text-blue-900">{task.logged}h</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${remainingHours >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {remainingHours.toFixed(1)}h
                    </p>
                  </div>
                </div>

                {/* Time Entry Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">Hours Spent Today</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <span className="flex items-center text-gray-600 font-medium">hours</span>
                    </div>
                    <p className="text-xs text-gray-500">Use decimal format: 1.5, 2.25, etc.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you work on? Any blockers or achievements?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !timeSpent}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3"
                  >
                    {isLoading ? "Logging Time..." : "Log Time Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <p className="font-semibold text-gray-900">In Progress</p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 mb-2">Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(task.logged / task.estimated) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {((task.logged / task.estimated) * 100).toFixed(0)}% Complete
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Est. Completion</p>
                  <p className="text-sm font-semibold text-gray-900">
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
