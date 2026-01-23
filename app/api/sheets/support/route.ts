import { NextResponse } from 'next/server'

/**
 * GET /api/sheets/support
 * Fetch support tickets from Google Sheets
 * Sheet: https://docs.google.com/spreadsheets/d/1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4/edit
 */
export async function GET() {
  try {
    const SHEET_ID = '1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4'
    const SHEET_NAME = 'Support' // Tab name
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
    
    // Find column indices (case-insensitive)
    const getColumnIndex = (name: string) => {
      return headers.findIndex((h: string) => 
        h?.toLowerCase().includes(name.toLowerCase())
      )
    }

    const ticketNumIndex = getColumnIndex('ticket') || getColumnIndex('incident')
    const companyIndex = getColumnIndex('company') || getColumnIndex('client')
    const actualEffortIndex = getColumnIndex('actual effort') || getColumnIndex('actual hours')
    const statusIndex = getColumnIndex('status')
    const descriptionIndex = getColumnIndex('description') || getColumnIndex('summary')

    // Parse data rows
    const tickets: any[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      
      const ticketNum = ticketNumIndex >= 0 ? row[ticketNumIndex] : null
      const company = companyIndex >= 0 ? row[companyIndex] : null
      const actualEffort = actualEffortIndex >= 0 ? parseFloat(row[actualEffortIndex]) || 0 : 0
      const status = statusIndex >= 0 ? row[statusIndex] : null
      const description = descriptionIndex >= 0 ? row[descriptionIndex] : null

      if (ticketNum) {
        tickets.push({
          ticket_number: ticketNum,
          company,
          actual_effort: actualEffort,
          status,
          description,
          row_index: i,
        })
      }
    }

    // Group by ticket number and sum actual effort
    const ticketGroups = new Map<string, any>()
    
    tickets.forEach(ticket => {
      const key = ticket.ticket_number
      
      if (ticketGroups.has(key)) {
        const existing = ticketGroups.get(key)
        existing.actual_effort += ticket.actual_effort
        existing.task_count += 1
        existing.tasks.push({
          description: ticket.description,
          actual_effort: ticket.actual_effort,
        })
      } else {
        ticketGroups.set(key, {
          ticket_number: ticket.ticket_number,
          company: ticket.company,
          actual_effort: ticket.actual_effort,
          status: ticket.status,
          task_count: 1,
          tasks: [{
            description: ticket.description,
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
    })
  } catch (error: any) {
    console.error('Error fetching Google Sheets support data:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch support data' },
      { status: 500 }
    )
  }
}
