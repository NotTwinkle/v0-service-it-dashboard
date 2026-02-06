import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { findMatchingCompany, type Company } from '@/lib/company-matcher'

function toSafeString(v: any): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function isNumericLike(v: any): boolean {
  if (v === null || v === undefined) return false
  if (typeof v === 'number') return Number.isFinite(v)
  const s = String(v).trim()
  if (s === '') return false
  return /^-?\d+(\.\d+)?$/.test(s)
}

function toISODateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseISODateOnly(value: string | null): string | null {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const dt = new Date(value + 'T00:00:00')
  if (Number.isNaN(dt.getTime())) return null
  return value
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISODateOnly(d)
}

function diffDaysInclusive(startISO: string, endISO: string): number {
  const start = new Date(startISO + 'T00:00:00')
  const end = new Date(endISO + 'T00:00:00')
  const ms = end.getTime() - start.getTime()
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)) + 1)
}

function toDateKey(v: any): string {
  if (!v) return ''
  if (typeof v === 'string') return v.slice(0, 10)
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return toISODateOnly(d)
}

/**
 * GET /api/projects/[projectGid]/analytics
 * Get comprehensive analytics for a specific project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectGid: string }> }
) {
  try {
    const { projectGid } = await params
    const database = 'time_trackingv2'
    const asanaToken = process.env.ASANA_ACCESS_TOKEN
    const { searchParams } = new URL(request.url)

    if (!asanaToken) {
      return NextResponse.json(
        { success: false, error: 'ASANA_ACCESS_TOKEN not configured' },
        { status: 500 }
      )
    }

    // --- Date range (default: last 30 days) ---
    const todayISO = toISODateOnly(new Date())
    const endDate = parseISODateOnly(searchParams.get('endDate')) ?? todayISO
    const startDate =
      parseISODateOnly(searchParams.get('startDate')) ?? addDays(endDate, -29)

    // Previous period for deltas (same length, immediately preceding)
    const daysInPeriod = diffDaysInclusive(startDate, endDate)
    const prevEndDate = addDays(startDate, -1)
    const prevStartDate = addDays(prevEndDate, -(daysInPeriod - 1))

    // Guardrail: your existing variance logic starts at 2026-01-01
    const MIN_DATE = '2026-01-01'
    const rangeStart = (prevStartDate < MIN_DATE ? MIN_DATE : prevStartDate)
    const rangeEnd = endDate

    // Step 1: Get project details from Asana
    const projectResponse = await fetch(
      `https://app.asana.com/api/1.0/projects/${projectGid}?opt_fields=name,archived,public,color,notes,created_at,modified_at,owner`,
      {
        headers: {
          'Authorization': `Bearer ${asanaToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!projectResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Project not found in Asana' },
        { status: 404 }
      )
    }

    const projectData = await projectResponse.json()
    const project = projectData.data

    // Step 2: Get tasks with custom fields for estimated hours
    let tasks: any[] = []
    try {
      const tasksResponse = await fetch(
        `https://app.asana.com/api/1.0/tasks?project=${projectGid}&opt_fields=name,gid,completed,custom_fields,assignee.name,due_on,created_at,completed_at`,
        {
          headers: {
            'Authorization': `Bearer ${asanaToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        tasks = tasksData.data || []
      } else {
        console.warn(`Failed to fetch tasks for project ${projectGid}: ${tasksResponse.status}`)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      // Continue with empty tasks array
    }

    // Calculate estimated hours from tasks
    let totalEstimated = 0
    const taskEstimates: Array<{ gid: string; name: string; estimated: number; completed: boolean }> = []

    tasks.forEach((task: any) => {
      let taskEstimated = 0
      if (task.custom_fields && Array.isArray(task.custom_fields)) {
        const hoursField = task.custom_fields.find((f: any) => 
          f.name && (
            f.name.toLowerCase() === 'manhours estimate' ||
            f.name.toLowerCase() === 'manhours' ||
            f.name.toLowerCase().includes('manhour')
          ) && f.number_value !== null && f.number_value !== undefined
        )

        if (hoursField && hoursField.number_value) {
          taskEstimated = parseFloat(hoursField.number_value)
        } else {
          const daysField = task.custom_fields.find((f: any) => 
            f.name && (
              f.name.toLowerCase() === 'mandays estimate' ||
              f.name.toLowerCase() === 'mandays' ||
              f.name.toLowerCase().includes('manday')
            ) && f.number_value !== null && f.number_value !== undefined
          )

          if (daysField && daysField.number_value) {
            taskEstimated = parseFloat(daysField.number_value) * 8
          }
        }
      }

      totalEstimated += taskEstimated
      taskEstimates.push({
        gid: task.gid,
        name: task.name,
        estimated: taskEstimated,
        completed: task.completed || false
      })
    })

    // Step 3: Get companies for matching
    let companies: Company[] = []
    let idColumn = 'id'
    let nameColumn = 'name'
    
    try {
      const structure = await query(
        `SHOW COLUMNS FROM ${database}.company`,
        [],
        database
      )
      
      const columns = structure.map((col: any) => col.Field)
      idColumn = columns.find((col: string) => col.toLowerCase().includes('id')) || columns[0] || 'id'
      nameColumn = columns.find((col: string) => col.toLowerCase().includes('name')) || columns.find((col: string) => col.toLowerCase() !== 'id') || 'name'
      
      const companiesRaw = await query<Company[]>(
        `SELECT \`${idColumn}\` as id, \`${nameColumn}\` as name FROM ${database}.company ORDER BY \`${nameColumn}\` ASC`,
        [],
        database
      )
      
      companies = companiesRaw.map((row: any) => ({
        id: row.id || row[columns[0]] || 0,
        name: String(row.name || ''),
      })).filter(c => c.id && c.name)
    } catch (error) {
      console.error('Error fetching companies:', error)
      // Continue with empty companies array
    }

    // Step 3.5: Load category map (id -> name) for analytics
    const categoryIdToName = new Map<string, string>()
    try {
      const categoryRows = await query<any[]>(
        `SELECT category_id, category_name, is_deleted
         FROM ${database}.category`,
        [],
        database
      )

      ;(categoryRows || []).forEach((row: any) => {
        const isDeleted = row?.is_deleted
        if (isDeleted !== null && isDeleted !== undefined && Number(isDeleted) !== 0) return
        const id = toSafeString(row?.category_id).trim()
        const name = toSafeString(row?.category_name).trim()
        if (!id || !name) return
        categoryIdToName.set(id, name)
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Continue with empty map
    }

    function resolveCategoryName(log: any): string {
      // 1) If category_name is already a real label, keep it
      const rawName = toSafeString(log?.category_name).trim()
      if (rawName && !isNumericLike(rawName) && rawName.toLowerCase() !== 'null') return rawName

      // 2) If category_name is actually an id, map it
      if (rawName && isNumericLike(rawName)) {
        const mapped = categoryIdToName.get(String(Number(rawName)))
        if (mapped) return mapped
      }

      // 3) Map common id fields from timelogs (schema varies)
      const candidateIds = [
        log?.category_id,
        log?.categoryId,
        log?.category,
        log?.categoryID,
      ]
      for (const v of candidateIds) {
        if (!isNumericLike(v)) continue
        const key = String(Number(v))
        const mapped = categoryIdToName.get(key)
        if (mapped) return mapped
      }

      return 'Uncategorized'
    }

    // Step 4: Get timelogs for this project
    // Method 1: By reference_number
    let timelogsByRef: any[] = []
    try {
      timelogsByRef = await query<any[]>(
        `SELECT 
          t.*,
          u.email as user_email,
          u.name as user_name,
          c.\`${nameColumn}\` as company_name,
          CASE
            WHEN t.duration IS NULL OR t.duration <= 0 THEN
              TIMESTAMPDIFF(
                MINUTE,
                CONCAT(DATE(t.date), ' ', t.starttime),
                CONCAT(DATE(t.date), ' ', t.endtime)
              ) / 60
            ELSE t.duration
          END as calculated_hours
        FROM timelogs t
        LEFT JOIN users u ON t.user_id = u.user_id
        LEFT JOIN company c ON t.company_id = c.\`${idColumn}\`
        WHERE t.reference_number = ?
          AND DATE(t.date) BETWEEN ? AND ?
        ORDER BY t.date DESC, t.starttime DESC`,
        [projectGid, rangeStart, rangeEnd],
        database
      ) || []
    } catch (error) {
      console.error('Error fetching timelogs by reference:', error)
      // Continue with empty array
    }

    // Method 2: By company name (if project name contains company)
    const projectName = project.name || ''
    const parts = projectName.split('-').map((p: string) => p.trim())
    let timelogsByCompany: any[] = []
    
    if (parts.length >= 2) {
      const companyName = parts[1].trim()
      const matchedCompany = findMatchingCompany(companyName, companies)
      
      if (matchedCompany) {
        // Get timelogs for this company, excluding those already matched by reference_number
        try {
          const companyTimelogs = await query<any[]>(
            `SELECT 
              t.*,
              u.email as user_email,
              u.name as user_name,
              c.\`${nameColumn}\` as company_name,
              CASE
                WHEN t.duration IS NULL OR t.duration <= 0 THEN
                  TIMESTAMPDIFF(
                    MINUTE,
                    CONCAT(DATE(t.date), ' ', t.starttime),
                    CONCAT(DATE(t.date), ' ', t.endtime)
                  ) / 60
                ELSE t.duration
              END as calculated_hours
            FROM timelogs t
            LEFT JOIN users u ON t.user_id = u.user_id
            LEFT JOIN company c ON t.company_id = c.\`${idColumn}\`
            WHERE t.company_id = ?
              AND DATE(t.date) BETWEEN ? AND ?
              AND (t.reference_number IS NULL OR t.reference_number != ?)
            ORDER BY t.date DESC, t.starttime DESC`,
            [matchedCompany.id, rangeStart, rangeEnd, projectGid],
            database
          )
          timelogsByCompany = companyTimelogs || []
        } catch (error) {
          console.error('Error fetching timelogs by company:', error)
          // Continue with empty array
        }
      }
    }

    // Combine timelogs (avoid duplicates)
    const allTimelogs = [...(timelogsByRef || []), ...(timelogsByCompany || [])]
    const uniqueTimelogs = Array.from(
      new Map(allTimelogs.map(log => {
        const uniqueKey = log.row_id || `${log.date || ''}-${log.starttime || ''}-${log.user_id || ''}`
        return [uniqueKey, log]
      })).values()
    )

    // Split into current vs previous period using date keys
    const currentLogs = uniqueTimelogs.filter((l) => {
      const d = toDateKey(l.date)
      return d && d >= startDate && d <= endDate
    })
    const previousLogs = uniqueTimelogs.filter((l) => {
      const d = toDateKey(l.date)
      return d && d >= prevStartDate && d <= prevEndDate
    })

    // Step 5: Calculate analytics (current period)
    const totalActual = currentLogs.reduce((sum, log) => {
      const hours = parseFloat(log.calculated_hours) || 0
      return sum + (isNaN(hours) ? 0 : hours)
    }, 0)
    const variance = totalEstimated - totalActual

    // Time series data (daily hours)
    const dailyHours = new Map<string, number>()
    currentLogs.forEach(log => {
      const date = toDateKey(log.date)
      if (!date) return
      const hours = parseFloat(log.calculated_hours) || 0
      dailyHours.set(date, (dailyHours.get(date) || 0) + hours)
    })

    const timeSeriesData = Array.from(dailyHours.entries())
      .map(([date, hours]) => ({ date: String(date), hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))

    // Contributor breakdown
    const contributorMap = new Map<string, { name: string; email: string; hours: number; entries: number }>()
    currentLogs.forEach(log => {
      const email = String(log.user_email || 'Unknown')
      const name = String(log.user_name || email.split('@')[0])
      const hours = parseFloat(log.calculated_hours) || 0
      
      if (!contributorMap.has(email)) {
        contributorMap.set(email, { name, email, hours: 0, entries: 0 })
      }
      
      const contributor = contributorMap.get(email)!
      contributor.hours += (isNaN(hours) ? 0 : hours)
      contributor.entries += 1
    })

    const contributorBreakdown = Array.from(contributorMap.values())
      .map(c => ({ ...c, hours: Math.round(c.hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours)

    // Detailed user activity - what each user did
    const userActivityMap = new Map<string, {
      name: string
      email: string
      total_hours: number
      total_entries: number
      entries: Array<{
        date: string
        hours: number
        category: string
        task_description?: string
        starttime?: string
        endtime?: string
        notes?: string
      }>
      categories: Map<string, number>
      daily_breakdown: Map<string, number>
    }>()

    currentLogs.forEach(log => {
      const email = String(log.user_email || 'Unknown')
      const name = String(log.user_name || email.split('@')[0])
      const hours = parseFloat(log.calculated_hours) || 0
      const dateStr = toDateKey(log.date)
      const categoryName = resolveCategoryName(log)
      
      if (!userActivityMap.has(email)) {
        userActivityMap.set(email, {
          name,
          email,
          total_hours: 0,
          total_entries: 0,
          entries: [],
          categories: new Map(),
          daily_breakdown: new Map()
        })
      }

      const userActivity = userActivityMap.get(email)!
      userActivity.total_hours += (isNaN(hours) ? 0 : hours)
      userActivity.total_entries += 1

      // Add entry details
      if (dateStr) {
        userActivity.entries.push({
          date: dateStr,
          hours: Math.round(hours * 100) / 100,
          category: categoryName,
          task_description: log.task_description || log.description || undefined,
          starttime: log.starttime || undefined,
          endtime: log.endtime || undefined,
          notes: log.notes || undefined
        })

        // Track categories
        userActivity.categories.set(categoryName, (userActivity.categories.get(categoryName) || 0) + hours)

        // Track daily breakdown
        userActivity.daily_breakdown.set(dateStr, (userActivity.daily_breakdown.get(dateStr) || 0) + hours)
      }
    })

    // Convert user activity to array format
    const userActivity = Array.from(userActivityMap.values()).map(user => ({
      name: user.name,
      email: user.email,
      total_hours: Math.round(user.total_hours * 100) / 100,
      total_entries: user.total_entries,
      entries: user.entries.sort((a, b) => b.date.localeCompare(a.date)), // Most recent first
      categories: Array.from(user.categories.entries())
        .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
        .sort((a, b) => b.hours - a.hours),
      daily_breakdown: Array.from(user.daily_breakdown.entries())
        .map(([date, hours]) => ({ date, hours: Math.round(hours * 100) / 100 }))
        .sort((a, b) => a.date.localeCompare(b.date))
    })).sort((a, b) => b.total_hours - a.total_hours) // Sort by total hours descending

    // Category breakdown (if category_name exists)
    const categoryMap = new Map<string, number>()
    currentLogs.forEach(log => {
      const category = resolveCategoryName(log)
      const hours = parseFloat(log.calculated_hours) || 0
      categoryMap.set(category, (categoryMap.get(category) || 0) + (isNaN(hours) ? 0 : hours))
    })

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours)

    // Task completion stats
    const completedTasks = tasks.filter((t: any) => t.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Weekly breakdown
    const weeklyData = new Map<string, number>()
    currentLogs.forEach(log => {
      const dateStr = toDateKey(log.date) || null
      if (!dateStr) return // Skip if no date
      
      const date = new Date(dateStr + 'T00:00:00')
      if (isNaN(date.getTime())) return // Skip if invalid date
      
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]
      const hours = log.calculated_hours || 0
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + hours)
    })

    const weeklyBreakdown = Array.from(weeklyData.entries())
      .map(([week, hours]) => ({ week: String(week), hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => String(a.week).localeCompare(String(b.week)))

    // Previous period summary (for deltas / KPI context)
    const prevActual = previousLogs.reduce((sum, log) => {
      const hours = parseFloat(log.calculated_hours) || 0
      return sum + (isNaN(hours) ? 0 : hours)
    }, 0)
    const prevEntryCount = previousLogs.length
    const prevContributorCount = new Set(
      previousLogs.map((l: any) => String(l.user_email || 'Unknown'))
    ).size

    return NextResponse.json({
      success: true,
      project: {
        gid: projectGid,
        name: project.name || 'Unnamed Project',
        created_at: project.created_at || null,
        modified_at: project.modified_at || null,
        owner: project.owner?.name || null,
      },
      date_filter: {
        startDate,
        endDate,
      },
      previous_date_filter: {
        startDate: prevStartDate,
        endDate: prevEndDate,
      },
      summary: {
        estimated_hours: Math.round(totalEstimated * 100) / 100,
        actual_hours: Math.round(totalActual * 100) / 100,
        variance_hours: Math.round(variance * 100) / 100,
        completion_percentage: totalEstimated > 0 ? Math.min(100, Math.round((totalActual / totalEstimated) * 100)) : 0,
        status: variance > 0 ? 'under_budget' : variance < 0 ? 'over_budget' : 'on_track',
        total_timelog_entries: currentLogs.length,
        unique_contributors: contributorBreakdown.length,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_rate: Math.round(completionRate * 100) / 100,
      },
      previous_summary: {
        actual_hours: Math.round(prevActual * 100) / 100,
        total_timelog_entries: prevEntryCount,
        unique_contributors: prevContributorCount,
      },
      time_series: timeSeriesData,
      weekly_breakdown: weeklyBreakdown,
      contributors: contributorBreakdown,
      categories: categoryBreakdown,
      tasks: taskEstimates,
      timelogs: currentLogs.slice(0, 200), // Current period recent entries
      user_activity: userActivity, // Detailed user activity breakdown
    })
  } catch (error: any) {
    console.error('Error fetching project analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project analytics'
      },
      { status: 500 }
    )
  }
}
