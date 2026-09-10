import * as XLSX from 'xlsx'
import { normalizeHeader, parseCsvFile, toNumber } from './importSic'

export interface SectionRow {
  rank: number
  name: string
  units: number | null
}

export interface SectionImportResult {
  rows: SectionRow[]
  matchedCount: number
  detectedHeaders: string[]
  unrecognizedHeaders: string[]
}

// One section's file only needs to say who and how many — which board/role
// it's for is already known from which "Choose File" button was used.
const HEADER_MAP: Record<string, 'rank' | 'name' | 'units'> = {
  rank: 'rank',
  position: 'rank',
  pos: 'rank',
  place: 'rank',
  no: 'rank',
  number: 'rank',
  num: 'rank',

  name: 'name',
  employee: 'name',
  employeename: 'name',
  opid: 'name',
  fopid: 'name',
  opfopid: 'name',
  operatorid: 'name',
  operator: 'name',
  associate: 'name',
  id: 'name',
  worker: 'name',
  picker: 'name',
  packer: 'name',

  units: 'units',
  unit: 'units',
  qty: 'units',
  quantity: 'units',
  count: 'units',
  total: 'units',
  totalunits: 'units',
}

function rowsToSection(rows: Record<string, unknown>[]): SectionImportResult {
  const detectedHeaders = new Set<string>()
  const unrecognizedHeaders = new Set<string>()
  const parsed: { rank: number | null; name: string; units: number | null }[] = []

  for (const raw of rows) {
    const mapped: Partial<Record<'rank' | 'name' | 'units', unknown>> = {}
    for (const [key, value] of Object.entries(raw)) {
      const field = HEADER_MAP[normalizeHeader(key)]
      if (!field) {
        if (key.trim()) unrecognizedHeaders.add(key.trim())
        continue
      }
      detectedHeaders.add(key.trim())
      mapped[field] = value
    }

    const name = mapped.name != null ? String(mapped.name).trim() : ''
    if (!name) continue

    parsed.push({
      rank: mapped.rank != null ? toNumber(mapped.rank) : null,
      name,
      units: toNumber(mapped.units),
    })
  }

  // Rows with a valid, still-free rank (1-5) keep it; everything else fills
  // whatever ranks are left, in the order the rows appeared.
  const used = new Set<number>()
  const ranked: SectionRow[] = []
  const unranked: { name: string; units: number | null }[] = []
  parsed.forEach((row) => {
    if (row.rank && row.rank >= 1 && row.rank <= 5 && !used.has(row.rank)) {
      used.add(row.rank)
      ranked.push({ rank: row.rank, name: row.name, units: row.units })
    } else {
      unranked.push(row)
    }
  })
  let next = 1
  unranked.forEach((row) => {
    while (used.has(next) && next <= 5) next++
    if (next > 5) return // only 5 slots fit on the board
    used.add(next)
    ranked.push({ rank: next, name: row.name, units: row.units })
  })

  return {
    rows: ranked,
    matchedCount: ranked.length,
    detectedHeaders: [...detectedHeaders],
    unrecognizedHeaders: [...unrecognizedHeaders],
  }
}

/**
 * Imports one leaderboard section (e.g. just "Top 5 Pickers") from a CSV/XLSX
 * with Name and Units columns (Rank is optional — rows without one fill
 * whatever ranks 1-5 are still free, in file order).
 */
export async function importSectionFile(file: File): Promise<SectionImportResult> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')
  if (isCsv) {
    const rows = await parseCsvFile(file)
    return rowsToSection(rows)
  }
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: null })
  return rowsToSection(rows)
}
