import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/db/projects
 * Get all projects from the database
 */
export async function GET() {
  try {
    const database = 'time_trackingv2'

    // Get all projects
    const projects = await query<any[]>(
      `SELECT * FROM project ORDER BY project_name ASC`,
      [],
      database
    )

    return NextResponse.json({
      success: true,
      projects,
      count: projects.length,
    })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch projects',
      },
      { status: 500 }
    )
  }
}
