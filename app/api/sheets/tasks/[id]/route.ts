import { NextResponse } from 'next/server'
import { getTasksFromRegistry } from '@/lib/google-sheets'

/**
 * GET /api/sheets/tasks/[id]
 * Fetch a specific task by ID from Google Sheets registry
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const tabName = searchParams.get('tab') || 'Support'
    const sheetId = searchParams.get('sheetId') || undefined

    const tasks = await getTasksFromRegistry(sheetId, tabName)
    const task = tasks.find(t => t.id === params.id || t.id === String(params.id))

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error: any) {
    console.error('Error fetching task from Google Sheets:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch task from Google Sheets'
      },
      { status: 500 }
    )
  }
}
