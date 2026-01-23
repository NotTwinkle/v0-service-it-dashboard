import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/db/timelogs/stats
 * Get aggregated statistics from timelogs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const database = 'time_trackingv2'

    let dateFilter = ''
    const params: any[] = []

    if (startDate && endDate) {
      dateFilter = 'WHERE date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    // Get total hours (using duration column, not hours)
    const totalHoursResult = await query<any[]>(
      `SELECT SUM(duration) as total FROM timelogs ${dateFilter}`,
      params,
      database
    )
    const totalHours = totalHoursResult[0]?.total || 0

    // Get hours by day of week (using duration column)
    const weeklyData = await query<any[]>(
      `SELECT 
        DAYNAME(date) as day,
        DAYOFWEEK(date) as dayNum,
        SUM(duration) as hours
      FROM timelogs 
      ${dateFilter}
      GROUP BY DAYNAME(date), DAYOFWEEK(date)
      ORDER BY DAYOFWEEK(date)`,
      params,
      database
    )

    // Get hours by project: timelogs has no project_id or project_name, so skip project aggregation
    const projectHours: { project_name: string | null; total_hours: number; users: number }[] = []

    // Get hours by user (for reconciliation / real user breakdown)
    const userFilter = dateFilter ? dateFilter.replace('date', 't.date') : ''
    const userHours = dateFilter
      ? await query<any[]>(
          `SELECT 
            u.user_id,
            u.name as user_name,
            u.email,
            SUM(t.duration) as total_hours,
            COUNT(*) as entry_count
          FROM timelogs t
          INNER JOIN users u ON t.user_id = u.user_id
          ${userFilter}
          GROUP BY u.user_id, u.name, u.email
          ORDER BY total_hours DESC`,
          params,
          database
        )
      : []

    // Get hours by activity (using duration column)
    // Note: timelogs table doesn't have activity_id, using category instead
    const activityFilter = dateFilter ? dateFilter.replace('date', 't.date') : ''
    const activityHours = await query<any[]>(
      `SELECT 
        c.category_name,
        SUM(t.duration) as total_hours
      FROM timelogs t
      LEFT JOIN category c ON t.category = c.category_id
      ${activityFilter}
      GROUP BY c.category_name
      ORDER BY total_hours DESC
      LIMIT 10`,
      params,
      database
    )

    // Get total unique users
    const usersResult = await query<any[]>(
      `SELECT COUNT(DISTINCT user_id) as total FROM timelogs ${dateFilter}`,
      params,
      database
    )
    const totalUsers = usersResult[0]?.total || 0

    // Get total entries
    const entriesResult = await query<any[]>(
      `SELECT COUNT(*) as total FROM timelogs ${dateFilter}`,
      params,
      database
    )
    const totalEntries = entriesResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalHours: parseFloat(totalHours) || 0,
        totalUsers,
        totalEntries,
      },
      weeklyData: weeklyData.map((row: any) => ({
        day: row.day,
        hours: parseFloat(row.hours) || 0,
      })),
      projectHours: projectHours.map((row: any) => ({
        project_name: row.project_name,
        total_hours: parseFloat(row.total_hours) || 0,
        users: row.users || 0
      })),
      activityHours: activityHours.map((row: any) => ({
        activity_name: row.category_name,
        total_hours: parseFloat(row.total_hours) || 0
      })),
      userHours: (userHours as any[]).map((row: any) => ({
        user_id: row.user_id,
        user_name: row.user_name || 'Unknown',
        email: row.email || '',
        total_hours: parseFloat(row.total_hours) || 0,
        entry_count: row.entry_count || 0
      }))
    })
  } catch (error: any) {
    console.error('Error fetching timelog stats:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch timelog statistics',
      },
      { status: 500 }
    )
  }
}
