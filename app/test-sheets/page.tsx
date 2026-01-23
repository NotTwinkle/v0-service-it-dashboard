"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSheetsTasks, useSheetsAllTabs } from "@/lib/use-sheets-data"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

/**
 * Test page to verify Google Sheets integration
 * Visit: /test-sheets
 */
export default function TestSheetsPage() {
  const [selectedTab, setSelectedTab] = useState("Support")
  const [viewMode, setViewMode] = useState<"single" | "all">("single")
  
  const { data: tasks, loading, error } = useSheetsTasks({ 
    tab: selectedTab,
    enabled: viewMode === "single"
  })

  const { data: allTabsData, loading: allTabsLoading, error: allTabsError } = useSheetsAllTabs({
    enabled: viewMode === "all"
  })

  const tabs = ["Support", "Project", "Initiative", "Enablement", "Presales", "Internal Events"]
  
  const isLoading = viewMode === "single" ? loading : allTabsLoading
  const hasError = viewMode === "single" ? error : allTabsError

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Google Sheets Integration Test</CardTitle>
            <CardDescription>
              Testing connection to: OPS Central Task Registry
              <br />
              Sheet ID: 1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* View Mode Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">View Mode:</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "single" ? "default" : "outline"}
                    onClick={() => setViewMode("single")}
                    className="rounded-lg"
                  >
                    Single Tab
                  </Button>
                  <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    onClick={() => setViewMode("all")}
                    className="rounded-lg"
                  >
                    All Tabs Overview
                  </Button>
                </div>
              </div>

              {/* Tab Selector (only for single mode) */}
              {viewMode === "single" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Tab:</label>
                  <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                      <Button
                        key={tab}
                        variant={selectedTab === tab ? "default" : "outline"}
                        onClick={() => setSelectedTab(tab)}
                        className="rounded-lg"
                      >
                        {tab}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh
                </Button>
                {isLoading && (
                  <span className="text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                )}
                {hasError && <span className="text-red-600">❌ Error: {hasError}</span>}
                {!isLoading && !hasError && viewMode === "single" && tasks && (
                  <span className="text-green-600">✅ Loaded {tasks.length} tasks</span>
                )}
                {!isLoading && !hasError && viewMode === "all" && allTabsData && (
                  <span className="text-green-600">
                    ✅ Loaded {allTabsData.summary?.totalTasks || 0} tasks from {allTabsData.summary?.successfulTabs || 0} tabs
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Tabs Overview */}
        {viewMode === "all" && (
          <>
            {allTabsLoading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600">Loading data from all tabs...</p>
                </CardContent>
              </Card>
            )}

            {allTabsError && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Connection Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{allTabsError}</p>
                </CardContent>
              </Card>
            )}

            {!allTabsLoading && !allTabsError && allTabsData && (
              <>
                {/* Summary */}
                <Card className="mb-6 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle>All Tabs Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Tabs</p>
                        <p className="text-2xl font-bold text-[#404040]">{allTabsData.summary?.totalTabs || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Successfully Loaded</p>
                        <p className="text-2xl font-bold text-green-600">{allTabsData.summary?.successfulTabs || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-blue-600">{allTabsData.summary?.totalTasks || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs List */}
                <div className="space-y-4">
                  {tabs.map(tab => {
                    const tabData = allTabsData.tabs?.[tab]
                    if (!tabData) return null

                    return (
                      <Card key={tab} className={`${tabData.success ? 'border-green-200' : 'border-red-200'}`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {tabData.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <CardTitle>{tab}</CardTitle>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              tabData.success 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {tabData.count || 0} tasks
                            </span>
                          </div>
                        </CardHeader>
                        {tabData.error && (
                          <CardContent>
                            <p className="text-sm text-red-600">Error: {tabData.error}</p>
                          </CardContent>
                        )}
                        {tabData.success && tabData.data && tabData.data.length > 0 && (
                          <CardContent>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {tabData.data.slice(0, 5).map((task: any, idx: number) => (
                                <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                                  <strong>{task.taskName || task.id}</strong>
                                  {task.project && <span className="text-gray-600"> - {task.project}</span>}
                                </div>
                              ))}
                              {tabData.data.length > 5 && (
                                <p className="text-xs text-gray-500 text-center pt-2">
                                  ... and {tabData.data.length - 5} more tasks
                                </p>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Single Tab Data Display */}
        {viewMode === "single" && loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Loading data from Google Sheets...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <p className="text-sm font-semibold mb-2">Common solutions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Make sure the sheet is publicly viewable (Share → Anyone with the link → Viewer)</li>
                  <li>Check that the tab name "{selectedTab}" exists in your sheet</li>
                  <li>Verify GOOGLE_SHEET_ID in your .env.local file</li>
                  <li>Check browser console for detailed error messages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "single" && !loading && !error && tasks && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Tasks from "{selectedTab}" Tab ({tasks.length} total)</CardTitle>
              </CardHeader>
            </Card>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-600">No tasks found in this tab.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Make sure the tab "{selectedTab}" has data in your Google Sheet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tasks.slice(0, 20).map((task: any, index: number) => (
                  <Card key={task.id || index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              ID: {task.id}
                            </span>
                            {task.source && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {task.source}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{task.taskName}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {task.project && <span>📁 {task.project}</span>}
                            {task.client && <span>🏢 {task.client}</span>}
                            {task.initiative && <span>🎯 {task.initiative}</span>}
                            {task.estimated !== undefined && (
                              <span>⏱️ Est: {task.estimated}h</span>
                            )}
                            {task.logged !== undefined && (
                              <span>📊 Logged: {task.logged}h</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {tasks.length > 20 && (
                <Card>
                  <CardContent className="py-4 text-center text-sm text-gray-600">
                    Showing first 20 of {tasks.length} tasks
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Raw Data Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Raw Data Preview (First Task)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(tasks[0] || {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
