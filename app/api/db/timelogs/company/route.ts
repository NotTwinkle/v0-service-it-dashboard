import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/db/timelogs/company?company_id=123&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Fetches timelogs for a specific company. Optional startDate/endDate filter.
 */
export async function GET(request: Request) {
  try {
    const database = 'time_trackingv2'
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id parameter is required' },
        { status: 400 }
      )
    }

    // First, get the table structure to find the correct column names
    const structure = await query(
      `SHOW COLUMNS FROM ${database}.company`,
      [],
      database
    )
    
    // Find the column names
    const columns = structure.map((col: any) => col.Field)
    const idColumn = columns.find((col: string) => col.toLowerCase().includes('id')) || columns[0]
    const nameColumn = columns.find((col: string) => col.toLowerCase().includes('name')) || columns.find((col: string) => col.toLowerCase() !== 'id')
    
    // Get the company name
    const companyResult = await query(
      `SELECT ${nameColumn} FROM ${database}.company WHERE ${idColumn} = ?`,
      [companyId],
      database
    )
    const companyName = companyResult[0]?.[nameColumn] || ''
    
    if (!companyName) {
      return NextResponse.json({
        success: false,
        error: 'Company not found',
      }, { status: 404 })
    }

    // Build query with date filter - make it VERY specific to reduce lag
    // Only match projects where company name appears in the standard format: "Year - Company - Product"
    // Use exact word boundaries to prevent matching partial words
    let dateFilter = ''
    const params: any[] = []
    
    // Very specific pattern matching: "Year - CompanyName - Product" or "Year - CompanyName"
    // Escape special characters in company name for LIKE
    const escapedCompanyName = companyName.replace(/[%_\\]/g, '\\$&')
    const companyNamePattern = `% - ${escapedCompanyName} - %`
    const companyNamePatternAlt = `% - ${escapedCompanyName}`
    
    if (startDate && endDate) {
      dateFilter = ' AND t.date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    // Fetch timelogs by matching company name in project names
    // Use INNER JOIN to only get timelogs with valid project references
    // Match only projects that follow the exact pattern to avoid false matches
    // Limit to 50 most recent entries to reduce lag
    let timelogs: any[] = []
    
    try {
      timelogs = await query(
        `SELECT 
          DATE_FORMAT(t.date, '%Y-%m-%d') as date,
          t.starttime,
          t.endtime,
          t.duration as stored_duration,
          t.category as category_id,
          NULL as category_name,
          t.reference_number,
          p.project_name as project_name,
          COALESCE(t.user_name, u.name) as user_name,
          u.email as user_email,
          (t.duration / 3600.0) as calculated_hours,
          CONCAT(t.date, '-', t.starttime, '-', t.user_id, '-', COALESCE(t.category, 0)) as row_id
        FROM ${database}.timelogs t
        INNER JOIN ${database}.project p ON t.reference_number = p.project_id
        LEFT JOIN ${database}.users u ON t.user_id = u.user_id
        WHERE p.project_name IS NOT NULL 
          AND (p.project_name LIKE ? OR p.project_name LIKE ?)
          ${dateFilter}
        ORDER BY t.date DESC, t.starttime DESC
        LIMIT 50`,
        [companyNamePattern, companyNamePatternAlt, ...(startDate && endDate ? [startDate, endDate] : [])],
        database
      )
    } catch (queryError: any) {
      // If query fails due to table structure, return empty results instead of error
      console.warn('Error querying timelogs by company - table structure may differ:', queryError.message)
      timelogs = []
    }

    // Calculate summary
    const totalHours = timelogs.reduce((sum: number, log: any) => sum + (log.calculated_hours || 0), 0)
    const uniqueUsers = new Set(timelogs.map((log: any) => log.user_email)).size
    const dateRange = timelogs.length > 0 ? {
      earliest: timelogs[timelogs.length - 1]?.date,
      latest: timelogs[0]?.date,
    } : null

    return NextResponse.json({
      success: true,
      timelogs: timelogs || [],
      summary: {
        total_hours: totalHours,
        total_entries: timelogs.length,
        unique_users: uniqueUsers,
        date_range: dateRange,
      },
    })
  } catch (error: any) {
    console.error('Error fetching company timelogs:', error)
    
    // If the query fails (e.g., company_id column doesn't exist in categories), 
    // try an alternative approach: match by company name in project names
    if (error.message?.includes('company_id')) {
      // Fallback: we'll handle this in the frontend by matching company names
      return NextResponse.json({
        success: true,
        timelogs: [],
        summary: {
          total_hours: 0,
          total_entries: 0,
          unique_users: 0,
          date_range: null,
        },
        note: 'Company matching will be done by name in the frontend',
      })
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch company timelogs',
      },
      { status: 500 }
    )
  }
}
