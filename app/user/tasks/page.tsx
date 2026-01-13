"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, Search, ArrowRight } from "lucide-react"

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
      <Card className="bg-white border-gray-200 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by task name or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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
            <Card key={task.id} className="bg-white border-gray-200 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.name}</h3>
                    <div className="flex gap-4 mb-4 text-sm text-gray-600 flex-wrap">
                      <span>📁 {task.project}</span>
                      <span>🏢 {task.client}</span>
                      <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-opacity-20 ${getPriorityColor(task.priority)} border`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Time Progress</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {task.logged}/{task.estimated}h
                      </p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(task.logged / task.estimated) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/user/time-tracker/${task.id}`}>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{allTasks.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {allTasks.filter((t) => t.status === "In Progress").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {allTasks.filter((t) => t.status === "Completed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Not Started</p>
            <p className="text-3xl font-bold text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <Link href="/user/dashboard">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
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
