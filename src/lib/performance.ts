import type { HourlyRow } from './types'
import { computeRate, sum } from './upmh'

export interface HourStats {
  slot: string | null
  pickUpmh: number | null
  packUpmh: number | null
  packUnits: number | null
}

export interface CumulativeStats {
  pickUpmh: number | null
  packUpmh: number | null
  packUnitsTotal: number
}

/** The most recent hour that has any pick or pack units logged. */
export function lastActiveHour(hourly: HourlyRow[]): HourStats {
  const active = [...hourly].reverse().find((r) => r.pick_units != null || r.pack_units != null)
  if (!active) return { slot: null, pickUpmh: null, packUpmh: null, packUnits: null }
  return {
    slot: active.hour_slot,
    pickUpmh: computeRate(active.pick_units, active.pick_hours),
    packUpmh: computeRate(active.pack_units, active.pack_hours),
    packUnits: active.pack_units ?? null,
  }
}

export function cumulativeStats(hourly: HourlyRow[]): CumulativeStats {
  const pickUnits = sum(hourly.map((r) => r.pick_units))
  const packUnits = sum(hourly.map((r) => r.pack_units))
  const pickHours = sum(hourly.map((r) => r.pick_hours))
  const packHours = sum(hourly.map((r) => r.pack_hours))
  return {
    pickUpmh: computeRate(pickUnits, pickHours),
    packUpmh: computeRate(packUnits, packHours),
    packUnitsTotal: packUnits,
  }
}
