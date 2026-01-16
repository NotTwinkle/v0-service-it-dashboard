import { NextResponse } from 'next/server'
import { getTasksFromRegistry, reconcileHours } from '@/lib/google-sheets'

/**
 * GET /api/sheets/reconciliation
 * Get reconciliation data comparing hours across platforms
 * 
 * This endpoint uses the registry to match tasks and calculate discrepancies
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tabName = searchParams.get('tab') || 'Support'
    const sheetId = searchParams.get('sheetId') || undefined

    // Get registry tasks
    const registryTasks = await getTasksFromRegistry(sheetId, tabName)

    // TODO: Replace with actual API calls to Asana, Ivanti, and Time Tracker
    // For now, using mock data structure
    const asanaData: any[] = [] // Replace with: await fetchAsanaData()
    const ivantiData: any[] = [] // Replace with: await fetchIvantiData()
    const timeTrackerData: any[] = [] // Replace with: await fetchTimeTrackerData()

    // Perform reconciliation
    const reconciliation = reconcileHours(
      registryTasks,
      asanaData,
      ivantiData,
      timeTrackerData
    )

    return NextResponse.json({
      success: true,
      data: {
        registry: {
          totalTasks: registryTasks.length,
          tasks: registryTasks
        },
        reconciliation,
        summary: {
          totalDiscrepancies: reconciliation.discrepancies.length,
          platforms: {
            asana: {
              totalHours: reconciliation.asana.totalHours,
              matchedTasks: reconciliation.asana.matchedTasks
            },
            ivanti: {
              totalHours: reconciliation.ivanti.totalHours,
              matchedTasks: reconciliation.ivanti.matchedTasks
            },
            timeTracker: {
              totalHours: reconciliation.timeTracker.totalHours,
              matchedTasks: reconciliation.timeTracker.matchedTasks
            }
          }
        }
      }
    })
  } catch (error: any) {
    console.error('Error performing reconciliation:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to perform reconciliation'
      },
      { status: 500 }
    )
  }
}
