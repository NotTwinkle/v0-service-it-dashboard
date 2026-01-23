import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/asana/projects
 * Fetches projects directly from Asana REST API
 * Gets project details, tasks, and calculates estimated hours
 * Then matches with actual hours from time tracker database
 */
export async function GET(request: Request) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const projectIds = searchParams.get('project_ids') // Comma-separated list
    const workspaceId = searchParams.get('workspace_id') || process.env.ASANA_WORKSPACE_GID
    const yearFilter = searchParams.get('year') // No default year
    const optFields = 'name,archived,public,color,notes,created_at,modified_at,owner,custom_fields'

    // Step 1: Get all projects from Asana
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

    // Filter by project IDs if provided
    if (projectIds) {
      const idsArray = projectIds.split(',').map(id => id.trim())
      allProjects = allProjects.filter((p: any) => idsArray.includes(p.gid))
    }

    // Filter out archived projects
    allProjects = allProjects.filter((p: any) => !p.archived)

    // Step 2: Get tasks for each project and calculate estimated hours
    const projectsWithTasks = await Promise.all(
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
              ...project,
              tasks: [],
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
                // 2. Check for "Mandays Estimate" (old projects fallback)
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
            company_name: '', // Not available in Asana API, can be extracted from name or custom field
            estimated_hours: Math.round(totalEstimated * 100) / 100,
            total_tasks: tasks.length,
            completed_tasks: completedTasks,
            archived: project.archived || false,
            color: project.color,
            notes: project.notes,
            created_at: project.created_at,
            modified_at: project.modified_at
          }
        } catch (error: any) {
          console.error(`Error processing project ${project.gid}:`, error)
          return {
            asana_project_gid: project.gid,
            asana_project_name: project.name,
            company_name: '',
            estimated_hours: 0,
            total_tasks: 0,
            completed_tasks: 0,
            error: error.message
          }
        }
      })
    )

    // Step 3: Skip actual hours from timelogs - timelogs table has no project_id or project_name columns
    // Since we're only showing estimated hours in the personal dashboard, we'll set actual_hours to 0
    // Step 4: Format projects with estimated hours only
    const varianceReport = projectsWithTasks.map(project => {
      const estimatedHours = project.estimated_hours
      // Actual hours not available since timelogs has no project columns
      const actualHours = 0
      const variance = estimatedHours - actualHours
      const completionPercentage = 0 // Can't calculate without actual hours

      return {
        asana_project_gid: project.asana_project_gid,
        asana_project_name: project.asana_project_name,
        company_name: project.company_name,
        estimated_hours: estimatedHours,
        total_tasks: project.total_tasks,
        completed_tasks: project.completed_tasks,
        actual_hours: actualHours,
        variance_hours: variance,
        completion_percentage: completionPercentage,
        entry_count: 0,
        unique_contributors: 0,
        has_asana_data: estimatedHours > 0,
        status: 'no_actual_data' as const,
        matched_with_timetracker: false,
        archived: project.archived,
        color: project.color
      }
    })

    // Sort by absolute variance
    varianceReport.sort((a, b) => Math.abs(b.variance_hours) - Math.abs(a.variance_hours))

    return NextResponse.json({
      success: true,
      source: 'asana_api',
      year_filter: yearFilter || null,
      projects: varianceReport,
      summary: {
        total_projects: varianceReport.length,
        projects_with_asana_data: varianceReport.filter(p => p.has_asana_data).length,
        projects_matched_timetracker: varianceReport.filter(p => p.matched_with_timetracker).length,
        total_estimated_hours: varianceReport.reduce((sum, p) => sum + p.estimated_hours, 0),
        total_actual_hours: varianceReport.reduce((sum, p) => sum + p.actual_hours, 0),
        total_variance_hours: varianceReport.reduce((sum, p) => sum + p.variance_hours, 0)
      }
    })

  } catch (error: any) {
    console.error('Error fetching from Asana API:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project data from Asana',
        source: 'asana_api'
      },
      { status: 500 }
    )
  }
}
