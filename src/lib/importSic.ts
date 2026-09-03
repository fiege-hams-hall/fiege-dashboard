import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { HOUR_SLOTS } from './constants'
import type { HourlyRow } from './types'

// Recognized header names (normalized: lowercased, letters/digits only) mapped to our field.
const HEADER_MAP: Record<string, keyof HourlyRow> = {
  hour: 'hour_slot',
  hourslot: 'hour_slot',
  timeslot: 'hour_slot',
  pickplan: 'pick_plan',
  pickunits: 'pick_units',
  pickhrs: 'pick_hours',
  pickhours: 'pick_hours',
  packplan: 'pack_plan',
  packunits: 'pack_units',
  packhrs: 'pack_hours',
  packhours: 'pack_hours',
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

/** Turns parsed spreadsheet rows (array of objects, or array of arrays) into our 24-row hourly grid. */
export function rowsToHourlyGrid(reportDate: string, rows: Record<string, unknown>[]): HourlyRow[] {
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

  for (const raw of rows) {
    const mapped: Partial<HourlyRow> = {}
    for (const [key, value] of Object.entries(raw)) {
      const field = HEADER_MAP[normalizeHeader(key)]
      if (!field) continue
      if (field === 'hour_slot') {
        mapped.hour_slot = String(value).trim()
      } else {
        ;(mapped as Record<string, number | null>)[field] = toNumber(value)
      }
    }
    if (!mapped.hour_slot) continue
    const idx = HOUR_SLOTS.findIndex(
      (s) => s === mapped.hour_slot || s.startsWith(mapped.hour_slot!.split('-')[0]?.trim() ?? '')
    )
    if (idx === -1) continue
    grid.set(idx, { ...grid.get(idx)!, ...mapped, hour_index: idx, hour_slot: HOUR_SLOTS[idx] })
  }

  return HOUR_SLOTS.map((_, i) => grid.get(i)!)
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
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: null })
}

export async function importSicFile(file: File, reportDate: string): Promise<HourlyRow[]> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')
  const rows = isCsv ? await parseCsvFile(file) : await parseExcelFile(file)
  return rowsToHourlyGrid(reportDate, rows)
}
