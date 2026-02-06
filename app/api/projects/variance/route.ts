import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { findMatchingCompany, type Company } from '@/lib/company-matcher'

type IvantiTicket = {
  company: string | null
  category?: string | null
  ticket_number?: string | null
  actual_effort: number
  status?: string | null
}

async function fetchIvantiTicketsFromSheets(): Promise<{ tickets: IvantiTicket[]; source: 'google_sheets' } | null> {
  const GOOGLE_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
  if (!GOOGLE_API_KEY) return null

  // Same sheet as `/api/sheets/ivanti`
  const SHEET_ID = '1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4'
  const SHEET_NAME = 'Ivanti'
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_API_KEY}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  const rows: any[] = data.values || []
  if (rows.length < 2) return { tickets: [], source: 'google_sheets' }

  const headers: string[] = rows[0] || []
  const col = (needle: string) => headers.findIndex((h) => String(h || '').toLowerCase().includes(needle))

  const idxTicket = col('ticket')
  const idxCompany = col('company')
  const idxEffort = col('actual effort')
  const idxStatus = col('status')
  const idxCategory = col('category')

  const tickets: IvantiTicket[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || []
    const ticket_number = idxTicket >= 0 ? String(r[idxTicket] ?? '').trim() : ''
    if (!ticket_number) continue
    const company = idxCompany >= 0 ? String(r[idxCompany] ?? '').trim() : ''
    const actual_effort = idxEffort >= 0 ? (parseFloat(r[idxEffort]) || 0) : 0
    const status = idxStatus >= 0 ? String(r[idxStatus] ?? '').trim() : null
    const category = idxCategory >= 0 ? String(r[idxCategory] ?? '').trim() : null

    tickets.push({
      ticket_number,
      company: company || null,
      actual_effort,
      status,
      category,
    })
  }

  return { tickets, source: 'google_sheets' }
}

/**
 * GET /api/projects/variance
 * Calculate variance between Asana estimated hours and actual logged hours
 * Matches projects using reference_number column in timelogs
 * Only includes timelog entries from January 1, 2026 onwards
 * Returns: project list with estimated (Asana) vs actual (timelogs)
 */
