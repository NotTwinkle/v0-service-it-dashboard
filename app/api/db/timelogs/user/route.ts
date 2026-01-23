import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface TimelogRecord {
  date: string
  starttime: string
  endtime: string
  stored_duration: number
  category_id: number | null
  category_name: string | null
  asana_project_gid: string | null
  project_name: string | null
  user_name: string
  user_email: string
  calculated_hours: number
  row_id: string // Composite unique identifier
}

/**
 * GET /api/db/timelogs/user?email=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Fetches timelogs for a specific user. Optional startDate/endDate filter.
 */
export async function GET(request: Request) {
  try {
    const database = 'time_trackingv2'
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    let dateFilter = ''
    const params: string[] = [userEmail]
    if (startDate && endDate) {
      dateFilter = ' AND t.date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    const timelogs = await query<TimelogRecord>(
      `SELECT 
        DATE_FORMAT(t.date, '%Y-%m-%d') as date,
        t.starttime,
        t.endtime,
        t.duration as stored_duration,
        t.category as category_id,
        c.category_name,
        NULL as asana_project_gid,
        NULL as project_name,
        COALESCE(t.user_name, u.name) as user_name,
        u.email as user_email,
        TIMESTAMPDIFF(MINUTE, 
          CONCAT(t.date, ' ', t.starttime), 
          CONCAT(t.date, ' ', t.endtime)
        ) / 60 as calculated_hours,
        CONCAT(DATE_FORMAT(t.date, '%Y%m%d'), '_', t.user_id, '_', TIME_FORMAT(t.starttime, '%H%i%s')) as row_id
      FROM timelogs t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN category c ON t.category = c.category_id
      WHERE u.email = ?${dateFilter}
      ORDER BY t.date DESC, t.starttime DESC`,
      params,
      database
    )

    // Calculate total hours
    const totalHours = timelogs.reduce((sum, log) => {
      return sum + (Number(log.calculated_hours) || 0)
    }, 0)

    // Group by date
    const byDate = timelogs.reduce((acc: any, log: any) => {
      const date = log.date
      if (!acc[date]) {
        acc[date] = {
          date,
          logs: [],
          total_hours: 0
        }
      }
      const hours = Number(log.calculated_hours) || 0
      acc[date].logs.push({
        ...log,
        calculated_hours: Math.round(hours * 100) / 100
      })
      acc[date].total_hours += hours
      return acc
    }, {})

    // Convert to array and sort by date descending
    const groupedByDate = Object.values(byDate)
      .map((group: any) => ({
        ...group,
        total_hours: Math.round(group.total_hours * 100) / 100
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      user_email: userEmail,
      timelogs: timelogs.map(log => ({
        ...log,
        calculated_hours: Math.round(Number(log.calculated_hours) * 100) / 100
      })),
      grouped_by_date: groupedByDate,
      summary: {
        total_entries: timelogs.length,
        total_hours: Math.round(totalHours * 100) / 100,
        unique_projects: [...new Set(timelogs.map(log => log.project_name).filter(Boolean))].length,
        date_range: {
          earliest: timelogs.length > 0 ? timelogs[timelogs.length - 1].date : null,
          latest: timelogs.length > 0 ? timelogs[0].date : null
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching user timelogs:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch user timelogs'
      },
      { status: 500 }
    )
  }
}
