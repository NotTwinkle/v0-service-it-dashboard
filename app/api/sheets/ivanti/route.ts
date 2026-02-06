import { NextResponse } from 'next/server'

/**
 * GET /api/sheets/ivanti
 * Fetch Ivanti tickets from Google Sheets (Ivanti tab)
 * This is where n8n workflow writes the data
 * Sheet: https://docs.google.com/spreadsheets/d/1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4/edit
 */
export async function GET() {
  try {
    const SHEET_ID = '1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4'
    const SHEET_NAME = 'Ivanti' // Tab name (from ivanti.json line 248)
    const GOOGLE_API_KEY = process.env.GOOGLE_SHEETS_API_KEY

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets API key not configured' },
        { status: 500 }
      )
    }

    // Fetch data from Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Sheets API error:', errorText)
      return NextResponse.json(
        { success: false, error: `Google Sheets API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rows = data.values || []

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        tickets: [],
        total: 0,
      })
    }

    // Parse header row
    const headers = rows[0]
    
    // Find column indices (case-insensitive) - matching n8n output schema
    const getColumnIndex = (name: string) => {
      return headers.findIndex((h: string) => 
        h?.toLowerCase().includes(name.toLowerCase())
      )
    }

    const supportIdIndex = getColumnIndex('SUPPORT-ID') || getColumnIndex('support-id')
    const ticketNumIndex = getColumnIndex('Ticket Number') || getColumnIndex('ticket')
    const companyIndex = getColumnIndex('Company Name') || getColumnIndex('company')
    const actualEffortIndex = getColumnIndex('Actual Effort') || getColumnIndex('actual effort')
    const statusIndex = getColumnIndex('Status') || getColumnIndex('status')
    const taskNameIndex = getColumnIndex('Task Name') || getColumnIndex('task name')
    const categoryIndex = getColumnIndex('Category') || getColumnIndex('category')

    // Parse data rows
    const tickets: any[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      
      const ticketNum = ticketNumIndex >= 0 ? row[ticketNumIndex] : null
      const company = companyIndex >= 0 ? row[companyIndex] : null
      const actualEffort = actualEffortIndex >= 0 ? parseFloat(row[actualEffortIndex]) || 0 : 0
      const status = statusIndex >= 0 ? row[statusIndex] : null
      const taskName = taskNameIndex >= 0 ? row[taskNameIndex] : null
      const category = categoryIndex >= 0 ? row[categoryIndex] : null

      if (ticketNum) {
        tickets.push({
          ticket_number: ticketNum,
          company,
          actual_effort: actualEffort,
          status,
          task_name: taskName,
          category,
          support_id: supportIdIndex >= 0 ? row[supportIdIndex] : null,
          row_index: i,
        })
      }
    }

    // Group by ticket number AND category (since same ticket number can be in both Incident and ServiceReq)
    const ticketGroups = new Map<string, any>()
    
    tickets.forEach(ticket => {
      const category = ticket.category || 'Unknown'
      const key = `${ticket.ticket_number}::${category}` // Composite key
      
      if (ticketGroups.has(key)) {
        const existing = ticketGroups.get(key)
        existing.actual_effort += ticket.actual_effort
        existing.task_count += 1
        existing.tasks.push({
          description: ticket.task_name || 'No description',
          actual_effort: ticket.actual_effort,
        })
      } else {
        ticketGroups.set(key, {
          ticket_number: ticket.ticket_number,
          category: category,
          company: ticket.company,
          actual_effort: ticket.actual_effort,
          status: ticket.status,
          task_count: 1,
          tasks: [{
            description: ticket.task_name || 'No description',
            actual_effort: ticket.actual_effort,
          }],
        })
      }
    })

    // Convert to array and sort by actual effort (descending)
    const groupedTickets = Array.from(ticketGroups.values())
      .sort((a, b) => b.actual_effort - a.actual_effort)

    return NextResponse.json({
      success: true,
      tickets: groupedTickets,
      total: groupedTickets.length,
      total_effort: groupedTickets.reduce((sum, t) => sum + t.actual_effort, 0),
      source: 'google_sheets',
    })
  } catch (error: any) {
    console.error('Error fetching Google Sheets Ivanti data:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Ivanti data' },
      { status: 500 }
    )
  }
}
