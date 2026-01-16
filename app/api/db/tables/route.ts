import { NextResponse } from 'next/server'
import { getTables, getTableStructure, getTableRowCount } from '@/lib/db'

/**
 * GET /api/db/tables?database=time_trackingv2
 * Get list of all tables in a database with their structure
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const database = searchParams.get('database') || 'time_trackingv2'

    const tables = await getTables(database)

    // Get structure and row count for each table
    const tablesWithInfo = await Promise.all(
      tables.map(async (table) => {
        try {
          const [structure, rowCount] = await Promise.all([
            getTableStructure(database, table),
            getTableRowCount(database, table),
          ])

          return {
            name: table,
            rowCount,
            columns: structure.map((col: any) => ({
              name: col.Field,
              type: col.Type,
              null: col.Null === 'YES',
              key: col.Key,
              default: col.Default,
            })),
          }
        } catch (error: any) {
          return {
            name: table,
            rowCount: 0,
            columns: [],
            error: error.message,
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      database,
      tables: tablesWithInfo,
      count: tablesWithInfo.length,
    })
  } catch (error: any) {
    console.error('Error fetching tables:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch tables',
      },
      { status: 500 }
    )
  }
}
