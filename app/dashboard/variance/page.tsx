"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react"

interface ProjectVariance {
  project_id: number | null
  asana_project_gid: string
  project_name: string
  asana_project_name: string
  estimated_hours: number
  actual_hours: number
  variance_hours: number
  completion_percentage: number
  entry_count: number
  unique_contributors: number
  has_asana_data: boolean
  status: 'under_budget' | 'over_budget' | 'on_track'
  matched_with_timetracker: boolean
}

export default function ProjectVariancePage() {
  const [projects, setProjects] = useState<ProjectVariance[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'with_asana' | 'over_budget' | 'under_budget'>('all')

  useEffect(() => {
    fetchVariance()
  }, [])

  const fetchVariance = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects/variance')
      const result = await response.json()
      if (result.success) {
        setProjects(result.projects || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching variance:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(p => {
    if (filter === 'with_asana') return p.has_asana_data
    if (filter === 'over_budget') return p.status === 'over_budget'
    if (filter === 'under_budget') return p.status === 'under_budget'
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over_budget': return <TrendingUp className="h-5 w-5 text-red-600" />
      case 'under_budget': return <TrendingDown className="h-5 w-5 text-emerald-600" />
      default: return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over_budget': return 'bg-red-50 border-red-200 text-red-700'
      case 'under_budget': return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-white hover:bg-white/10 border-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/30" />
              <div>
                <h1 className="text-lg font-bold tracking-tight">Project Variance</h1>
                <p className="text-[10px] text-orange-100 font-medium">Asana Estimates vs Actual Hours (from Jan 2026)</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchVariance}
              disabled={loading}
              className="h-9 px-4 text-white hover:bg-white/10 border-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#404040]">{summary.total_projects}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {summary.projects_with_asana_data} with Asana data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Estimated Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#f16a21]">
                  {summary.total_estimated_hours.toFixed(2)}h
                </p>
                <p className="text-xs text-gray-600 mt-1">From Asana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actual Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#2d307a]">
                  {summary.total_actual_hours.toFixed(2)}h
                </p>
                <p className="text-xs text-gray-600 mt-1">From Time Logs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${summary.total_variance_hours >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {summary.total_variance_hours >= 0 ? '+' : ''}{summary.total_variance_hours.toFixed(2)}h
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {summary.total_variance_hours >= 0 ? 'Under budget' : 'Over budget'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Projects
          </Button>
          <Button
            variant={filter === 'with_asana' ? 'default' : 'outline'}
            onClick={() => setFilter('with_asana')}
            size="sm"
          >
            With Asana Data
          </Button>
          <Button
            variant={filter === 'over_budget' ? 'default' : 'outline'}
            onClick={() => setFilter('over_budget')}
            size="sm"
          >
            Over Budget
          </Button>
          <Button
            variant={filter === 'under_budget' ? 'default' : 'outline'}
            onClick={() => setFilter('under_budget')}
            size="sm"
          >
            Under Budget
          </Button>
        </div>

        {/* Projects List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-12 w-12 text-orange-500 animate-spin" />
                <p className="text-gray-500">Loading project variance data...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Run the n8n Asana sync workflow to populate data
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project.asana_project_gid || project.project_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#404040]">
                            {project.project_name}
                          </h3>
                          {!project.has_asana_data && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                              No Asana Data
                            </span>
                          )}
                          {project.has_asana_data && project.asana_project_name !== project.project_name && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              Matched: {project.asana_project_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.unique_contributors} contributors
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {project.entry_count} time log entries
                          </span>
                        </div>
                      </div>

                      {/* Hours Comparison */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500 mb-1">Estimated</p>
                          <p className="text-2xl font-bold text-[#f16a21]">
                            {project.estimated_hours.toFixed(1)}h
                          </p>
                          <p className="text-[10px] text-gray-400">Asana</p>
                        </div>

                        <div className="flex items-center">
                          <div className="h-px w-8 bg-gray-300" />
                        </div>

                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500 mb-1">Actual</p>
                          <p className="text-2xl font-bold text-[#2d307a]">
                            {project.actual_hours.toFixed(1)}h
                          </p>
                          <p className="text-[10px] text-gray-400">Time Logs</p>
                        </div>

                        <div className="flex items-center">
                          <div className="h-px w-8 bg-gray-300" />
                        </div>

                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-500 mb-1">Variance</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <p className={`text-2xl font-bold ${
                              project.variance_hours > 0 ? 'text-emerald-600' : 
                              project.variance_hours < 0 ? 'text-red-600' : 
                              'text-gray-500'
                            }`}>
                              {project.variance_hours >= 0 ? '+' : ''}
                              {project.variance_hours.toFixed(1)}h
                            </p>
                          </div>
                          <span className={`inline-flex mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {project.completion_percentage}% complete
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {project.has_asana_data && project.estimated_hours > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium text-gray-700">
                            {project.actual_hours.toFixed(2)}h / {project.estimated_hours.toFixed(2)}h
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              project.completion_percentage >= 100 
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : project.completion_percentage >= 80
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, project.completion_percentage)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Instructions Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-blue-900">How to Sync Asana Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>1. Set up n8n workflow (see <code className="px-1.5 py-0.5 bg-blue-100 rounded">n8n/README.md</code>)</p>
            <p>2. Configure Asana credentials in n8n</p>
            <p>3. Set webhook URL: <code className="px-1.5 py-0.5 bg-blue-100 rounded">http://localhost:3000/api/webhooks/asana-sync</code></p>
            <p>4. Run the workflow to sync projects</p>
            <p>5. Click "Refresh" above to see updated variance</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
