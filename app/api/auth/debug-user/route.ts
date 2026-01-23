import { NextResponse } from 'next/server'
import { query, getTableStructure } from '@/lib/db'

/**
 * GET /api/auth/debug-user?email=lance.nunez@serviceitplus.com
 * Debug endpoint to see user data structure
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'lance.nunez@serviceitplus.com'
    const database = 'time_trackingv2'
    
    // Get table structure
    const structure = await getTableStructure(database, 'users')
    
    // Try to find user with different email column names
    let user: any = null
    const emailColumns = ['email', 'Email', 'user_email', 'email_address', 'EmailAddress']
    
    for (const emailCol of emailColumns) {
      try {
        const users = await query<any[]>(
          `SELECT * FROM users WHERE ${emailCol} = ? LIMIT 1`,
          [email],
          database
        )
        if (users.length > 0) {
          user = users[0]
          break
        }
      } catch (e) {
        continue
      }
    }
    
    // Try case-insensitive
    if (!user) {
      try {
        const users = await query<any[]>(
          `SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
          [email],
          database
        )
        if (users.length > 0) {
          user = users[0]
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Get all users (first 5) to see structure
    const allUsers = await query<any[]>(
      `SELECT * FROM users LIMIT 5`,
      [],
      database
    )
    
    return NextResponse.json({
      success: true,
      emailSearched: email,
      tableStructure: structure.map((col: any) => ({
        name: col.Field,
        type: col.Type,
        null: col.Null === 'YES',
        key: col.Key,
      })),
      userFound: !!user,
      userData: user ? {
        // Show all fields but mask password
        ...Object.keys(user).reduce((acc: any, key) => {
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass') || key.toLowerCase().includes('pwd')) {
            acc[key] = user[key] ? `[HIDDEN - Length: ${user[key].length}]` : null
          } else {
            acc[key] = user[key]
          }
          return acc
        }, {}),
      } : null,
      sampleUsers: allUsers.map(u => {
        const masked: any = {}
        Object.keys(u).forEach(key => {
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass') || key.toLowerCase().includes('pwd')) {
            masked[key] = u[key] ? `[HIDDEN - Length: ${u[key].length}]` : null
          } else {
            masked[key] = u[key]
          }
        })
        return masked
      }),
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to debug user',
      },
      { status: 500 }
    )
  }
}
