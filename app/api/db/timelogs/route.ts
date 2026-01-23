import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/db/timelogs?limit=100&offset=0
 * Get time logs from the database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const database = 'time_trackingv2'

    // Get time logs with related data
    const timelogs = await query<any[]>(
      `SELECT * FROM timelogs ORDER BY date DESC LIMIT ? OFFSET ?`,
      [limit, offset],
      database
    )

    // Get total count
    const totalResult = await query<any[]>(
      `SELECT COUNT(*) as total FROM timelogs`,
      [],
      database
    )
    const total = totalResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: timelogs,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching timelogs:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch timelogs',
      },
      { status: 500 }
    )
  }
}
