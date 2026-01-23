import { NextResponse } from 'next/server'
import { getTableData, getTableStructure } from '@/lib/db'

/**
 * GET /api/db/tables/[table]?database=time_trackingv2&limit=50&offset=0
 * Get data from a specific table
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ table: string }> | { table: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const database = searchParams.get('database') || 'time_trackingv2'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Handle both sync and async params (Next.js 15+ uses async params)
    const params = context.params instanceof Promise ? await context.params : context.params
    const table = decodeURIComponent(params.table || '')

    if (!table || table === 'undefined' || table === '') {
      return NextResponse.json(
        {
          success: false,
          error: `Table name is required. Received: ${JSON.stringify(params)}`,
        },
        { status: 400 }
      )
    }

    const [tableData, structure] = await Promise.all([
      getTableData(database, table, limit, offset),
      getTableStructure(database, table),
    ])

    return NextResponse.json({
      success: true,
      database,
      table,
      structure: structure.map((col: any) => ({
        name: col.Field,
        type: col.Type,
        null: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
      })),
      data: tableData.data,
      pagination: {
        limit,
        offset,
        total: tableData.total,
        hasMore: offset + limit < tableData.total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching table data:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch table data',
      },
      { status: 500 }
    )
  }
}
