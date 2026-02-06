import { NextResponse } from 'next/server'

/**
 * GET /api/ivanti/tickets
 * Fetch Ivanti HEAT tickets (Incident + ServiceReq tasks) via REST API.
 * Mirrors n8n workflow: Tasks → Incident/ServiceReq lookup → company name.
 * Base: https://success.serviceitplus.com/HEAT
 * Auth: Authorization: rest_api_key={IVANTI_API_KEY}
 * @see ivanti.json workflow
 */
const IVANTI_BASE = 'https://success.serviceitplus.com/HEAT'
const TASKS_SELECT = 'Subject,ParentObjectDisplayID,AssignmentID,ParentLink_Category,ActualEffort,Status'
const PAGE_SIZE = 100
const MAX_TASKS = 500

async function ivantiFetch(path: string, apiKey: string) {
  const url = path.startsWith('http') ? path : `${IVANTI_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      Authorization: `rest_api_key=${apiKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ivanti API ${res.status}: ${text}`)
  }
  return res.json()
}

export async function GET() {
  try {
    const apiKey = process.env.IVANTI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'IVANTI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const rawTasks: any[] = []
    let skip = 0
    let hasMore = true

    while (hasMore && rawTasks.length < MAX_TASKS) {
      const path = `/api/odata/businessobject/Tasks?$select=${TASKS_SELECT}&$top=${PAGE_SIZE}&$skip=${skip}`
      const data = await ivantiFetch(path, apiKey)
      const page = data?.value ?? []
      rawTasks.push(...page)
      hasMore = page.length === PAGE_SIZE && rawTasks.length < MAX_TASKS
      skip += PAGE_SIZE
    }

    console.log(`[Ivanti API] Fetched ${rawTasks.length} tasks`)

    const tickets: Array<{
      support_id: string
      task_name: string
      category: string
      actual_effort: number
      ticket_number: string
      company_name: string | null
      status?: string
    }> = []

    let companyLookupSuccess = 0
    let companyLookupFailed = 0
    let companyLookupNull = 0

    for (const t of rawTasks) {
      const category = (t.ParentLink_Category ?? '').trim()
      const ticketNum = String(t.ParentObjectDisplayID ?? '').trim()
      const subject = t.Subject ?? ''
      const assignmentId = t.AssignmentID ?? ''
      const effort = parseFloat(t.ActualEffort) || 0
      const status = t.Status ?? null

      let companyName: string | null = null

      if (category === 'Incident' && ticketNum) {
        try {
          // Match n8n workflow: IncidentNumber eq {ticketNum} (no quotes in n8n)
          // Try without quotes first (numeric ticket numbers)
          let filter = `IncidentNumber eq ${ticketNum}`
          let inc = await ivantiFetch(
            `/api/odata/businessobject/incidents?$filter=${encodeURIComponent(filter)}&$top=1&$select=_CustomerCompanyName`,
            apiKey
          )
          
          // If no results, try with quotes (string ticket numbers)
          if (!inc?.value || inc.value.length === 0) {
            filter = `IncidentNumber eq '${ticketNum.replace(/'/g, "''")}'`
            inc = await ivantiFetch(
              `/api/odata/businessobject/incidents?$filter=${encodeURIComponent(filter)}&$top=1&$select=_CustomerCompanyName`,
              apiKey
            )
          }
          
          const v = inc?.value?.[0]
          if (v && v._CustomerCompanyName != null && v._CustomerCompanyName !== '') {
            companyName = String(v._CustomerCompanyName).trim() || null
            if (companyName) companyLookupSuccess++
            else companyLookupNull++
          } else {
            companyLookupNull++
          }
        } catch (err: any) {
          console.error(`Error fetching Incident ${ticketNum}:`, err.message)
          companyLookupFailed++
          // keep company null
        }
      }

      if (category === 'ServiceReq' && ticketNum) {
        try {
          // Match n8n workflow: ServiceReqNumber eq {ticketNum} (no quotes in n8n, note the space before &)
          // Try without quotes first (numeric ticket numbers)
          let filter = `ServiceReqNumber eq ${ticketNum}`
          let sr = await ivantiFetch(
            `/api/odata/businessobject/ServiceReqs?$filter=${encodeURIComponent(filter)}&$top=1&$select=OrganizationUnitID`,
            apiKey
          )
          
          // If no results, try with quotes (string ticket numbers)
          if (!sr?.value || sr.value.length === 0) {
            filter = `ServiceReqNumber eq '${ticketNum.replace(/'/g, "''")}'`
            sr = await ivantiFetch(
              `/api/odata/businessobject/ServiceReqs?$filter=${encodeURIComponent(filter)}&$top=1&$select=OrganizationUnitID`,
              apiKey
            )
          }
          
          const v = sr?.value?.[0]
          if (v && v.OrganizationUnitID != null && v.OrganizationUnitID !== '') {
            companyName = String(v.OrganizationUnitID).trim() || null
            if (companyName) companyLookupSuccess++
            else companyLookupNull++
          } else {
            companyLookupNull++
          }
        } catch (err: any) {
          console.error(`Error fetching ServiceReq ${ticketNum}:`, err.message)
          companyLookupFailed++
          // keep company null
        }
      }

      tickets.push({
        support_id: assignmentId,
        task_name: subject,
        category,
        actual_effort: effort,
        ticket_number: ticketNum,
        company_name: companyName,
        status,
      })
    }

    // Group by ticket_number AND category (since same ticket number can be in both Incident and ServiceReq)
    // Use composite key: ticket_number + category
    const byTicket = new Map<
      string,
      {
        ticket_number: string
        category: string
        company: string | null
        actual_effort: number
        status: string | null
        task_count: number
        tasks: Array<{ description: string; actual_effort: number }>
      }
    >()

    for (const t of tickets) {
      const k = `${t.ticket_number}::${t.category}` // Composite key
      if (!t.ticket_number) continue
      const existing = byTicket.get(k)
      const task = { description: t.task_name, actual_effort: t.actual_effort }
      if (existing) {
        existing.actual_effort += t.actual_effort
        existing.task_count += 1
        existing.tasks.push(task)
      } else {
        byTicket.set(k, {
          ticket_number: t.ticket_number,
          category: t.category,
          company: t.company_name,
          actual_effort: t.actual_effort,
          status: t.status ?? null,
          task_count: 1,
          tasks: [task],
        })
      }
    }

    const grouped = Array.from(byTicket.values()).sort(
      (a, b) => b.actual_effort - a.actual_effort
    )

    // Debug: Log companies found
    const companiesWithTickets = new Set(grouped.filter(t => t.company).map(t => t.company))
    console.log(`[Ivanti API] Companies found:`, Array.from(companiesWithTickets).slice(0, 10))
    console.log(`[Ivanti API] Company lookups - Success: ${companyLookupSuccess}, Failed: ${companyLookupFailed}, Null/Empty: ${companyLookupNull}`)

    return NextResponse.json({
      success: true,
      tickets: grouped,
      total: grouped.length,
      total_effort: grouped.reduce((s, x) => s + x.actual_effort, 0),
      debug: {
        total_tasks: rawTasks.length,
        tickets_with_company: grouped.filter(t => t.company).length,
        companies: Array.from(companiesWithTickets).slice(0, 20),
      },
    })
  } catch (e: any) {
    console.error('Ivanti tickets API error:', e)
    return NextResponse.json(
      { success: false, error: e?.message ?? 'Failed to fetch Ivanti tickets' },
      { status: 500 }
    )
  }
}
