"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Database, 
  Table, 
  ChevronRight, 
  RefreshCw, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react"

interface TableInfo {
  name: string
  rowCount: number
  columns: Array<{
    name: string
    type: string
    null: boolean
    key: string
  }>
  error?: string
}

interface TableData {
  success: boolean
  database: string
  table: string
  structure: Array<{
    name: string
    type: string
    null: boolean
    key: string
  }>
  data: any[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
  }
}

export default function DatabaseExplorerPage() {
  const [databases, setDatabases] = useState<string[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>("time_trackingv2")
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingTables, setLoadingTables] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch databases on mount
  useEffect(() => {
    fetchDatabases()
  }, [])

  // Fetch tables when database changes
  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase)
    }
  }, [selectedDatabase])

  // Fetch table data when table is selected
  useEffect(() => {
    if (selectedTable && selectedDatabase) {
      fetchTableData(selectedDatabase, selectedTable)
    }
  }, [selectedTable, selectedDatabase])

  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/db/databases")
      const result = await response.json()
      if (result.success) {
        setDatabases(result.databases)
      }
    } catch (error) {
      console.error("Error fetching databases:", error)
    }
  }

  const fetchTables = async (database: string) => {
    setLoadingTables(true)
    try {
      const response = await fetch(`/api/db/tables?database=${database}`)
      const result = await response.json()
      if (result.success) {
        setTables(result.tables)
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setLoadingTables(false)
    }
  }

  const fetchTableData = async (database: string, table: string, offset: number = 0) => {
    if (!table || table === 'undefined') {
      console.error("Invalid table name:", table)
      alert("Error: Invalid table name")
      return
    }
    
    setLoadingData(true)
    setTableData(null) // Clear previous data while loading
    try {
      // Encode the table name to handle special characters
      const encodedTable = encodeURIComponent(table)
      const response = await fetch(
        `/api/db/tables/${encodedTable}?database=${encodeURIComponent(database)}&limit=50&offset=${offset}`
      )
      const result = await response.json()
      if (result.success) {
        setTableData(result)
      } else {
        console.error("Failed to fetch table data:", result.error)
        alert(`Error: ${result.error || 'Failed to fetch table data'}`)
      }
    } catch (error: any) {
      console.error("Error fetching table data:", error)
      alert(`Error: ${error.message || 'Failed to fetch table data'}`)
    } finally {
      setLoadingData(false)
    }
  }

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  const loadMoreData = () => {
    if (tableData && selectedTable && selectedDatabase) {
      const newOffset = tableData.pagination.offset + tableData.pagination.limit
      fetchTableData(selectedDatabase, selectedTable, newOffset)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f16a21] via-[#f16a21] to-[#f79021] border-b border-orange-500/50 shadow-lg shadow-orange-900/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-white hover:bg-white/10 border-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div>
                  <h1 className="text-lg font-bold tracking-tight">Database Explorer</h1>
                  <p className="text-[10px] text-orange-100 font-medium">Explore your database structure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Databases & Tables */}
          <div className="lg:col-span-1 space-y-4">
            {/* Database Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Databases
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchDatabases}
                    className="h-7 w-7 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedDatabase}
                  onChange={(e) => setSelectedDatabase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {databases.map((db) => (
                    <option key={db} value={db}>
                      {db}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tables List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Tables ({tables.length})
                  </span>
                  {loadingTables && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tables.map((table) => (
                    <div key={table.name} className="border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            setSelectedTable(table.name)
                          }}
                          className={`flex-1 px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                            selectedTable === table.name ? "bg-orange-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Table className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{table.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {table.rowCount.toLocaleString()}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTableExpansion(table.name)
                          }}
                          className="px-2 py-2 hover:bg-gray-50 transition-colors"
                        >
                          {expandedTables.has(table.name) ? (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                      
                      {expandedTables.has(table.name) && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                          <div className="space-y-1">
                            {table.columns.map((col) => (
                              <div
                                key={col.name}
                                className="text-xs flex items-center gap-2 text-gray-600"
                              >
                                <span className="font-medium">{col.name}</span>
                                <span className="text-gray-400">({col.type})</span>
                                {col.key === "PRI" && (
                                  <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                    PK
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Table Data */}
          <div className="lg:col-span-2">
            {selectedTable && loadingData && !tableData ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading table data...</p>
                </CardContent>
              </Card>
            ) : selectedTable && tableData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      {selectedTable}
                      <span className="text-sm font-normal text-gray-500">
                        ({tableData.pagination.total.toLocaleString()} rows)
                      </span>
                    </span>
                    {loadingData && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    Showing {tableData.pagination.offset + 1} -{" "}
                    {Math.min(
                      tableData.pagination.offset + tableData.pagination.limit,
                      tableData.pagination.total
                    )}{" "}
                    of {tableData.pagination.total} rows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-50">
                          {tableData.structure.map((col) => (
                            <th
                              key={col.name}
                              className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                            >
                              {col.name}
                              {col.key === "PRI" && (
                                <span className="ml-1 text-blue-600">*</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.data.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            {tableData.structure.map((col) => (
                              <td
                                key={col.name}
                                className="px-3 py-2 text-gray-600 max-w-[200px] truncate"
                                title={row[col.name]?.toString()}
                              >
                                {row[col.name] === null ? (
                                  <span className="text-gray-400 italic">NULL</span>
                                ) : typeof row[col.name] === "object" ? (
                                  JSON.stringify(row[col.name])
                                ) : (
                                  row[col.name]?.toString() || ""
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {tableData.pagination.hasMore && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={loadMoreData}
                        disabled={loadingData}
                        variant="outline"
                        size="sm"
                      >
                        {loadingData ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Select a table from the left to view its data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
