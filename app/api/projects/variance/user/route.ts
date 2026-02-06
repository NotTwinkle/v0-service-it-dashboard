import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { findMatchingCompanies, type Company } from "@/lib/company-matcher"

type TimelogAgg = {
  actual_hours: number
  entry_count: number
}

function toNumber(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * GET /api/projects/variance/user?email=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Mirrors org variance logic, but scoped to ONE user and a date range.
 * Matching rules:
 * - Match by reference_number (Asana project GID)
 * - PLUS match by company_id (timelogs.company_id) where Asana project client matches company table name
 * - Avoid double-counting by subtracting (company_id + reference_number) overlap
 */
export async function GET(request: Request) {
  try {
    const database = "time_trackingv2"
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!email) {
      return NextResponse.json({ success: false, error: "email is required" }, { status: 400 })
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required (YYYY-MM-DD)" },
        { status: 400 }
      )
    }

    const asanaToken = process.env.ASANA_ACCESS_TOKEN
    if (!asanaToken) {
      return NextResponse.json(
        { success: false, error: "ASANA_ACCESS_TOKEN not configured" },
        { status: 500 }
      )
    }

    // --- Step 1: Fetch Asana projects (not archived) ---
    const workspaceId = process.env.ASANA_WORKSPACE_GID
    const optFields = "name,archived"
    let projectsUrl = "https://app.asana.com/api/1.0/projects"
    if (workspaceId) projectsUrl += `?workspace=${workspaceId}`
    projectsUrl += workspaceId ? `&opt_fields=${optFields}` : `?opt_fields=${optFields}`

    const projectsResponse = await fetch(projectsUrl, {
      headers: {
        Authorization: `Bearer ${asanaToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!projectsResponse.ok) {
      const errorText = await projectsResponse.text()
      throw new Error(`Asana API error: ${projectsResponse.status} - ${errorText}`)
    }

    const projectsData = await projectsResponse.json()
    let allProjects = (projectsData.data || []).filter((p: any) => !p.archived)

    // --- Step 2: Calculate estimated hours per Asana project (same logic as org) ---
    const projectsWithEstimates = await Promise.all(
      allProjects.map(async (project: any) => {
        try {
          const tasksUrl = `https://app.asana.com/api/1.0/tasks?project=${project.gid}&opt_fields=name,completed,custom_fields`
          const tasksResponse = await fetch(tasksUrl, {
            headers: {
              Authorization: `Bearer ${asanaToken}`,
              "Content-Type": "application/json",
            },
          })

          if (!tasksResponse.ok) {
            return {
              asana_project_gid: project.gid,
              asana_project_name: project.name,
              estimated_hours: 0,
              total_tasks: 0,
              completed_tasks: 0,
            }
          }

          const tasksData = await tasksResponse.json()
          const tasks = tasksData.data || []
          let totalEstimated = 0
          let completedTasks = 0

          for (const task of tasks) {
            if (task.completed) completedTasks++
            if (task.custom_fields && Array.isArray(task.custom_fields)) {
              const hoursField = task.custom_fields.find(
                (f: any) =>
                  f?.name &&
                  (String(f.name).toLowerCase() === "manhours estimate" ||
                    String(f.name).toLowerCase() === "manhours" ||
                    String(f.name).toLowerCase() === "man-hours" ||
                    String(f.name).toLowerCase().includes("manhour")) &&
                  f.number_value !== null &&
                  f.number_value !== undefined
              )
              if (hoursField?.number_value) {
                totalEstimated += toNumber(hoursField.number_value)
                continue
              }

              const daysField = task.custom_fields.find(
                (f: any) =>
                  f?.name &&
                  (String(f.name).toLowerCase() === "mandays estimate" ||
                    String(f.name).toLowerCase() === "mandays" ||
                    String(f.name).toLowerCase() === "man-days" ||
                    String(f.name).toLowerCase().includes("manday")) &&
                  f.number_value !== null &&
                  f.number_value !== undefined
              )
              if (daysField?.number_value) totalEstimated += toNumber(daysField.number_value) * 8
            }
          }

          return {
            asana_project_gid: project.gid,
            asana_project_name: project.name,
            estimated_hours: Math.round(totalEstimated * 100) / 100,
            total_tasks: tasks.length,
            completed_tasks: completedTasks,
          }
        } catch {
          return {
            asana_project_gid: project.gid,
            asana_project_name: project.name,
            estimated_hours: 0,
            total_tasks: 0,
            completed_tasks: 0,
          }
        }
      })
    )

    // --- Step 3: Load companies table (dynamic column names) ---
    const companyCols = await query<any[]>(
      `SHOW COLUMNS FROM ${database}.company`,
      [],
      database
    )
    const companyFields = companyCols.map((c: any) => String(c.Field))
    const idColumn =
      companyFields.find((c) => c.toLowerCase().includes("id")) ?? companyFields[0]
    const nameColumn =
      companyFields.find((c) => c.toLowerCase().includes("name")) ??
      companyFields.find((c) => c.toLowerCase() !== idColumn.toLowerCase()) ??
      companyFields[0]

    const companiesRaw = await query<any[]>(
      `SELECT ${idColumn} as id, ${nameColumn} as name FROM ${database}.company`,
      [],
      database
    )
    const companies: Company[] = (companiesRaw || [])
      .map((r: any) => ({ id: toNumber(r.id), name: String(r.name ?? "").trim() }))
      .filter((c) => c.id && c.name)

    // --- Step 4: User timelogs aggregates ---
    // Duration is stored in HOURS in your DB. If duration is 0/NULL, compute from start/end.
    const hoursExpr = `
      CASE
        WHEN t.duration IS NULL OR t.duration <= 0 THEN
          TIMESTAMPDIFF(
            MINUTE,
            CONCAT(DATE(t.date), ' ', t.starttime),
            CONCAT(DATE(t.date), ' ', t.endtime)
          ) / 60
        ELSE t.duration
      END
    `

    const byRefRows = await query<any[]>(
      `SELECT
        t.reference_number,
        SUM(${hoursExpr}) as actual_hours,
        COUNT(*) as entry_count
      FROM timelogs t
      INNER JOIN users u ON t.user_id = u.user_id
      WHERE u.email = ?
        AND DATE(t.date) BETWEEN ? AND ?
        AND t.reference_number IS NOT NULL
        AND t.reference_number <> ''
      GROUP BY t.reference_number`,
      [email, startDate, endDate],
      database
    )

    const refMap = new Map<string, TimelogAgg>()
    for (const r of byRefRows || []) {
      const ref = String(r.reference_number ?? "").trim()
      if (!ref) continue
      refMap.set(ref, {
        actual_hours: toNumber(r.actual_hours),
        entry_count: toNumber(r.entry_count),
      })
    }

    const byCompanyRows = await query<any[]>(
      `SELECT
        t.company_id,
        SUM(${hoursExpr}) as actual_hours,
        COUNT(*) as entry_count
      FROM timelogs t
      INNER JOIN users u ON t.user_id = u.user_id
      WHERE u.email = ?
        AND DATE(t.date) BETWEEN ? AND ?
        AND t.company_id IS NOT NULL
      GROUP BY t.company_id`,
      [email, startDate, endDate],
      database
    )

    const companyMap = new Map<number, TimelogAgg>()
    for (const r of byCompanyRows || []) {
      const cid = toNumber(r.company_id)
      if (!cid) continue
      companyMap.set(cid, {
        actual_hours: toNumber(r.actual_hours),
        entry_count: toNumber(r.entry_count),
      })
    }

    // Overlap map: company_id + reference_number (to subtract overlap and avoid double counting)
    const byCompanyRefRows = await query<any[]>(
      `SELECT
        t.company_id,
        t.reference_number,
        SUM(${hoursExpr}) as actual_hours,
        COUNT(*) as entry_count
      FROM timelogs t
      INNER JOIN users u ON t.user_id = u.user_id
      WHERE u.email = ?
        AND DATE(t.date) BETWEEN ? AND ?
        AND t.company_id IS NOT NULL
        AND t.reference_number IS NOT NULL
        AND t.reference_number <> ''
      GROUP BY t.company_id, t.reference_number`,
      [email, startDate, endDate],
      database
    )

    const companyRefMap = new Map<string, TimelogAgg>()
    for (const r of byCompanyRefRows || []) {
      const cid = toNumber(r.company_id)
      const ref = String(r.reference_number ?? "").trim()
      if (!cid || !ref) continue
      companyRefMap.set(`${cid}::${ref}`, {
        actual_hours: toNumber(r.actual_hours),
        entry_count: toNumber(r.entry_count),
      })
    }

    // --- Step 5: Build user variance report ---
    const projects = projectsWithEstimates
      .map((p: any) => {
        const asanaGid = String(p.asana_project_gid)
        const refAgg = refMap.get(asanaGid) ?? { actual_hours: 0, entry_count: 0 }

        const parts = String(p.asana_project_name || "")
          .split("-")
          .map((x: string) => x.trim())
        const clientName = parts.length >= 2 ? parts[1] : ""

        const matchedCompanies = clientName ? findMatchingCompanies(clientName, companies) : []
        const matchedCompanyIds = matchedCompanies.map((c) => c.id).filter(Boolean)

        const companyAgg = matchedCompanyIds.reduce(
          (acc, cid) => {
            const cAgg = companyMap.get(cid)
            if (cAgg) {
              acc.actual_hours += cAgg.actual_hours
              acc.entry_count += cAgg.entry_count
            }
            return acc
          },
          { actual_hours: 0, entry_count: 0 }
        )

        // Subtract overlap where the same timelog is already counted via reference_number
        const overlap = matchedCompanyIds.reduce(
          (acc, cid) => {
            const key = `${cid}::${asanaGid}`
            const o = companyRefMap.get(key)
            if (o) {
              acc.actual_hours += o.actual_hours
              acc.entry_count += o.entry_count
            }
            return acc
          },
          { actual_hours: 0, entry_count: 0 }
        )

        const companyNet = {
          actual_hours: Math.max(0, companyAgg.actual_hours - overlap.actual_hours),
          entry_count: Math.max(0, companyAgg.entry_count - overlap.entry_count),
        }

        const actualHours = refAgg.actual_hours + companyNet.actual_hours
        const entryCount = refAgg.entry_count + companyNet.entry_count
        const estimatedHours = toNumber(p.estimated_hours)
        const variance = estimatedHours - actualHours

        const matchedBy: string[] = []
        if (refAgg.actual_hours > 0) matchedBy.push("reference_number")
        if (companyNet.actual_hours > 0) matchedBy.push("company_id")

        return {
          asana_project_gid: asanaGid,
          asana_project_name: p.asana_project_name,
          estimated_hours: estimatedHours,
          actual_hours: Math.round(actualHours * 100) / 100,
          variance_hours: Math.round(variance * 100) / 100,
          entry_count: entryCount,
          unique_contributors: entryCount > 0 ? 1 : 0,
          matched_by: matchedBy.length ? matchedBy.join("+") : null,
          status: variance > 0 ? "under_budget" : variance < 0 ? "over_budget" : "on_track",
        }
      })
      // Keep the payload focused for the personal dashboard
      .filter((p: any) => p.estimated_hours > 0 || p.actual_hours > 0)
      .sort((a: any, b: any) => Math.abs(b.variance_hours) - Math.abs(a.variance_hours))

    const summary = {
      total_projects: projects.length,
      total_estimated_hours: projects.reduce((s: number, x: any) => s + x.estimated_hours, 0),
      total_actual_hours: projects.reduce((s: number, x: any) => s + x.actual_hours, 0),
      total_variance_hours: projects.reduce((s: number, x: any) => s + x.variance_hours, 0),
      projects_with_actual: projects.filter((p: any) => p.actual_hours > 0).length,
    }

    return NextResponse.json({
      success: true,
      email,
      date_filter: { startDate, endDate },
      projects,
      summary,
    })
  } catch (error: any) {
    console.error("Error calculating user variance:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate user variance" },
      { status: 500 }
    )
  }
}

