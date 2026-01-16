import { NextResponse } from 'next/server'
import { getTasksFromRegistry } from '@/lib/google-sheets'

/**
 * GET /api/sheets/tabs
 * Get data from all tabs in the registry
 * Useful for getting a complete overview of all task categories
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetId = searchParams.get('sheetId') || undefined

    // All available tabs in your OPS Central Task Registry
    const tabs = [
      'Support',
      'Project',
      'Initiative',
      'Enablement',
      'Presales',
      'Internal Events'
    ]

    const results: Record<string, any> = {}

    // Fetch data from each tab
    for (const tab of tabs) {
      try {
        const tasks = await getTasksFromRegistry(sheetId, tab)
        results[tab] = {
          success: true,
          count: tasks.length,
          data: tasks
        }
      } catch (error: any) {
        results[tab] = {
          success: false,
          error: error.message || 'Failed to fetch',
          count: 0,
          data: []
        }
      }
    }

    // Calculate totals
    const totalTasks = Object.values(results).reduce((sum: number, tab: any) => sum + (tab.count || 0), 0)
    const successfulTabs = Object.values(results).filter((tab: any) => tab.success).length

    return NextResponse.json({
      success: true,
      summary: {
        totalTabs: tabs.length,
        successfulTabs,
        totalTasks
      },
      tabs: results
    })
  } catch (error: any) {
    console.error('Error fetching all tabs:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch tabs'
      },
      { status: 500 }
    )
  }
}
