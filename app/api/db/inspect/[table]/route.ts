import { NextResponse } from 'next/server'
import { getTableStructure, query } from '@/lib/db'

/**
 * GET /api/db/inspect/[table]
 * Inspect table structure and sample data
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ table: string }> | { table: string } }
) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params
    const table = decodeURIComponent(params.table || '')
    const database = 'time_trackingv2'

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table name required' },
        { status: 400 }
      )
    }

    const structure = await getTableStructure(database, table)
    const sampleData = await query<any[]>(
      `SELECT * FROM \`${table}\` LIMIT 3`,
      [],
      database
    )

    return NextResponse.json({
      success: true,
      table,
      columns: structure.map((col: any) => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
      })),
      sampleData,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