export async function GET() {
  try {
    const database = 'time_trackingv2'
    const asanaToken = process.env.ASANA_ACCESS_TOKEN

    if (!asanaToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'ASANA_ACCESS_TOKEN not configured in environment variables'
        },
        { status: 500 }
      )
    }

    // Step 1: Get all projects from Asana with estimated hours
    const workspaceId = process.env.ASANA_WORKSPACE_GID
    const optFields = 'name,archived,public,color,notes,created_at,modified_at,owner,custom_fields'
    
    let projectsUrl = 'https://app.asana.com/api/1.0/projects'
    if (workspaceId) {
      projectsUrl += `?workspace=${workspaceId}`
    }
    projectsUrl += workspaceId ? `&${optFields}` : `?${optFields}`

    const projectsResponse = await fetch(projectsUrl, {
      headers: {
        'Authorization': `Bearer ${asanaToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!projectsResponse.ok) {
      const errorText = await projectsResponse.text()
      throw new Error(`Asana API error: ${projectsResponse.status} - ${errorText}`)
    }

    const projectsData = await projectsResponse.json()
    let allProjects = projectsData.data || []
    
    // Filter out archived projects
    allProjects = allProjects.filter((p: any) => !p.archived)

    // Step 2: Get tasks for each project and calculate estimated hours
    const projectsWithEstimates = await Promise.all(
      allProjects.map(async (project: any) => {
        try {
          // Get tasks for this project
          const tasksUrl = `https://app.asana.com/api/1.0/tasks?project=${project.gid}&opt_fields=name,gid,completed,custom_fields`
          
          const tasksResponse = await fetch(tasksUrl, {
            headers: {
              'Authorization': `Bearer ${asanaToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (!tasksResponse.ok) {
            console.error(`Failed to fetch tasks for project ${project.gid}`)
            return {
              asana_project_gid: project.gid,
              asana_project_name: project.name,
              estimated_hours: 0,
              total_tasks: 0,
              completed_tasks: 0
            }
          }

          const tasksData = await tasksResponse.json()
          const tasks = tasksData.data || []

          // Calculate estimated hours from tasks
          let totalEstimated = 0
          let completedTasks = 0

          tasks.forEach((task: any) => {
            if (task.completed) completedTasks++

            // Debug: Log custom field names for first task of first few projects
            if (tasks.indexOf(task) === 0 && allProjects.indexOf(project) < 3) {
              console.log(`[DEBUG] Project: ${project.name}`)
              console.log(`[DEBUG] Task: ${task.name}`)
              if (task.custom_fields && task.custom_fields.length > 0) {
                console.log(`[DEBUG] Custom fields:`, task.custom_fields.map((f: any) => ({ name: f.name, type: f.resource_type, value: f.number_value || f.text_value || f.enum_value?.name })))
              } else {
                console.log(`[DEBUG] No custom fields found`)
              }
            }

            // Look for estimated hours/days in custom fields
            if (task.custom_fields && Array.isArray(task.custom_fields)) {
              // 1. Check for "ManHours Estimate" (priority)
              const hoursField = task.custom_fields.find((f: any) => 
                f.name && (
                  f.name.toLowerCase() === 'manhours estimate' ||
                  f.name.toLowerCase() === 'manhours' ||
                  f.name.toLowerCase() === 'man-hours' ||
                  f.name.toLowerCase().includes('manhour')
                ) && f.number_value !== null && f.number_value !== undefined
              )

              if (hoursField && hoursField.number_value) {
                totalEstimated += parseFloat(hoursField.number_value)
              } else {
                // 2. Check for "Mandays Estimate" (fallback)
                const daysField = task.custom_fields.find((f: any) => 
                  f.name && (
                    f.name.toLowerCase() === 'mandays estimate' ||
                    f.name.toLowerCase() === 'mandays' ||
                    f.name.toLowerCase() === 'man-days' ||
                    f.name.toLowerCase().includes('manday')
                  ) && f.number_value !== null && f.number_value !== undefined
                )

                if (daysField && daysField.number_value) {
                  // 1 manday = 8 man hours
                  totalEstimated += parseFloat(daysField.number_value) * 8
                }
              }
            }
          })

          return {
            asana_project_gid: project.gid,
            asana_project_name: project.name,
            estimated_hours: Math.round(totalEstimated * 100) / 100,
            total_tasks: tasks.length,
            completed_tasks: completedTasks
          }
        } catch (error: any) {
          console.error(`Error processing project ${project.gid}:`, error)
          return {
            asana_project_gid: project.gid,
            asana_project_name: project.name,
            estimated_hours: 0,
            total_tasks: 0,
            completed_tasks: 0,
            error: error.message
          }
        }
      })
    )

    // Step 3: Get companies for company name matching
    // First, get the table structure to find the correct column names
    const structure = await query(
      `SHOW COLUMNS FROM ${database}.company`,
      [],
      database
    )
    
    // Find the column names
    const columns = structure.map((col: any) => col.Field)
    const idColumn = columns.find((col: string) => col.toLowerCase().includes('id')) || columns[0]
    const nameColumn = columns.find((col: string) => col.toLowerCase().includes('name')) || columns.find((col: string) => col.toLowerCase() !== 'id')
    const emailColumn = columns.find((col: string) => col.toLowerCase().includes('email'))
    
    // Build SELECT query with actual column names
    const selectColumns = [idColumn, nameColumn]
    if (emailColumn) selectColumns.push(emailColumn)
    
    const companiesRaw = await query<Company[]>(
      `SELECT ${selectColumns.join(', ')} FROM ${database}.company ORDER BY ${nameColumn} ASC`,
      [],
      database
    )
    
    // Map to expected format
    const companies = companiesRaw.map((row: any) => ({
      id: row[idColumn] || row[columns[0]],
      name: row[nameColumn] || '',
      email: emailColumn ? (row[emailColumn] || null) : null,
    }))

    // Step 3.5: Load Ivanti ticket effort and map to company IDs
    // Note: Ivanti dataset currently has no reliable date fields, so this is NOT date-filtered.
    const ivantiFromSheets = await fetchIvantiTicketsFromSheets()
    const ivantiTickets = ivantiFromSheets?.tickets ?? []
    const ivantiHoursByCompanyId = new Map<number, { hours: number; ticket_count: number }>()
    if (ivantiTickets.length > 0 && companies.length > 0) {
      for (const t of ivantiTickets) {
        if (!t.company) continue
        const match = findMatchingCompany(t.company, companies)
        if (!match?.id) continue
        const prev = ivantiHoursByCompanyId.get(match.id) ?? { hours: 0, ticket_count: 0 }
        prev.hours += Number.isFinite(t.actual_effort) ? t.actual_effort : 0
        prev.ticket_count += 1
        ivantiHoursByCompanyId.set(match.id, prev)
      }
    }

    // Step 4: Get actual hours from timelogs using reference_number
    // Match reference_number with Asana project GID (project.project_id)
    // Only include entries from January 1, 2026 onwards
    const timelogData = await query<any[]>(
      `SELECT 
        t.reference_number,
        SUM(
          CASE
            WHEN t.duration IS NULL OR t.duration <= 0 THEN
              TIMESTAMPDIFF(
                MINUTE,
                CONCAT(DATE(t.date), ' ', t.starttime),
                CONCAT(DATE(t.date), ' ', t.endtime)
              ) / 60
            ELSE t.duration
          END
        ) as actual_hours,
        COUNT(*) as entry_count,
        COUNT(DISTINCT t.user_id) as unique_users
      FROM timelogs t
      WHERE t.reference_number IS NOT NULL 
        AND t.reference_number != ''
        AND t.date >= '2026-01-01'
      GROUP BY t.reference_number`,
      [],
      database
    )

    // Also get project table to match reference_number with project.project_id (Asana GID)
    const projectTable = await query<any[]>(
      `SELECT id, project_id, project_name FROM project`,
      [],
      database
    )

    // Create lookup maps
    // Map: reference_number (Asana GID) -> timelog stats (primary matching method)
    const timelogMap = new Map<string, {
      actual_hours: number
      entry_count: number
      unique_users: number
    }>()

    timelogData.forEach((row: any) => {
      const refNumber = String(row.reference_number).trim()
      timelogMap.set(refNumber, {
        actual_hours: parseFloat(row.actual_hours) || 0,
        entry_count: parseInt(row.entry_count) || 0,
        unique_users: parseInt(row.unique_users) || 0
      })
    })

    // Map: project.project_id (Asana GID) -> project info
    const projectMap = new Map<string, { id: number; project_name: string }>()
    projectTable.forEach((p: any) => {
      projectMap.set(String(p.project_id), {
        id: p.id,
        project_name: p.project_name
      })
    })
    
    // Helper function to fetch timelogs by company name
    // Uses company_id in timelogs -> company table -> match company name to Asana project
    // Excludes timelogs already matched by reference_number to avoid double counting
    const getTimelogsByCompanyName = async (companyName: string, excludeReferenceNumbers: Set<string> = new Set()) => {
      try {
        // Get the company ID(s) that match the company name using smart matching
        const matchingCompanies = companies.filter(c => 
          findMatchingCompany(companyName, [c]) !== null
        )
        
        if (matchingCompanies.length === 0) {
          console.log(`[Variance API] No matching company found for "${companyName}" in companies table`)
          return null
        }
        
        const companyIds = matchingCompanies.map(c => c.id)
        console.log(`[Variance API] Matching companies for "${companyName}":`, matchingCompanies.map(c => `${c.name} (ID: ${c.id})`))
        
        // Build exclusion clause if we have reference numbers to exclude
        let excludeClause = ''
        const params: any[] = []
        
        if (excludeReferenceNumbers.size > 0) {
          const excludeList = Array.from(excludeReferenceNumbers)
          excludeClause = ` AND (t.reference_number IS NULL OR t.reference_number NOT IN (${excludeList.map(() => '?').join(',')}))`
          params.push(...excludeList)
        }
        
        // Match timelogs by company_id
        // This directly matches timelogs.company_id to company.id
        const companyTimelogs = await query<any[]>(
          `SELECT 
            SUM(
              CASE
                WHEN t.duration IS NULL OR t.duration <= 0 THEN
                  TIMESTAMPDIFF(
                    MINUTE,
                    CONCAT(DATE(t.date), ' ', t.starttime),
                    CONCAT(DATE(t.date), ' ', t.endtime)
                  ) / 60
                ELSE t.duration
              END
            ) as actual_hours,
            COUNT(*) as entry_count,
            COUNT(DISTINCT t.user_id) as unique_users
          FROM timelogs t
          WHERE t.date >= '2026-01-01'
            AND t.company_id IS NOT NULL
            AND t.company_id IN (${companyIds.map(() => '?').join(',')})
            ${excludeClause}`,
          [...companyIds, ...params],
          database
        )
        
        if (companyTimelogs && companyTimelogs.length > 0) {
          const row = companyTimelogs[0]
          const result = {
            actual_hours: parseFloat(row.actual_hours) || 0,
            entry_count: parseInt(row.entry_count) || 0,
            unique_users: parseInt(row.unique_users) || 0
          }
          
          // Debug logging
          console.log(`[Variance API] Found timelogs for company "${companyName}":`, {
            actual_hours: result.actual_hours,
            entry_count: result.entry_count,
            unique_users: result.unique_users,
            matched_company_ids: companyIds,
            matched_companies: matchingCompanies.map(c => c.name),
            excluded_reference_numbers: Array.from(excludeReferenceNumbers)
          })
          
          return result
        } else {
          console.log(`[Variance API] No timelogs found for company "${companyName}" with company_ids:`, companyIds)
        }
      } catch (error) {
        console.error(`Error fetching timelogs for company ${companyName}:`, error)
      }
      return null
    }

    // Step 5: Build variance report by matching Asana projects with timelogs
    // Use BOTH methods: reference_number AND company name matching (combine results)
    const varianceReport = await Promise.all(
      projectsWithEstimates.map(async (asanaProject: any) => {
        const asanaGid = String(asanaProject.asana_project_gid)
        
        // Method 1: Match timelogs by reference_number = Asana GID
        const referenceNumberTimelogs = timelogMap.get(asanaGid) || {
          actual_hours: 0,
          entry_count: 0,
          unique_users: 0
        }

        // Method 2: Match timelogs by company name (extract from "Year - Client - Product")
        // Exclude timelogs already matched by reference_number to avoid double counting
        let companyNameTimelogs = {
          actual_hours: 0,
          entry_count: 0,
          unique_users: 0
        }
        
        if (companies.length > 0) {
          const projectName = asanaProject.asana_project_name || ''
          const parts = projectName.split('-').map((p: string) => p.trim())
          
          if (parts.length >= 2) {
            const companyName = parts[1].trim()
            const matchedCompany = findMatchingCompany(companyName, companies)
            
            if (matchedCompany) {
              // Exclude reference numbers already matched to avoid double counting
              const excludeRefs = new Set<string>()
              if (referenceNumberTimelogs.actual_hours > 0) {
                excludeRefs.add(asanaGid)
              }
              
              // Fetch timelogs for this company (excluding those already matched by reference_number)
              const companyTimelogsResult = await getTimelogsByCompanyName(matchedCompany.name, excludeRefs)
              
              if (companyTimelogsResult && companyTimelogsResult.actual_hours > 0) {
                companyNameTimelogs = companyTimelogsResult
              }
            }
          }
        }

        // Combine both methods: Add timelogs from both reference_number AND company name matching
        // This ensures we get ALL timelogs for the project/company, regardless of how they're matched
        const timelogInfo = {
          actual_hours: referenceNumberTimelogs.actual_hours + companyNameTimelogs.actual_hours,
          entry_count: referenceNumberTimelogs.entry_count + companyNameTimelogs.entry_count,
          unique_users: Math.max(referenceNumberTimelogs.unique_users, companyNameTimelogs.unique_users)
        }
        
        // Track which methods matched
        const matchedBy = []
        if (referenceNumberTimelogs.actual_hours > 0) matchedBy.push('reference_number')
        if (companyNameTimelogs.actual_hours > 0) matchedBy.push('company_name')

      // Get local project info if available
      const localProject = projectMap.get(asanaGid)

      const estimatedHours = asanaProject.estimated_hours
      const actualHoursTimeTracker = timelogInfo.actual_hours

      // Ivanti effort by matched company (project naming convention: "Year - Client - Product")
      let ivantiHours = 0
      let ivantiTicketCount = 0
      const projectNameForCompany = asanaProject.asana_project_name || ''
      const parts = projectNameForCompany.split('-').map((p: string) => p.trim())
      if (parts.length >= 2 && companies.length > 0) {
        const companyName = parts[1].trim()
        const matchedCompany = findMatchingCompany(companyName, companies)
        if (matchedCompany?.id) {
          const agg = ivantiHoursByCompanyId.get(matchedCompany.id)
          if (agg) {
            ivantiHours = Math.round((agg.hours || 0) * 100) / 100
            ivantiTicketCount = agg.ticket_count || 0
          }
        }
      }

      // Actual = Time Tracker + Ivanti (requested)
      const actualHours = actualHoursTimeTracker + ivantiHours
      const variance = estimatedHours - actualHours
      const completionPercentage = estimatedHours > 0 
        ? Math.min(100, Math.round((actualHours / estimatedHours) * 100))
        : 0

      return {
        project_id: localProject?.id || null,
        asana_project_gid: asanaGid,
        project_name: localProject?.project_name || asanaProject.asana_project_name,
        asana_project_name: asanaProject.asana_project_name,
        estimated_hours: estimatedHours,
        actual_hours: actualHours, // combined (Time Tracker + Ivanti)
        actual_hours_timetracker: actualHoursTimeTracker,
        actual_hours_ivanti: ivantiHours,
        variance_hours: variance,
        completion_percentage: completionPercentage,
        entry_count: timelogInfo.entry_count,
        unique_contributors: timelogInfo.unique_users,
        ivanti_ticket_count: ivantiTicketCount,
        has_asana_data: estimatedHours > 0,
        asana_total_tasks: asanaProject.total_tasks || 0,
        asana_completed_tasks: asanaProject.completed_tasks || 0,
        status: variance > 0 ? 'under_budget' : variance < 0 ? 'over_budget' : 'on_track',
        matched_with_timetracker: timelogInfo.actual_hours > 0,
        matched_by: matchedBy.length > 0 ? matchedBy.join('+') : null
      }
      })
    )

    // Sort by absolute variance (largest first)
    varianceReport.sort((a, b) => Math.abs(b.variance_hours) - Math.abs(a.variance_hours))

    return NextResponse.json({
      success: true,
      projects: varianceReport,
      summary: {
        total_projects: varianceReport.length,
        projects_with_asana_data: varianceReport.filter(p => p.has_asana_data).length,
        projects_matched_timetracker: varianceReport.filter(p => p.matched_with_timetracker).length,
        total_estimated_hours: varianceReport.reduce((sum, p) => sum + p.estimated_hours, 0),
        total_actual_hours: varianceReport.reduce((sum, p) => sum + p.actual_hours, 0), // combined
        total_actual_hours_timetracker: varianceReport.reduce((sum: number, p: any) => sum + (p.actual_hours_timetracker || 0), 0),
        total_actual_hours_ivanti: varianceReport.reduce((sum: number, p: any) => sum + (p.actual_hours_ivanti || 0), 0),
        total_variance_hours: varianceReport.reduce((sum, p) => sum + p.variance_hours, 0)
      },
      date_filter: {
        start_date: '2026-01-01',
        note: 'Time Tracker timelog entries from January 1, 2026 onwards are included. Ivanti effort is included (not date-filtered).'
      }
    })

  } catch (error: any) {
    console.error('Error calculating variance:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate variance'
      },
      { status: 500 }
    )
  }
}
