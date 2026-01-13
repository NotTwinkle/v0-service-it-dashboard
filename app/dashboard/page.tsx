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
} from "recharts"
import { Filter } from "lucide-react"

// Mock data
const taskData = [
  { name: "Development", value: 45, hours: 36 },
  { name: "Design", value: 25, hours: 20 },
  { name: "Support", value: 20, hours: 16 },
  { name: "Admin", value: 10, hours: 8 },
]

const timeTrackingData = [
  { day: "Mon", estimated: 8, actual: 7.5, target: 8 },
  { day: "Tue", estimated: 8, actual: 8.2, target: 8 },
  { day: "Wed", estimated: 8, actual: 7.8, target: 8 },
  { day: "Thu", estimated: 8, actual: 8.5, target: 8 },
  { day: "Fri", estimated: 8, actual: 7.2, target: 8 },
  { day: "Sat", estimated: 4, actual: 0, target: 0 },
  { day: "Sun", estimated: 4, actual: 0, target: 0 },
]

const projectDistribution = [
  { name: "Project Alpha", tasks: 12, completion: 65 },
  { name: "Project Beta", tasks: 8, completion: 45 },
  { name: "Project Gamma", tasks: 15, completion: 80 },
  { name: "Project Delta", tasks: 6, completion: 20 },
]

const COLORS = ["#FF6B35", "#1B3A6B", "#5F6368", "#FF8C5A", "#2D5A9F"]

export default function PublicDashboard() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Service IT+ Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Public View (Read-Only)</span>
              <Link href="/auth/login">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className={`${selectedClient ? "bg-orange-100 border-orange-300" : ""}`}>
                Select Client
              </Button>
              <Button variant="outline" className={`${selectedProject ? "bg-orange-100 border-orange-300" : ""}`}>
                Select Initiative/Project
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">127</p>
              <p className="text-sm text-gray-500 mt-2">Across all systems</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Daily Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">7.8h</p>
              <p className="text-sm text-gray-500 mt-2">Of 8-hour target</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-500 mt-2">In progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">68%</p>
              <p className="text-sm text-gray-500 mt-2">Week over week</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Distribution Pie Chart */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Task Distribution by Category</CardTitle>
              <CardDescription>Breakdown of all tasks across categories</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Time Tracking */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Weekly Time Tracking</CardTitle>
              <CardDescription>Estimated vs Actual hours logged</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeTrackingData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Project Progress Overview</CardTitle>
            <CardDescription>Completion percentage and task count by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projectDistribution.map((project) => (
                <div key={project.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{project.name}</span>
                    <span className="text-sm text-gray-600">
                      {project.tasks} tasks • {project.completion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
