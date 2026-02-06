import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/db/companies
 * Fetch all companies from the companies table
 */
export async function GET() {
  try {
    const database = 'time_trackingv2'
    
    // First, get the table structure to find the correct column names
    const structure = await query(
      `SHOW COLUMNS FROM ${database}.company`
    )
    
    // Find the column names
    const columns = structure.map((col: any) => col.Field)
    const idColumn = columns.find((col: string) => col.toLowerCase().includes('id')) || columns[0]
    const nameColumn = columns.find((col: string) => col.toLowerCase().includes('name')) || columns.find((col: string) => col.toLowerCase() !== 'id')
    const emailColumn = columns.find((col: string) => col.toLowerCase().includes('email'))
    
    // Build SELECT query with actual column names
    const selectColumns = [idColumn, nameColumn]
    if (emailColumn) selectColumns.push(emailColumn)
    
    const companies = await query(
      `SELECT ${selectColumns.join(', ')} FROM ${database}.company ORDER BY ${nameColumn} ASC`
    )

    // Map to expected format
    const formattedCompanies = companies.map((row: any) => ({
      id: row[idColumn] || row[columns[0]],
      name: row[nameColumn] || '',
      email: emailColumn ? (row[emailColumn] || null) : null,
    }))

    return NextResponse.json({
      success: true,
      companies: formattedCompanies || [],
    })
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch companies',
      },
      { status: 500 }
    )
  }
}
