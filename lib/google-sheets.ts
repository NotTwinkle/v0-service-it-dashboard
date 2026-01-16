/**
 * Google Sheets API utility functions
 * Handles reading data from your OPS Central Task Registry
 */

interface TaskRegistryRow {
  id: string
  taskName: string
  project?: string
  client?: string
  initiative?: string
  source?: string
  timeTrackerId?: string
  estimated?: number
  logged?: number
  [key: string]: any // Allow additional columns
}

/**
 * Parse Google Sheets CSV data into structured format
 */
export function parseSheetData(csvData: string, headers: string[]): TaskRegistryRow[] {
  const lines = csvData.trim().split('\n')
  if (lines.length < 2) return []

  const rows: TaskRegistryRow[] = []
  
  // Skip header row, process data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    
    if (values.length === 0 || !values[0]) continue // Skip empty rows

    const row: TaskRegistryRow = {
      id: values[0] || '',
      taskName: values[1] || '',
    }

    // Map remaining columns dynamically
    headers.forEach((header, index) => {
      if (index < values.length && values[index]) {
        const key = header.toLowerCase().replace(/\s+/g, '')
        const value = values[index]
        
        // Try to parse numbers
        if (key.includes('estimated') || key.includes('logged') || key.includes('hours')) {
          const num = parseFloat(value)
          if (!isNaN(num)) {
            row[key] = num
          } else {
            row[key] = value
          }
        } else {
          row[key] = value
        }
      }
    })

    rows.push(row)
  }

  return rows
}

/**
 * Fetch data from public Google Sheet (CSV format)
 * Use this for development or if sheet is publicly viewable
 */
export async function fetchPublicSheet(sheetId: string, tabName: string = 'Support'): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
  
  const response = await fetch(url, {
    next: { revalidate: 60 } // Cache for 60 seconds
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.statusText}`)
  }

  return response.text()
}

/**
 * Get tasks from registry sheet
 */
export async function getTasksFromRegistry(
  sheetId?: string,
  tabName: string = 'Support'
): Promise<TaskRegistryRow[]> {
  const id = sheetId || process.env.GOOGLE_SHEET_ID
  
  if (!id) {
    throw new Error('Google Sheet ID not configured. Set GOOGLE_SHEET_ID in .env.local')
  }

  try {
    const csvData = await fetchPublicSheet(id, tabName)
    const lines = csvData.trim().split('\n')
    
    if (lines.length === 0) return []
    
    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    return parseSheetData(csvData, headers)
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error)
    throw error
  }
}

/**
 * Match task from registry to time tracker entry
 */
export function matchTaskToTimeTracker(
  registryTask: TaskRegistryRow,
  timeTrackerEntries: any[]
): any | null {
  if (!registryTask.timeTrackerId) return null

  return timeTrackerEntries.find(
    entry => entry.id === registryTask.timeTrackerId || 
             entry.taskId === registryTask.timeTrackerId
  ) || null
}

/**
 * Reconcile hours across platforms
 */
export function reconcileHours(
  registryTasks: TaskRegistryRow[],
  asanaData: any[],
  ivantiData: any[],
  timeTrackerData: any[]
) {
  const reconciliation = {
    asana: { totalHours: 0, matchedTasks: 0 },
    ivanti: { totalHours: 0, matchedTasks: 0 },
    timeTracker: { totalHours: 0, matchedTasks: 0 },
    discrepancies: [] as Array<{
      taskId: string
      taskName: string
      platform: string
      expected: number
      actual: number
      variance: number
    }>
  }

  // Process each registry task
  registryTasks.forEach(task => {
    // Match with Asana
    const asanaMatch = asanaData.find(a => a.id === task.id || a.taskName === task.taskName)
    if (asanaMatch) {
      reconciliation.asana.totalHours += asanaMatch.logged || 0
      reconciliation.asana.matchedTasks++
      
      if (task.estimated && Math.abs((asanaMatch.logged || 0) - task.estimated) > 0.5) {
        reconciliation.discrepancies.push({
          taskId: task.id,
          taskName: task.taskName,
          platform: 'Asana',
          expected: task.estimated,
          actual: asanaMatch.logged || 0,
          variance: (asanaMatch.logged || 0) - task.estimated
        })
      }
    }

    // Match with Ivanti
    const ivantiMatch = ivantiData.find(i => i.id === task.id || i.taskName === task.taskName)
    if (ivantiMatch) {
      reconciliation.ivanti.totalHours += ivantiMatch.logged || 0
      reconciliation.ivanti.matchedTasks++
      
      if (task.estimated && Math.abs((ivantiMatch.logged || 0) - task.estimated) > 0.5) {
        reconciliation.discrepancies.push({
          taskId: task.id,
          taskName: task.taskName,
          platform: 'Ivanti',
          expected: task.estimated,
          actual: ivantiMatch.logged || 0,
          variance: (ivantiMatch.logged || 0) - task.estimated
        })
      }
    }

    // Match with Time Tracker
    const timeTrackerMatch = matchTaskToTimeTracker(task, timeTrackerData)
    if (timeTrackerMatch) {
      reconciliation.timeTracker.totalHours += timeTrackerMatch.logged || 0
      reconciliation.timeTracker.matchedTasks++
      
      if (task.estimated && Math.abs((timeTrackerMatch.logged || 0) - task.estimated) > 0.5) {
        reconciliation.discrepancies.push({
          taskId: task.id,
          taskName: task.taskName,
          platform: 'Time Tracker',
          expected: task.estimated,
          actual: timeTrackerMatch.logged || 0,
          variance: (timeTrackerMatch.logged || 0) - task.estimated
        })
      }
    }
  })

  return reconciliation
}
