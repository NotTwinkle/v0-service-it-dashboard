import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

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

    // Step 3: Get actual hours from timelogs using reference_number
    // Match reference_number with Asana project GID (project.project_id)
    // Only include entries from January 1, 2026 onwards
    const timelogData = await query<any[]>(
      `SELECT 
        t.reference_number,
        SUM(t.duration) as actual_hours,
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
    // Map: reference_number (Asana GID) -> timelog stats
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

    // Step 4: Build variance report by matching Asana projects with timelogs
    const varianceReport = projectsWithEstimates.map((asanaProject: any) => {
      const asanaGid = String(asanaProject.asana_project_gid)
      
      // Try to match timelogs by reference_number = Asana GID
      const timelogInfo = timelogMap.get(asanaGid) || {
        actual_hours: 0,
        entry_count: 0,
        unique_users: 0
      }

      // Get local project info if available
      const localProject = projectMap.get(asanaGid)

      const estimatedHours = asanaProject.estimated_hours
      const actualHours = timelogInfo.actual_hours
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
        actual_hours: actualHours,
        variance_hours: variance,
        completion_percentage: completionPercentage,
        entry_count: timelogInfo.entry_count,
        unique_contributors: timelogInfo.unique_users,
        has_asana_data: estimatedHours > 0,
        asana_total_tasks: asanaProject.total_tasks || 0,
        asana_completed_tasks: asanaProject.completed_tasks || 0,
        status: variance > 0 ? 'under_budget' : variance < 0 ? 'over_budget' : 'on_track',
        matched_with_timetracker: timelogInfo.actual_hours > 0
      }
    })

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
        total_actual_hours: varianceReport.reduce((sum, p) => sum + p.actual_hours, 0),
        total_variance_hours: varianceReport.reduce((sum, p) => sum + p.variance_hours, 0)
      },
      date_filter: {
        start_date: '2026-01-01',
        note: 'Only timelog entries from January 1, 2026 onwards are included'
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
