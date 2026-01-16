import { NextResponse } from 'next/server'
import { getDatabases } from '@/lib/db'

/**
 * GET /api/db/databases
 * Get list of all databases
 */
export async function GET() {
  try {
    const databases = await getDatabases()
    
    return NextResponse.json({
      success: true,
      databases,
    })
  } catch (error: any) {
    console.error('Error fetching databases:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch databases',
      },
      { status: 500 }
    )
  }
}
