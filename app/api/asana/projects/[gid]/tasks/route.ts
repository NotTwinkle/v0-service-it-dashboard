import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/asana/projects/[gid]/tasks
 * Fetch tasks for a specific Asana project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gid: string }> }
) {
  try {
    const { gid } = await params
    const ASANA_TOKEN = process.env.ASANA_ACCESS_TOKEN

    if (!ASANA_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Asana access token not configured' },
        { status: 500 }
      )
    }

    // Step 1: Fetch sections for this project
    const sectionsResponse = await fetch(
      `https://app.asana.com/api/1.0/projects/${gid}/sections?opt_fields=name,gid`,
      {
        headers: {
          'Authorization': `Bearer ${ASANA_TOKEN}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    )

    let sections: any[] = []
    if (sectionsResponse.ok) {
      const sectionsData = await sectionsResponse.json()
      sections = (sectionsData.data || []).map((section: any) => ({
        gid: section.gid,
        name: section.name,
      }))
    }

    // Step 2: Fetch tasks with section information
    // We need to get tasks and their memberships to know which section they belong to
    const tasksResponse = await fetch(
      `https://app.asana.com/api/1.0/projects/${gid}/tasks?opt_fields=name,completed,assignee.name,due_on,created_at,memberships.section.name,memberships.section.gid`,
      {
        headers: {
          'Authorization': `Bearer ${ASANA_TOKEN}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!tasksResponse.ok) {
      const errorText = await tasksResponse.text()
      console.error('Asana API error:', errorText)
      return NextResponse.json(
        { success: false, error: `Asana API error: ${tasksResponse.status}` },
        { status: tasksResponse.status }
      )
    }

    const tasksData = await tasksResponse.json()
    const allTasks = tasksData.data || []
    
    // Step 3: Group tasks by section
    const tasksBySection = new Map<string, any[]>()
    const unassignedTasks: any[] = []

    allTasks.forEach((task: any) => {
      const taskInfo = {
        gid: task.gid,
        name: task.name,
        completed: task.completed,
        assignee: task.assignee?.name || 'Unassigned',
        due_on: task.due_on,
        created_at: task.created_at,
      }

      // Find which section this task belongs to
      const membership = task.memberships?.find((m: any) => m.section)
      const sectionGid = membership?.section?.gid
      const sectionName = membership?.section?.name

      if (sectionGid && sectionName) {
        // Task belongs to a section
        if (!tasksBySection.has(sectionGid)) {
          tasksBySection.set(sectionGid, [])
        }
        tasksBySection.get(sectionGid)!.push(taskInfo)
      } else {
        // Task doesn't belong to any section (unassigned)
        unassignedTasks.push(taskInfo)
      }
    })

    // Step 4: Build sections array with their tasks
    const sectionsWithTasks = sections.map((section: any) => ({
      gid: section.gid,
      name: section.name,
      tasks: tasksBySection.get(section.gid) || [],
      task_count: (tasksBySection.get(section.gid) || []).length,
    }))

    // Add unassigned section if there are tasks without sections
    if (unassignedTasks.length > 0) {
      sectionsWithTasks.push({
        gid: 'unassigned',
        name: 'Unassigned',
        tasks: unassignedTasks,
        task_count: unassignedTasks.length,
      })
    }

    // Calculate totals
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t: any) => t.completed).length

    return NextResponse.json({
      success: true,
      project_gid: gid,
      sections: sectionsWithTasks,
      tasks: allTasks.map((task: any) => ({
        gid: task.gid,
        name: task.name,
        completed: task.completed,
        assignee: task.assignee?.name || 'Unassigned',
        due_on: task.due_on,
        created_at: task.created_at,
        section_gid: task.memberships?.find((m: any) => m.section)?.section?.gid || null,
        section_name: task.memberships?.find((m: any) => m.section)?.section?.name || null,
      })),
      total: totalTasks,
      completed: completedTasks,
      incomplete: totalTasks - completedTasks,
    })
  } catch (error: any) {
    console.error('Error fetching Asana tasks:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
