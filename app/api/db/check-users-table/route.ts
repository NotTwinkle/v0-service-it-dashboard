import { NextResponse } from 'next/server'
import { getTableStructure, query } from '@/lib/db'

/**
 * GET /api/db/check-users-table
 * Check the structure of the users table
 */
export async function GET() {
  try {
    const database = 'time_trackingv2'
    const table = 'users'
    
    const structure = await getTableStructure(database, table)
    const sampleData = await query<any[]>(
      `SELECT * FROM \`${table}\` LIMIT 5`,
      [],
      database
    )
    
    return NextResponse.json({
      success: true,
      structure: structure.map((col: any) => ({
        name: col.Field,
        type: col.Type,
        null: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
      })),
      sampleData,
      totalRows: (await query<any[]>(`SELECT COUNT(*) as count FROM \`${table}\``, [], database))[0]?.count || 0,
    })
  } catch (error: any) {
    console.error('Error checking users table:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check users table',
      },
      { status: 500 }
    )
  }
}
