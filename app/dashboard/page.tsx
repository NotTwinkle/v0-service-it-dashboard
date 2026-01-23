"use client"

import { useState, useEffect } from "react"
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
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Target,
  Zap,
  CheckCircle,
  Ticket
} from "lucide-react"

const COLORS = ["#f16a21", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"]

// Skeleton Loading Components
const SkeletonCard = () => (
  <Card className="border-gray-100 shadow-sm">
    <CardHeader className="pb-3">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-10 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
    </CardContent>
  </Card>
)

const SkeletonProjectCard = () => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-6 ml-6">
          <div className="text-center">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="ml-4">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
)

const SkeletonTaskItem = () => (
  <div className="p-3 hover:bg-gray-50 transition-colors">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-6">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

/**
 * Organization Dashboard - Variance Tracking
 * Purpose: Track estimated hours vs actual hours across platforms (Asana, Ivanti)
 * Shows: Per-project variance, contributors, and overall statistics
 */
export default function OrganizationDashboard() {
  const [loading, setLoading] = useState(true)
  
  // Asana variance data
  const [asanaProjects, setAsanaProjects] = useState<any[]>([])
  const [asanaSummary, setAsanaSummary] = useState<any>(null)
  
  // Expanded projects tracking
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  
  // Tasks and support tickets data
  const [projectTasks, setProjectTasks] = useState<Map<string, any>>(new Map())
  const [projectSupport, setProjectSupport] = useState<Map<string, any>>(new Map())
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [loadingSupportTickets, setLoadingSupportTickets] = useState(false)
  
  // Track how many tasks to show per project
  const [visibleTasksCount, setVisibleTasksCount] = useState<Map<string, number>>(new Map())
  
  // Track expanded sections per project
  const [expandedSections, setExpandedSections] = useState<Map<string, Set<string>>>(new Map())
  
  // Track visible tasks per section
  const [visibleTasksPerSection, setVisibleTasksPerSection] = useState<Map<string, number>>(new Map())
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'over_budget' | 'under_budget' | 'on_track'>('all')
  const [showTopOnly, setShowTopOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'variance' | 'estimated' | 'actual' | 'name'>('variance')
  
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch Asana variance data and support tickets
  useEffect(() => {
    fetchAsanaVariance()
    fetchSupportTickets()
  }, [])

  const fetchAsanaVariance = async () => {
    try {
      setLoading(true)
      setApiError(null)
      
      const response = await fetch('/api/projects/variance')
      const data = await response.json()
      
      if (data.success) {
        setAsanaProjects(data.projects || [])
        setAsanaSummary(data.summary || null)
      } else {
        setApiError(data.error || 'Failed to fetch variance data')
      }
    } catch (error: any) {
      console.error('Error fetching variance data:', error)
      setApiError(error.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSupportTickets = async () => {
    try {
      setLoadingSupportTickets(true)
      const response = await fetch('/api/sheets/support')
      const data = await response.json()
      
      if (data.success) {
        setSupportTickets(data.tickets || [])
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error)
    } finally {
      setLoadingSupportTickets(false)
    }
  }

  const fetchProjectTasks = async (projectGid: string) => {
    if (projectTasks.has(projectGid)) return // Already loaded
    
    setLoadingTasks(prev => new Set(prev).add(projectGid))
    
    try {
      const response = await fetch(`/api/asana/projects/${projectGid}/tasks`)
      const data = await response.json()
      
      if (data.success) {
        setProjectTasks(prev => new Map(prev).set(projectGid, data))
        
        // Expand all sections by default
        if (data.sections && data.sections.length > 0) {
          const sectionGids: string[] = data.sections.map((s: any) => String(s.gid))
          const allSectionGids = new Set<string>(sectionGids)
          setExpandedSections(prev => new Map(prev).set(projectGid, allSectionGids))
        }
      }
    } catch (error: any) {
      console.error('Error fetching project tasks:', error)
    } finally {
      setLoadingTasks(prev => {
        const next = new Set(prev)
        next.delete(projectGid)
        return next
      })
    }
  }

  const getProjectSupportTickets = (projectName: string) => {
    // Extract company name from project name (format: Year - Company - Product)
    const parts = projectName.split('-').map(p => p.trim())
    if (parts.length < 2) return []
    
    const companyName = parts[1] // Second part is company name
    
    // Find tickets matching this company (case-insensitive)
    const matchingTickets = supportTickets.filter(ticket => 
      ticket.company?.toLowerCase().includes(companyName.toLowerCase())
    )
    
    // Return top 3 by actual effort
    return matchingTickets.slice(0, 3)
  }

  // Filter and sort projects
  const filteredProjects = asanaProjects
    .filter(p => {
      // Only show projects with "2026" in the title
      const projectName = p.project_name || p.asana_project_name || ''
      return projectName.includes('2026')
    })
    .filter(p => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          p.project_name?.toLowerCase().includes(searchLower) ||
          p.asana_project_name?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter(p => {
      // Status filter
      if (statusFilter === 'all') return true
      return p.status === statusFilter
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case 'variance':
          return Math.abs(b.variance_hours) - Math.abs(a.variance_hours)
        case 'estimated':
          return b.estimated_hours - a.estimated_hours
        case 'actual':
          return b.actual_hours - a.actual_hours
        case 'name':
          return (a.project_name || a.asana_project_name || '').localeCompare(b.project_name || b.asana_project_name || '')
        default:
          return 0
      }
    })

  const displayProjects = showTopOnly ? filteredProjects.slice(0, 3) : filteredProjects

  // Calculate summary
  const filteredSummary = {
    total_projects: filteredProjects.length,
    total_estimated: filteredProjects.reduce((sum, p) => sum + p.estimated_hours, 0),
    total_actual: filteredProjects.reduce((sum, p) => sum + p.actual_hours, 0),
    total_variance: filteredProjects.reduce((sum, p) => sum + p.variance_hours, 0),
    projects_over: filteredProjects.filter(p => p.status === 'over_budget').length,
    projects_under: filteredProjects.filter(p => p.status === 'under_budget').length,
    projects_on_track: filteredProjects.filter(p => p.status === 'on_track').length,
  }

  // Variance distribution for chart
  const varianceChartData = [
    { name: 'Over Budget', value: filteredSummary.projects_over, fill: '#ef4444' },
    { name: 'Under Budget', value: filteredSummary.projects_under, fill: '#10b981' },
    { name: 'On Track', value: filteredSummary.projects_on_track, fill: '#6b7280' },
  ].filter(item => item.value > 0)

  // Toggle project expansion
  const toggleProject = (projectGid: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectGid)) {
      // Collapsing - reset visible tasks count and sections
      newExpanded.delete(projectGid)
      setVisibleTasksCount(prev => {
        const next = new Map(prev)
        next.delete(projectGid)
        return next
      })
      setExpandedSections(prev => {
        const next = new Map(prev)
        next.delete(projectGid)
        return next
      })
    } else {
      // Expanding - fetch tasks
      newExpanded.add(projectGid)
      fetchProjectTasks(projectGid)
    }
    setExpandedProjects(newExpanded)
  }

  // Toggle section expansion
  const toggleSection = (projectGid: string, sectionGid: string) => {
    setExpandedSections(prev => {
      const projectSections = prev.get(projectGid) || new Set()
      const newSections = new Set(projectSections)
      
      if (newSections.has(sectionGid)) {
        newSections.delete(sectionGid)
      } else {
        newSections.add(sectionGid)
      }
      
      const next = new Map(prev)
      next.set(projectGid, newSections)
      return next
    })
  }

  // Get visible tasks count for a section
  const getVisibleTasksCount = (projectGid: string, sectionGid: string) => {
    const key = `${projectGid}-${sectionGid}`
    return visibleTasksPerSection.get(key) || 3
  }

  // Set visible tasks count for a section
  const setVisibleTasksCountForSection = (projectGid: string, sectionGid: string, count: number) => {
    const key = `${projectGid}-${sectionGid}`
    setVisibleTasksPerSection(prev => new Map(prev).set(key, count))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/Service IT Logo Remake.avif" alt="Service IT+" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Variance Tracking Dashboard</h1>
                <p className="text-xs text-orange-100">Estimated vs Actual Hours</p>
              </div>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-white text-[#f16a21] hover:bg-orange-50 font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview KPIs */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#404040] mb-2">Project Overview</h2>
          <p className="text-gray-600 mb-6">
            Track project hours (Asana + Support) • <span className="font-semibold text-[#f16a21]">2026 Projects Only</span>
          </p>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total Estimated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#f16a21]">
                      {filteredSummary.total_estimated.toFixed(1)}h
                    </p>
                    <p className="text-sm text-gray-600 mt-1">From Asana projects</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-emerald-600">
                      {filteredSummary.total_actual.toFixed(1)}h
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Logged in time tracker</p>
                  </CardContent>
                </Card>

                <Card className={`shadow-sm hover:shadow-md transition-shadow ${filteredSummary.total_variance >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total Variance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${filteredSummary.total_variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {filteredSummary.total_variance >= 0 ? '+' : ''}{filteredSummary.total_variance.toFixed(1)}h
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredSummary.total_variance >= 0 ? 'Under budget' : 'Over budget'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Active Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {filteredSummary.total_projects}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">With 2026 in title</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-12">
          <div className="mb-6">

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="over_budget">Over Budget</option>
                  <option value="under_budget">Under Budget</option>
                  <option value="on_track">On Track</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm font-medium"
                >
                  <option value="variance">Sort by Variance</option>
                  <option value="estimated">Sort by Estimated</option>
                  <option value="actual">Sort by Actual</option>
                  <option value="name">Sort by Name</option>
                </select>

                <button
                  onClick={() => setShowTopOnly(!showTopOnly)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    showTopOnly
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {showTopOnly ? 'Show All' : 'Top 3 Only'}
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Projects Found</p>
                  <p className="text-2xl font-bold text-[#404040]">{filteredSummary.total_projects}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 mb-1">Over Budget</p>
                  <p className="text-2xl font-bold text-red-600">{filteredSummary.projects_over}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs text-emerald-700 mb-1">Under Budget</p>
                  <p className="text-2xl font-bold text-emerald-600">{filteredSummary.projects_under}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">On Track</p>
                  <p className="text-2xl font-bold text-gray-600">{filteredSummary.projects_on_track}</p>
                </div>
              </div>
            )}
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonProjectCard key={i} />
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No projects found</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayProjects.map((project) => {
                const isExpanded = expandedProjects.has(project.asana_project_gid)
                
                return (
                  <Card key={project.asana_project_gid} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Project Header - Clickable */}
                    <button
                      onClick={() => toggleProject(project.asana_project_gid)}
                      className="w-full text-left"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-[#404040] truncate">
                                  {project.project_name || project.asana_project_name || 'Unnamed Project'}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-500">
                                    {project.entry_count} time {project.entry_count === 1 ? 'entry' : 'entries'}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {project.unique_contributors} {project.unique_contributors === 1 ? 'contributor' : 'contributors'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hours Summary - Compact */}
                          <div className="flex items-center gap-6 ml-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Estimated</p>
                              <p className="text-xl font-bold text-[#f16a21]">{project.estimated_hours.toFixed(1)}h</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Actual</p>
                              <p className="text-xl font-bold text-emerald-600">{project.actual_hours.toFixed(1)}h</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Variance</p>
                              <p className={`text-xl font-bold ${project.variance_hours > 0 ? 'text-emerald-600' : project.variance_hours < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {project.variance_hours >= 0 ? '+' : ''}{project.variance_hours.toFixed(1)}h
                              </p>
                            </div>

                            {/* Expand Icon */}
                            <div className="ml-4">
                              {isExpanded ? (
                                <ChevronUp className="h-6 w-6 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {project.estimated_hours > 0 && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  project.completion_percentage >= 100 
                                    ? 'bg-red-500'
                                    : project.completion_percentage >= 80
                                    ? 'bg-orange-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, project.completion_percentage)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </button>

                    {/* Expanded Content - Asana Tasks + Support Tickets */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-6 space-y-6">
                          {/* Asana Tasks Section */}
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-[#f16a21]" />
                              Asana Tasks
                              {projectTasks.has(project.asana_project_gid) && (
                                <span className="text-xs text-gray-500 font-normal">
                                  ({projectTasks.get(project.asana_project_gid)?.total || 0} tasks)
                                </span>
                              )}
                            </h5>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {loadingTasks.has(project.asana_project_gid) ? (
                                <div className="divide-y divide-gray-200">
                                  {[1, 2, 3].map((i) => (
                                    <SkeletonTaskItem key={i} />
                                  ))}
                                </div>
                              ) : projectTasks.has(project.asana_project_gid) ? (
                                (() => {
                                  const tasksData = projectTasks.get(project.asana_project_gid)
                                  const sections = tasksData?.sections || []
                                  const projectGid = project.asana_project_gid
                                  const expandedSectionsForProject = expandedSections.get(projectGid) || new Set()

                                  if (sections.length === 0) {
                                    // Fallback: show tasks without sections (backward compatibility)
                                    const allTasks = tasksData?.tasks || []
                                    if (allTasks.length === 0) {
                                      return (
                                        <div className="p-4 text-center">
                                          <p className="text-sm text-gray-500">No tasks found</p>
                                        </div>
                                      )
                                    }
                                    // Show flat list if no sections
                                    return (
                                      <div className="divide-y divide-gray-200">
                                        {allTasks.map((task: any) => (
                                          <div key={task.gid} className="p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  {task.completed ? (
                                                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                  ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                  )}
                                                  <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                                    {task.name}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 ml-6">
                                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {task.assignee}
                                                  </span>
                                                  {task.due_on && (
                                                    <>
                                                      <span className="text-xs text-gray-400">•</span>
                                                      <span className="text-xs text-gray-500">Due: {new Date(task.due_on).toLocaleDateString()}</span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  }

                                  return (
                                    <div className="divide-y divide-gray-200">
                                      {sections.map((section: any) => {
                                        const sectionGid = section.gid
                                        const isSectionExpanded = expandedSectionsForProject.has(sectionGid)
                                        const sectionTasks = section.tasks || []
                                        const visibleCount = getVisibleTasksCount(projectGid, sectionGid)
                                        const visibleTasks = sectionTasks.slice(0, visibleCount)
                                        const remainingCount = sectionTasks.length - visibleCount
                                        const showAll = visibleCount >= sectionTasks.length

                                        return (
                                          <div key={sectionGid} className="border-b border-gray-200 last:border-b-0">
                                            {/* Section Header */}
                                            <button
                                              onClick={() => toggleSection(projectGid, sectionGid)}
                                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                              <div className="flex items-center gap-2">
                                                {isSectionExpanded ? (
                                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                  <ChevronDown className="h-4 w-4 text-gray-500 -rotate-90" />
                                                )}
                                                <span className="text-sm font-semibold text-gray-700">
                                                  {section.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  ({section.task_count} {section.task_count === 1 ? 'task' : 'tasks'})
                                                </span>
                                              </div>
                                            </button>

                                            {/* Section Tasks */}
                                            {isSectionExpanded && (
                                              <div className="bg-gray-50">
                                                {sectionTasks.length > 0 ? (
                                                  <>
                                                    {visibleTasks.length === 0 ? (
                                                      <div className="p-3 pl-8">
                                                        <div className="space-y-2">
                                                          {[1, 2, 3].map((i) => (
                                                            <SkeletonTaskItem key={i} />
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      visibleTasks.map((task: any) => (
                                                      <div key={task.gid} className="p-3 pl-8 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                          <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                              {task.completed ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                              ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                              )}
                                                              <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                                                {task.name}
                                                              </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 ml-6">
                                                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {task.assignee}
                                                              </span>
                                                              {task.due_on && (
                                                                <>
                                                                  <span className="text-xs text-gray-400">•</span>
                                                                  <span className="text-xs text-gray-500">Due: {new Date(task.due_on).toLocaleDateString()}</span>
                                                                </>
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      ))
                                                    )}
                                                    
                                                    {remainingCount > 0 && (
                                                      <button
                                                        onClick={() => {
                                                          const newCount = Math.min(visibleCount + 3, sectionTasks.length)
                                                          setVisibleTasksCountForSection(projectGid, sectionGid, newCount)
                                                        }}
                                                        className="w-full p-3 text-center bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600 font-medium"
                                                      >
                                                        +{remainingCount} more {remainingCount === 1 ? 'task' : 'tasks'}
                                                      </button>
                                                    )}
                                                    
                                                    {showAll && sectionTasks.length > 3 && (
                                                      <button
                                                        onClick={() => {
                                                          setVisibleTasksCountForSection(projectGid, sectionGid, 3)
                                                        }}
                                                        className="w-full p-3 text-center bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600 font-medium"
                                                      >
                                                        Show less
                                                      </button>
                                                    )}
                                                  </>
                                                ) : (
                                                  <div className="p-3 pl-8 text-sm text-gray-500">
                                                    No tasks in this section
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )
                                })()
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-gray-500">Failed to load tasks</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-gray-50 px-3 text-sm text-gray-500 font-medium">Support Tickets</span>
                            </div>
                          </div>

                          {/* Support/Ivanti Tickets Section */}
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Ticket className="h-4 w-4 text-blue-600" />
                              Top 3 Support Tickets
                              {(() => {
                                const tickets = getProjectSupportTickets(project.project_name || project.asana_project_name || '')
                                return tickets.length > 0 && (
                                  <span className="text-xs text-gray-500 font-normal">
                                    ({tickets.length} found)
                                  </span>
                                )
                              })()}
                            </h5>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {loadingSupportTickets ? (
                                <div className="divide-y divide-gray-200">
                                  {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                          </div>
                                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                                          <div className="flex items-center gap-3">
                                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (() => {
                                const tickets = getProjectSupportTickets(project.project_name || project.asana_project_name || '')
                                
                                if (tickets.length === 0) {
                                  return (
                                    <div className="p-4 text-center">
                                      <p className="text-sm text-gray-500">No support tickets found for this project</p>
                                    </div>
                                  )
                                }

                                return (
                                  <div className="divide-y divide-gray-200">
                                    {tickets.map((ticket: any, idx: number) => (
                                      <div key={ticket.ticket_number} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                {ticket.ticket_number}
                                              </span>
                                              {ticket.status && (
                                                <span className="text-xs text-gray-500">
                                                  {ticket.status}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                              {ticket.company}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {ticket.actual_effort.toFixed(1)}h total effort
                                              </span>
                                              <span>•</span>
                                              <span>{ticket.task_count} {ticket.task_count === 1 ? 'task' : 'tasks'}</span>
                                            </div>
                                            {ticket.tasks && ticket.tasks.length > 0 && (
                                              <div className="mt-2 ml-4 space-y-1">
                                                {ticket.tasks.map((task: any, taskIdx: number) => (
                                                  <div key={taskIdx} className="text-xs text-gray-500">
                                                    • {task.description || 'No description'} ({task.actual_effort}h)
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600">
                                              {ticket.actual_effort.toFixed(1)}h
                                            </p>
                                            <p className="text-xs text-gray-500">Logged</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          {/* Variance Distribution Chart */}
          {varianceChartData.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#404040]">Project Status Distribution</CardTitle>
                <CardDescription>Overview of how projects are performing against estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={varianceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {varianceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
