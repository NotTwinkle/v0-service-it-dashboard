import mysql from 'mysql2/promise'

/**
 * Database connection configuration
 * In production, use environment variables
 */
const dbConfig = {
  host: process.env.DB_HOST || '192.168.2.18',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'sitadmin1110',
  password: process.env.DB_PASS || '!S3rv1c31T+Op3r@t10n$2025@dm1n!',
  database: process.env.DB_NAME || 'time_trackingv2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool for better performance
let pool: mysql.Pool | null = null

/**
 * Get database connection pool
 * Reuses existing pool or creates a new one
 */
export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      // Remove database from config to connect to server first
      database: undefined,
    })
  }
  return pool
}

/**
 * Get a connection to a specific database
 */
export async function getDbConnection(database?: string): Promise<mysql.PoolConnection> {
  const connectionPool = getDbPool()
  const connection = await connectionPool.getConnection()

  if (database) {
    await connection.changeUser({ database })
  }

  return connection
}

/**
 * Execute a query and return results
 */
export async function query<T = any>(
  sql: string,
  params?: any[],
  database?: string
): Promise<T[]> {
  const connection = await getDbConnection(database)
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(sql, params)
    return rows as T[]
  } finally {
    connection.release()
  }
}

/**
 * Get all databases
 */
export async function getDatabases(): Promise<string[]> {
  const rows = await query<{ Database: string }>('SHOW DATABASES')
  return rows.map(row => row.Database)
}

/**
 * Get all tables in a database
 */
export async function getTables(database: string): Promise<string[]> {
  const connection = await getDbConnection(database)
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SHOW TABLES'
    )
    const tableKey = `Tables_in_${database}`
    return rows.map(row => row[tableKey])
  } finally {
    connection.release()
  }
}

/**
 * Get table structure (columns)
 */
export async function getTableStructure(
  database: string,
  table: string
): Promise<mysql.RowDataPacket[]> {
  const connection = await getDbConnection(database)
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SHOW COLUMNS FROM \`${table}\``
    )
    return rows
  } finally {
    connection.release()
  }
}

/**
 * Get table row count
 */
export async function getTableRowCount(
  database: string,
  table: string
): Promise<number> {
  const connection = await getDbConnection(database)
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM \`${table}\``
    )
    return rows[0]?.count || 0
  } finally {
    connection.release()
  }
}

/**
 * Get table data with pagination
 * Orders by primary key or date column in descending order (latest first)
 */
export async function getTableData(
  database: string,
  table: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: any[]; total: number }> {
  const connection = await getDbConnection(database)
  try {
    // Get total count
    const [countRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM \`${table}\``
    )
    const total = countRows[0]?.count || 0

    // Get table structure to determine ordering column
    const columns = await getTableStructure(database, table)
    
    // Find primary key column
    const primaryKey = columns.find(col => col.Key === 'PRI')
    
    // Find date/timestamp columns (prefer these for ordering)
    const dateColumns = columns.filter(col => {
      const type = col.Type.toLowerCase()
      return type.includes('date') || type.includes('timestamp') || type.includes('datetime')
    })
    
    // Determine order by column: prefer date columns, then primary key
    let orderBy = ''
    if (dateColumns.length > 0) {
      // Use the first date column found (common ones: date, created_at, action_timestamp)
      const preferredDateCol = dateColumns.find(col => 
        col.Field.toLowerCase().includes('date') || 
        col.Field.toLowerCase().includes('timestamp') ||
        col.Field.toLowerCase().includes('created') ||
        col.Field.toLowerCase().includes('updated')
      ) || dateColumns[0]
      orderBy = `ORDER BY \`${preferredDateCol.Field}\` DESC`
    } else if (primaryKey) {
      // Use primary key if no date column found
      orderBy = `ORDER BY \`${primaryKey.Field}\` DESC`
    }
    // If no primary key or date column, no ordering (fallback to default)

    // Get paginated data with ordering
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM \`${table}\` ${orderBy} LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    return {
      data: rows,
      total,
    }
  } finally {
    connection.release()
  }
}

/**
 * Close all connections (useful for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
