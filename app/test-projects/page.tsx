"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

/**
 * Test page to view all projects from both sources:
 * 1. Asana API - all projects from Asana
 * 2. Time Tracker DB - all projects from timelogs database
 */
export default function TestProjectsPage() {
  const [asanaProjects, setAsanaProjects] = useState<any[]>([])
  const [timelogProjects, setTimelogProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllProjects()
  }, [])

  const fetchAllProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch from Asana API (filter by 2026)
      const asanaRes = await fetch('/api/asana/projects?year=2026')
      const asanaData = await asanaRes.json()
      
      if (asanaData.success) {
        setAsanaProjects(asanaData.projects || [])
      } else {
        console.error('Asana API error:', asanaData.error)
      }

      // Fetch from Time Tracker DB
      const timelogRes = await fetch('/api/db/projects')
      const timelogData = await timelogRes.json()
      
      if (timelogData.success) {
        setTimelogProjects(timelogData.projects || [])
      } else {
        console.error('Time Tracker DB error:', timelogData.error)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#404040]">Projects Test Page</h1>
              <p className="text-gray-600 mt-2">View all projects from Asana API and Time Tracker Database</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchAllProjects}
                disabled={loading}
                className="bg-[#f16a21] hover:bg-[#f79021] text-white"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asana Projects */}
          <Card className="bg-white border-orange-200 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#f16a21] to-[#f79021] rounded-t-2xl text-white">
              <CardTitle className="text-xl font-bold">🔌 Asana API Projects</CardTitle>
              <CardDescription className="text-orange-100">
                {loading ? 'Loading...' : `${asanaProjects.length} projects found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading Asana projects...</div>
              ) : asanaProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No Asana projects found</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {asanaProjects.map((project: any, index: number) => (
                    <div
                      key={project.asana_project_gid || index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#404040] mb-1">
                            {project.asana_project_name || 'Unnamed Project'}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">
                            GID: {project.asana_project_gid}
                          </p>
                          {project.company_name && (
                            <p className="text-xs text-gray-600 mb-1">
                              Company: {project.company_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            project.status === 'under_budget' ? 'bg-green-100 text-green-700' :
                            project.status === 'over_budget' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {project.status === 'under_budget' ? 'Under Budget' :
                             project.status === 'over_budget' ? 'Over Budget' :
                             'On Track'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                        <div>
                          <span className="text-gray-500">Estimated:</span>
                          <span className="ml-2 font-semibold text-[#f16a21]">
                            {project.estimated_hours?.toFixed(2) || '0.00'}h
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Actual:</span>
                          <span className="ml-2 font-semibold text-gray-700">
                            {project.actual_hours?.toFixed(2) || '0.00'}h
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Variance:</span>
                          <span className={`ml-2 font-semibold ${
                            project.variance_hours > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {project.variance_hours?.toFixed(2) || '0.00'}h
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completion:</span>
                          <span className="ml-2 font-semibold">
                            {project.completion_percentage || 0}%
                          </span>
                        </div>
                      </div>
                      {project.total_tasks && (
                        <div className="mt-2 text-xs text-gray-500">
                          Tasks: {project.completed_tasks || 0}/{project.total_tasks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Tracker Projects */}
          <Card className="bg-white border-blue-200 rounded-2xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl text-white">
              <CardTitle className="text-xl font-bold">⏱️ Time Tracker Projects</CardTitle>
              <CardDescription className="text-blue-100">
                {loading ? 'Loading...' : `${timelogProjects.length} projects found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading Time Tracker projects...</div>
              ) : timelogProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No Time Tracker projects found</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {timelogProjects.map((project: any, index: number) => (
                    <div
                      key={project.project_id || project.id || index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#404040] mb-1">
                            {project.project_name || 'Unnamed Project'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            ID: {project.project_id || project.id || 'N/A'}
                          </p>
                          {project.project_id && project.id && project.project_id !== project.id && (
                            <p className="text-xs text-gray-500">
                              Asana GID: {project.project_id}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                        <div>
                          <span className="text-gray-500">Internal ID:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            {project.id || 'N/A'}
                          </span>
                        </div>
                        {project.project_id && (
                          <div>
                            <span className="text-gray-500">Asana GID:</span>
                            <span className="ml-2 font-semibold text-gray-700">
                              {project.project_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-6 bg-white border-gray-200 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#404040]">📊 Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Asana Projects</p>
                <p className="text-2xl font-bold text-[#f16a21]">{asanaProjects.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Time Tracker Projects</p>
                <p className="text-2xl font-bold text-blue-600">{timelogProjects.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Estimated Hours (Asana)</p>
                <p className="text-2xl font-bold text-green-600">
                  {asanaProjects.reduce((sum: number, p: any) => sum + (p.estimated_hours || 0), 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
