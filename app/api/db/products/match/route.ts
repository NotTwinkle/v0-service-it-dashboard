import { NextResponse } from "next/server"
import { getTableStructure, query } from "@/lib/db"

type MatchRow = Record<string, any>

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function pickFirstExisting(structure: any[], candidates: string[]) {
  const fields = new Set(structure.map((c: any) => String(c.Field)))
  return candidates.find((c) => fields.has(c)) || null
}

/**
 * GET /api/db/products/match?name=Trellix%20Email%20Security&database=time_trackingv2
 * Returns the best-matching product id/name from the configured DB.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = (searchParams.get("name") || "").trim()
    const database = (searchParams.get("database") || "time_trackingv2").trim()

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: name" },
        { status: 400 }
      )
    }

    // Detect schema (PHPMaker installs vary: product_id vs id, product_name vs name)
    const structure = await getTableStructure(database, "product")
    const idCol =
      pickFirstExisting(structure, ["product_id", "id"]) || "product_id"
    const nameCol =
      pickFirstExisting(structure, ["product_name", "name"]) || "product_name"

    // Prefer exact (case-insensitive) match
    const exact = await query<MatchRow>(
      `SELECT \`${idCol}\` AS id, \`${nameCol}\` AS name
       FROM \`product\`
       WHERE LOWER(\`${nameCol}\`) = LOWER(?)
       LIMIT 5`,
      [name],
      database
    )
    if (exact.length > 0) {
      return NextResponse.json({ success: true, match: exact[0], strategy: "exact" })
    }

    // Next: LIKE match (case-insensitive)
    const like = await query<MatchRow>(
      `SELECT \`${idCol}\` AS id, \`${nameCol}\` AS name
       FROM \`product\`
       WHERE LOWER(\`${nameCol}\`) LIKE LOWER(?)
       LIMIT 50`,
      [`%${name}%`],
      database
    )
    if (like.length === 1) {
      return NextResponse.json({ success: true, match: like[0], strategy: "like_single" })
    }

    // Fuzzy pick: normalized token overlap
    const target = normalize(name)
    const targetTokens = new Set(target.split(" ").filter(Boolean))

    let best: { row: MatchRow; score: number } | null = null
    for (const row of like) {
      const candidate = normalize(String(row.name || ""))
      if (!candidate) continue
      const candTokens = new Set(candidate.split(" ").filter(Boolean))

      let overlap = 0
      for (const t of targetTokens) if (candTokens.has(t)) overlap++

      const denom = Math.max(1, targetTokens.size)
      const score = overlap / denom
      if (!best || score > best.score) best = { row, score }
    }

    if (best && best.score >= 0.6) {
      return NextResponse.json({
        success: true,
        match: best.row,
        strategy: "fuzzy",
        score: best.score,
      })
    }

    return NextResponse.json({
      success: true,
      match: null,
      strategy: "none",
    })
  } catch (error: any) {
    console.error("Error matching product:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to match product" },
      { status: 500 }
    )
  }
}

