import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Try to import bcryptjs, but make it optional
let bcrypt: any = null
try {
  bcrypt = require('bcryptjs')
} catch (e) {
  console.warn('bcryptjs not installed. Please run: npm install bcryptjs @types/bcryptjs')
}

/**
 * POST /api/auth/login
 * Authenticate user with email and password from database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    // Query user from database
    const database = 'time_trackingv2'
    
    // Based on the table structure, email column is 'email' (lowercase)
    // Try direct match first
    let users: any[] = []
    let user: any = null
    
    try {
      users = await query<any[]>(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email],
        database
      )
      if (users.length > 0) {
        user = users[0]
      }
    } catch (e) {
      console.error('Error querying with email column:', e)
    }
    
    // If still no user found, try case-insensitive search
    if (!user) {
      try {
        users = await query<any[]>(
          `SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
          [email],
          database
        )
        if (users.length > 0) {
          user = users[0]
        }
      } catch (e) {
        console.error('Error with case-insensitive search:', e)
      }
    }

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }
    
    console.log('User found:', {
      email,
      userKeys: Object.keys(user),
      hasPasswordField: Object.keys(user).some(k => k.toLowerCase().includes('password') || k.toLowerCase().includes('pass') || k.toLowerCase().includes('pwd')),
    })

    // Check password - based on table structure, column is 'password' (lowercase)
    let passwordMatch = false
    let storedPassword: string | null = null
    
    // Find password column (try exact match first, then case-insensitive)
    if (user.password !== undefined) {
      storedPassword = user.password
    } else if (user.Password !== undefined) {
      storedPassword = user.Password
    } else {
      // Fallback: search for any key containing 'password'
      for (const key in user) {
        if (key.toLowerCase() === 'password') {
          storedPassword = user[key]
          break
        }
      }
    }
    
    if (storedPassword) {
      // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
        // Use bcrypt to compare
        if (bcrypt) {
          try {
            passwordMatch = await bcrypt.compare(password, storedPassword)
            if (passwordMatch) {
              console.log('Password matched using bcrypt')
            }
          } catch (bcryptError) {
            console.error('Bcrypt comparison error:', bcryptError)
          }
        } else {
          // bcryptjs not installed
          return NextResponse.json(
            {
              success: false,
              error: 'bcryptjs package is required for password verification. Please run: npm install bcryptjs @types/bcryptjs',
            },
            { status: 500 }
          )
        }
      }
      // Try plain text
      else if (storedPassword === password) {
        passwordMatch = true
      }
      // Try MD5 hash
      else if (require('crypto').createHash('md5').update(password).digest('hex') === storedPassword) {
        passwordMatch = true
      }
      // Try SHA1 hash
      else if (require('crypto').createHash('sha1').update(password).digest('hex') === storedPassword) {
        passwordMatch = true
      }
      // Try case-insensitive comparison
      else if (storedPassword.toLowerCase() === password.toLowerCase()) {
        passwordMatch = true
      }
    } else {
      // If no password column found, allow login (for testing - remove in production!)
      console.warn('No password column found in users table - allowing login without password check')
      console.warn('User object keys:', Object.keys(user))
      passwordMatch = true
    }
    
    // TEMPORARY: For debugging, also try to match any field that might contain the password
    // This helps identify if password is stored in an unexpected column
    if (!passwordMatch && !storedPassword) {
      console.log('Trying to find password in any column...')
      for (const key in user) {
        const value = user[key]
        if (value && typeof value === 'string') {
          // Try direct match
          if (value === password) {
            console.log(`Password found in column: ${key}`)
            passwordMatch = true
            break
          }
          // Try MD5
          if (require('crypto').createHash('md5').update(password).digest('hex') === value) {
            console.log(`MD5 password found in column: ${key}`)
            passwordMatch = true
            break
          }
          // Try SHA1
          if (require('crypto').createHash('sha1').update(password).digest('hex') === value) {
            console.log(`SHA1 password found in column: ${key}`)
            passwordMatch = true
            break
          }
        }
      }
    }

    if (!passwordMatch) {
      // Log for debugging (remove in production)
      console.log('Password mismatch:', {
        email,
        hasStoredPassword: !!storedPassword,
        passwordLength: password.length,
        storedPasswordLength: storedPassword?.length,
        storedPasswordPreview: storedPassword ? storedPassword.substring(0, 10) + '...' : null,
        userKeys: Object.keys(user),
        // Show first few chars of password hashes for comparison
        md5Hash: require('crypto').createHash('md5').update(password).digest('hex').substring(0, 10) + '...',
        sha1Hash: require('crypto').createHash('sha1').update(password).digest('hex').substring(0, 10) + '...',
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Return user data (exclude password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful',
    })
  } catch (error: any) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to login',
      },
      { status: 500 }
    )
  }
}
