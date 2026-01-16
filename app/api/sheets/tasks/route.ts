import { NextResponse } from 'next/server'
import { getTasksFromRegistry } from '@/lib/google-sheets'

/**
 * GET /api/sheets/tasks
 * Fetch all tasks from Google Sheets registry
 * 
 * Query params:
 * - tab: Sheet tab name (default: 'Support')
 * - sheetId: Override default sheet ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tabName = searchParams.get('tab') || 'Support'
    const sheetId = searchParams.get('sheetId') || undefined

    const tasks = await getTasksFromRegistry(sheetId, tabName)

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length
    })
  } catch (error: any) {
    console.error('Error fetching tasks from Google Sheets:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch tasks from Google Sheets',
        // Return empty array in development to prevent breaking the app
        data: process.env.NODE_ENV === 'development' ? [] : undefined
      },
      { status: 500 }
    )
  }
}
