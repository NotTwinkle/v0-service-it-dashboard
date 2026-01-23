import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/webhooks/asana-sync
 * Receives project data from n8n Asana workflow
 * Matches with local projects and stores estimated hours
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      asana_project_gid,
      asana_project_name,
      estimated_hours,
      total_tasks,
      completed_tasks
    } = body

    if (!asana_project_gid || !asana_project_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: asana_project_gid, asana_project_name'
        },
        { status: 400 }
      )
    }

    const database = 'time_trackingv2'

    // Store in a simple cache table or use Redis
    // For now, we'll calculate and return the match
    
    // Get local projects and fuzzy match
    const localProjects = await query<any[]>(
      `SELECT project_id, project_name FROM project WHERE project_name IS NOT NULL`,
      [],
      database
    )

    // Simple fuzzy matching (Levenshtein)
    const asanaNameLower = asana_project_name.toLowerCase().trim()
    let bestMatch: any = null
    let bestScore = 0

    localProjects.forEach((proj: any) => {
      const localNameLower = (proj.project_name || '').toLowerCase().trim()
      const score = similarity(asanaNameLower, localNameLower)
      
      if (score > bestScore && score >= 0.6) {
        bestScore = score
        bestMatch = proj
      }
    })

    // Store in memory cache (or you can use Redis)
    global.asanaProjectCache = global.asanaProjectCache || new Map()
    
    if (bestMatch) {
      global.asanaProjectCache.set(bestMatch.project_id, {
        asana_project_gid,
        asana_project_name,
        estimated_hours: parseFloat(estimated_hours) || 0,
        total_tasks: parseInt(total_tasks) || 0,
        completed_tasks: parseInt(completed_tasks) || 0,
        matched_project_id: bestMatch.project_id,
        matched_project_name: bestMatch.project_name,
        confidence_score: bestScore,
        last_updated: new Date().toISOString()
      })

      console.log(`Matched Asana project "${asana_project_name}" with local project "${bestMatch.project_name}" (${(bestScore * 100).toFixed(1)}% confidence)`)

      return NextResponse.json({
        success: true,
        matched: true,
        local_project: bestMatch,
        confidence: bestScore,
        message: `Matched with ${bestMatch.project_name}`
      })
    } else {
      // Store unmatched for manual review
      global.asanaProjectCache.set(`unmatched_${asana_project_gid}`, {
        asana_project_gid,
        asana_project_name,
        estimated_hours: parseFloat(estimated_hours) || 0,
        total_tasks: parseInt(total_tasks) || 0,
        completed_tasks: parseInt(completed_tasks) || 0,
        matched: false,
        last_updated: new Date().toISOString()
      })

      console.log(`No match found for Asana project "${asana_project_name}"`)

      return NextResponse.json({
        success: true,
        matched: false,
        message: 'No matching local project found'
      })
    }

  } catch (error: any) {
    console.error('Error processing Asana sync:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process Asana sync'
      },
      { status: 500 }
    )
  }
}

// Simple similarity function (Levenshtein-based)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshtein(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshtein(s1: string, s2: string): number {
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

// Type declaration for global cache
declare global {
  var asanaProjectCache: Map<any, any> | undefined
}
