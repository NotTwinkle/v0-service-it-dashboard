/**
 * Smart company name matching utility
 * Handles variations like:
 * - "JKS Technology" = "JKS"
 * - "Makati Medical Center (MMC)" = "Makati Medical Center"
 * - "CyberBattalion" = "Cyber Battalion"
 * - Case variations, spacing, abbreviations, etc.
 */

export interface Company {
  id: number
  name: string
  email?: string | null
}

/**
 * Normalize a company name for comparison
 */
function normalizeCompanyName(name: string): string {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .trim()
    // Remove parentheses and their contents (e.g., "Makati Medical Center (MMC)" -> "Makati Medical Center")
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Normalize spacing
    .replace(/\s+/g, ' ')
    // Remove common punctuation
    .replace(/[.,\-_]/g, ' ')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract abbreviation from company name
 * e.g., "JKS Technology" -> "jks", "Makati Medical Center" -> "makati med"
 */
function getAbbreviation(name: string): string {
  const normalized = normalizeCompanyName(name)
  const words = normalized.split(/\s+/)
  
  if (words.length === 0) return normalized
  
  // If single word, return as is
  if (words.length === 1) return words[0]
  
  // If multiple words, return first word + first 3 chars of second word
  return words[0] + ' ' + words[1].substring(0, Math.min(3, words[1].length))
}

/**
 * Extract first word(s) from company name
 * e.g., "JKS Technology" -> "jks", "Makati Medical Center" -> "makati medical"
 */
function getFirstWords(name: string, count: number = 2): string {
  const normalized = normalizeCompanyName(name)
  const words = normalized.split(/\s+/)
  return words.slice(0, count).join(' ')
}

/**
 * Check if two company names match using various strategies
 */
export function matchCompanyNames(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false
  
  const norm1 = normalizeCompanyName(name1)
  const norm2 = normalizeCompanyName(name2)
  
  // 1. Exact match after normalization
  if (norm1 === norm2) return true
  
  // 2. One contains the other (bidirectional)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true
  
  // 3. Abbreviation match
  const abbr1 = getAbbreviation(name1)
  const abbr2 = getAbbreviation(name2)
  if (abbr1 === abbr2) return true
  if (norm1.includes(abbr2) || norm2.includes(abbr1)) return true
  
  // 4. First word(s) match (for cases like "JKS Technology" = "JKS")
  const firstWords1 = getFirstWords(name1, 1)
  const firstWords2 = getFirstWords(name2, 1)
  if (firstWords1 === firstWords2) return true
  
  // 5. First two words match
  const firstTwo1 = getFirstWords(name1, 2)
  const firstTwo2 = getFirstWords(name2, 2)
  if (firstTwo1 === firstTwo2) return true
  
  // 6. Special cases
  // "Makati Medical Center" variations
  if ((norm1.includes('makati') && norm2.includes('makati')) &&
      (norm1.includes('medical') || norm1.includes('med')) &&
      (norm2.includes('medical') || norm2.includes('med'))) {
    return true
  }
  
  // "Cyber Battalion" variations
  if ((norm1.includes('cyber') && norm2.includes('cyber')) &&
      (norm1.includes('battalion') || norm1.includes('batt') || norm1.includes('battalion')) &&
      (norm2.includes('battalion') || norm2.includes('batt') || norm2.includes('battalion'))) {
    return true
  }
  
  return false
}

/**
 * Find matching company from a list of companies
 */
export function findMatchingCompany(
  searchName: string,
  companies: Company[]
): Company | null {
  if (!searchName || !companies || companies.length === 0) return null
  
  // Try exact match first (case-insensitive)
  const exactMatch = companies.find(c => 
    normalizeCompanyName(c.name) === normalizeCompanyName(searchName)
  )
  if (exactMatch) return exactMatch
  
  // Try smart matching
  for (const company of companies) {
    if (matchCompanyNames(searchName, company.name)) {
      return company
    }
  }
  
  return null
}

/**
 * Find all matching companies (in case multiple companies match)
 */
export function findMatchingCompanies(
  searchName: string,
  companies: Company[]
): Company[] {
  if (!searchName || !companies || companies.length === 0) return []
  
  return companies.filter(company => 
    matchCompanyNames(searchName, company.name)
  )
}
