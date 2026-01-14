"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, Search, ArrowRight, ArrowLeft, Zap } from "lucide-react"

const allTasks = [
  {
    id: 1,
    name: "Fix login authentication",
    project: "Alpha",
    client: "Client A",
    estimated: 4,
    logged: 3.5,
    status: "In Progress",
    priority: "High",
    dueDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Update database schema",
    project: "Beta",
    client: "Client B",
    estimated: 6,
    logged: 5.2,
    status: "In Progress",
    priority: "High",
    dueDate: "2025-01-18",
  },
  {
    id: 3,
    name: "Code review PR #234",
    project: "Gamma",
    client: "Internal",
    estimated: 2,
    logged: 1.8,
    status: "Completed",
    priority: "Medium",
    dueDate: "2025-01-10",
  },
  {
    id: 4,
    name: "Design new dashboard layout",
    project: "Alpha",
    client: "Client A",
    estimated: 5,
    logged: 0,
    status: "Not Started",
    priority: "High",
    dueDate: "2025-01-20",
  },
  {
    id: 5,
    name: "API integration testing",
    project: "Delta",
    client: "Client C",
    estimated: 3,
    logged: 0,
    status: "Not Started",
    priority: "Medium",
    dueDate: "2025-01-22",
  },
  {
    id: 6,
    name: "Documentation update",
    project: "Gamma",
    client: "Internal",
    estimated: 2,
    logged: 0.5,
    status: "In Progress",
    priority: "Low",
    dueDate: "2025-01-25",
  },
]

function TasksContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/auth/login")
    }
  }, [router])

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || task.status === filterStatus
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700"
      case "In Progress":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600"
      case "Medium":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <Card className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by task name or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Filter className="w-5 h-5" />
              </div>
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:border-gray-400 transition-colors"
              >
                <option value="">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
            <select
              value={filterPriority || ""}
              onChange={(e) => setFilterPriority(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:border-gray-400 transition-colors"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No tasks found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-200 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{task.name}</h3>
                    <div className="flex gap-4 mb-4 text-sm text-gray-600 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 font-medium">📁 {task.project}</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">🏢 {task.client}</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : task.priority === "Medium"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Time Progress</p>
                      <p className="text-3xl font-extrabold text-orange-600 mb-2">
                        {task.logged}/{task.estimated}h
                      </p>
                      <div className="w-28 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((task.logged / task.estimated) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/dashboard/time-tracker/${task.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-md shadow-orange-900/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Log Time
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card className="group bg-white border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-gray-300">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Total Tasks</p>
            <p className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">{allTasks.length}</p>
          </CardContent>
        </Card>
        <Card className="group bg-white border-blue-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-blue-300">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">In Progress</p>
            <p className="text-4xl font-extrabold text-blue-600">
              {allTasks.filter((t) => t.status === "In Progress").length}
            </p>
          </CardContent>
        </Card>
        <Card className="group bg-white border-emerald-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-emerald-300">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Completed</p>
            <p className="text-4xl font-extrabold text-emerald-600">
              {allTasks.filter((t) => t.status === "Completed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="group bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-gray-300">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Not Started</p>
            <p className="text-4xl font-extrabold text-gray-600">
              {allTasks.filter((t) => t.status === "Not Started").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 via-orange-600 to-orange-700 border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/20">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Tasks</h1>
                <p className="text-[10px] text-orange-100 font-medium">Manage your work</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="h-9 px-6 bg-white text-orange-600 border-0 rounded-full shadow-md shadow-orange-900/20 hover:-translate-y-0.5 hover:scale-105 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-900/30 active:scale-100 transition-all duration-200 ease-out font-semibold tracking-wide">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <Suspense fallback={null}>
        <TasksContent />
      </Suspense>
    </div>
  )
}
