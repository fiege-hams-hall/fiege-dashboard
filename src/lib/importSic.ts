import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { HOUR_SLOTS } from './constants'
import type { HourlyRow } from './types'

// Recognized header names (normalized: lowercased, letters/digits only) mapped to our field.
// Kept deliberately generous — real-world exports name these columns all sorts of ways.
const HEADER_MAP: Record<string, keyof HourlyRow> = {
  hour: 'hour_slot',
  hourslot: 'hour_slot',
  hourrange: 'hour_slot',
  timeslot: 'hour_slot',
  time: 'hour_slot',
  shift: 'hour_slot',
  interval: 'hour_slot',

  pickplan: 'pick_plan',
  planpick: 'pick_plan',
  pickplanned: 'pick_plan',
  pickplanunits: 'pick_plan',

  pickunits: 'pick_units',
  unitspicked: 'pick_units',
  pickedunits: 'pick_units',
  pickactual: 'pick_units',
  pickqty: 'pick_units',
  pick: 'pick_units',

  pickhrs: 'pick_hours',
  pickhours: 'pick_hours',
  pickmanhours: 'pick_hours',
  pickmh: 'pick_hours',
  pickhr: 'pick_hours',

  packplan: 'pack_plan',
  planpack: 'pack_plan',
  packplanned: 'pack_plan',
  packplanunits: 'pack_plan',

  packunits: 'pack_units',
  unitspacked: 'pack_units',
  packedunits: 'pack_units',
  packactual: 'pack_units',
  packqty: 'pack_units',
  pack: 'pack_units',

  packhrs: 'pack_hours',
  packhours: 'pack_hours',
  packmanhours: 'pack_hours',
  packmh: 'pack_hours',
  packhr: 'pack_hours',
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

/** Excel serial time (a fraction of a day, e.g. 0.25 = 06:00) -> "HH:00". */
function excelSerialToHour(n: number): string | null {
  if (n < 0 || n >= 2) return null // not a plausible time-of-day serial
  const totalMinutes = Math.round((n % 1) * 24 * 60)
  const h = Math.floor(totalMinutes / 60) % 24
  return `${h.toString().padStart(2, '0')}:00`
}

/** Normalizes all sorts of "hour" cell shapes (Date, Excel serial, "6", "06:00", "06:00-07:00", "6 AM") to a starting hour string like "06:00". */
function normalizeHourValue(value: unknown): string | null {
  if (value instanceof Date) {
    return `${value.getHours().toString().padStart(2, '0')}:00`
  }
  if (typeof value === 'number') {
    // Whole numbers 0-23 are treated as an hour-of-day; fractional values as an Excel time serial.
    if (Number.isInteger(value) && value >= 0 && value <= 23) {
      return `${value.toString().padStart(2, '0')}:00`
    }
    return excelSerialToHour(value)
  }
  const str = String(value).trim()
  if (!str) return null
  // "06:00-07:00" / "06:00 - 07:00" -> take the start.
  const rangeStart = str.split('-')[0]?.trim()
  const match = (rangeStart ?? str).match(/(\d{1,2})(?::(\d{2}))?/)
  if (!match) return null
  let h = Number(match[1])
  if (!Number.isFinite(h)) return null
  const isPm = /pm/i.test(str) && h < 12
  if (isPm) h += 12
  if (h === 24) h = 0
  if (h < 0 || h > 23) return null
  return `${h.toString().padStart(2, '0')}:00`
}

export interface SicImportResult {
  rows: HourlyRow[]
  matchedRowCount: number
  detectedHeaders: string[]
  unrecognizedHeaders: string[]
}

/** Turns parsed spreadsheet rows (array of objects) into our 24-row hourly grid. */
export function rowsToHourlyGrid(reportDate: string, rows: Record<string, unknown>[]): SicImportResult {
  const grid = new Map<number, HourlyRow>()
  HOUR_SLOTS.forEach((slot, i) =>
    grid.set(i, {
      report_date: reportDate,
      hour_index: i,
      hour_slot: slot,
      pick_plan: null,
      pick_units: null,
      pick_hours: null,
      pack_plan: null,
      pack_units: null,
      pack_hours: null,
    })
  )

  const detectedHeaders = new Set<string>()
  const unrecognizedHeaders = new Set<string>()
  let matchedRowCount = 0

  for (const raw of rows) {
    const mapped: Partial<HourlyRow> = {}
    let hourRaw: unknown

    for (const [key, value] of Object.entries(raw)) {
      const normalized = normalizeHeader(key)
      const field = HEADER_MAP[normalized]
      if (!field) {
        if (key.trim()) unrecognizedHeaders.add(key.trim())
        continue
      }
      detectedHeaders.add(key.trim())
      if (field === 'hour_slot') {
        hourRaw = value
      } else {
        ;(mapped as Record<string, number | null>)[field] = toNumber(value)
      }
    }

    const hourStart = hourRaw !== undefined ? normalizeHourValue(hourRaw) : null
    if (!hourStart) continue

    const idx = HOUR_SLOTS.findIndex((s) => s.startsWith(hourStart))
    if (idx === -1) continue

    grid.set(idx, { ...grid.get(idx)!, ...mapped, hour_index: idx, hour_slot: HOUR_SLOTS[idx] })
    matchedRowCount += 1
  }

  return {
    rows: HOUR_SLOTS.map((_, i) => grid.get(i)!),
    matchedRowCount,
    detectedHeaders: [...detectedHeaders],
    unrecognizedHeaders: [...unrecognizedHeaders],
  }
}

export function parseCsvFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err: Error) => reject(err),
    })
  })
}

export async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: null })
}

export async function importSicFile(file: File, reportDate: string): Promise<SicImportResult> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')
  const rows = isCsv ? await parseCsvFile(file) : await parseExcelFile(file)
  return rowsToHourlyGrid(reportDate, rows)
}
