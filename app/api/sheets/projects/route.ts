import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/sheets/projects
 * Reads project data from Google Sheets including estimated hours from Asana
 * Then matches with actual hours from time tracker database
 */
export async function GET() {
  try {
    const database = 'time_trackingv2'
    
    // Fetch data from Google Sheets
    const sheetId = '1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4'
    const sheetName = 'Project'
    const range = 'A2:E200' // Project ID, Name, Company, Status, Estimated Hours
    
    const sheetsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}&range=${range}`
    
    const response = await fetch(sheetsUrl)
    const text = await response.text()
    
    // Parse Google Sheets JSON response (it's wrapped in a function call)
    const jsonString = text.substring(47, text.length - 2)
    const data = JSON.parse(jsonString)
    
    const projects: any[] = []
    
    // Parse rows from Google Sheets
    data.table.rows.forEach((row: any) => {
      const cells = row.c
      if (!cells || !cells[0] || !cells[0].v) return // Skip empty rows
      
      const projectId = cells[0]?.v || ''
      const projectName = cells[1]?.v || ''
      const companyName = cells[2]?.v || ''
      const status = cells[3]?.v || 'Active'
      const estimatedHours = parseFloat(cells[4]?.v || '0')
      
      // Only include Active projects
      if (status !== 'Active') return
      
      projects.push({
        asana_project_gid: projectId,
        asana_project_name: projectName,
        company_name: companyName,
        estimated_hours: estimatedHours,
        has_asana_data: estimatedHours > 0
      })
    })
    
    // Get actual hours from timelogs for all projects
    const timelogData = await query<any[]>(
      `SELECT 
        project_id,
        project_name,
        SUM(duration) as actual_hours,
        COUNT(*) as entry_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM timelogs
      WHERE project_id IS NOT NULL
      GROUP BY project_id, project_name`,
      [],
      database
    )
    
    // Create lookup map
    const timelogMap = new Map()
    timelogData.forEach((row: any) => {
      timelogMap.set(row.project_name?.toLowerCase().trim(), {
        project_id: row.project_id,
        actual_hours: parseFloat(row.actual_hours) || 0,
        entry_count: row.entry_count || 0,
        unique_users: row.unique_users || 0
      })
    })
    
    // Match and calculate variance
    const varianceReport = projects.map(project => {
      const projectNameLower = project.asana_project_name?.toLowerCase().trim()
      const timelogInfo = timelogMap.get(projectNameLower) || {
        project_id: null,
        actual_hours: 0,
        entry_count: 0,
        unique_users: 0
      }
      
      const estimatedHours = project.estimated_hours
      const actualHours = timelogInfo.actual_hours
      const variance = estimatedHours - actualHours
      const completionPercentage = estimatedHours > 0 
        ? Math.min(100, Math.round((actualHours / estimatedHours) * 100))
        : 0
      
      return {
        asana_project_gid: project.asana_project_gid,
        asana_project_name: project.asana_project_name,
        company_name: project.company_name,
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        variance_hours: variance,
        completion_percentage: completionPercentage,
        entry_count: timelogInfo.entry_count,
        unique_contributors: timelogInfo.unique_users,
        has_asana_data: project.has_asana_data,
        status: variance > 0 ? 'under_budget' : variance < 0 ? 'over_budget' : 'on_track',
        matched_with_timetracker: timelogInfo.actual_hours > 0
      }
    })
    
    // Sort by absolute variance
    varianceReport.sort((a, b) => Math.abs(b.variance_hours) - Math.abs(a.variance_hours))
    
    return NextResponse.json({
      success: true,
      projects: varianceReport,
      summary: {
        total_projects: varianceReport.length,
        projects_with_asana_data: varianceReport.filter(p => p.has_asana_data).length,
        projects_matched_timetracker: varianceReport.filter(p => p.matched_with_timetracker).length,
        total_estimated_hours: varianceReport.reduce((sum, p) => sum + p.estimated_hours, 0),
        total_actual_hours: varianceReport.reduce((sum, p) => sum + p.actual_hours, 0),
        total_variance_hours: varianceReport.reduce((sum, p) => sum + p.variance_hours, 0)
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching from Google Sheets:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project data'
      },
      { status: 500 }
    )
  }
}
