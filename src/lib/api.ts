import { supabase } from './supabase'
import { HOUR_SLOTS } from './constants'
import type { HourlyRow, LeaderboardEntry, ReportDay } from './types'

export interface FullReportDay {
  day: ReportDay
  hourly: HourlyRow[]
  leaderboard: LeaderboardEntry[]
}

function emptyHourlyRows(reportDate: string): HourlyRow[] {
  return HOUR_SLOTS.map((slot, i) => ({
    report_date: reportDate,
    hour_index: i,
    hour_slot: slot,
    pick_plan: null,
    pick_units: null,
    pick_hours: null,
    pack_plan: null,
    pack_units: null,
    pack_hours: null,
  }))
}

function emptyLeaderboard(reportDate: string): LeaderboardEntry[] {
  const out: LeaderboardEntry[] = []
  for (const board_type of ['top5', 'bottom5'] as const) {
    for (const role of ['picker', 'packer'] as const) {
      for (let rank = 1; rank <= 5; rank++) {
        out.push({ report_date: reportDate, board_type, role, rank, employee_name: '', units: null })
      }
    }
  }
  return out
}

export async function fetchFullReportDay(reportDate: string): Promise<FullReportDay> {
  const [dayRes, hourlyRes, leaderboardRes] = await Promise.all([
    supabase.from('fiege_report_days').select('*').eq('report_date', reportDate).maybeSingle(),
    supabase.from('fiege_hourly_data').select('*').eq('report_date', reportDate).order('hour_index'),
    supabase.from('fiege_leaderboard_entries').select('*').eq('report_date', reportDate).order('rank'),
  ])

  const day: ReportDay = (dayRes.data as ReportDay | null) ?? {
    report_date: reportDate,
    banner_message: null,
    units_to_pick: null,
    units_to_pack: null,
    pre_processed_failed: null,
    backlog_orders: null,
    overpicks: null,
    updated_at: new Date().toISOString(),
  }

  const hourlyByIndex = new Map(((hourlyRes.data as HourlyRow[] | null) ?? []).map((r) => [r.hour_index, r]))
  const hourly = emptyHourlyRows(reportDate).map((row) => hourlyByIndex.get(row.hour_index) ?? row)

  const lbKey = (e: LeaderboardEntry) => `${e.board_type}-${e.role}-${e.rank}`
  const lbByKey = new Map(((leaderboardRes.data as LeaderboardEntry[] | null) ?? []).map((e) => [lbKey(e), e]))
  const leaderboard = emptyLeaderboard(reportDate).map((e) => lbByKey.get(lbKey(e)) ?? e)

  return { day, hourly, leaderboard }
}

/**
 * Just the leaderboard rows for one date — used by the "All Boards" overview,
 * which lets admins browse any past date without loading/affecting the
 * SIC/units data the rest of the Admin panel is currently editing.
 */
export async function fetchLeaderboardEntries(reportDate: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('fiege_leaderboard_entries')
    .select('*')
    .eq('report_date', reportDate)
    .order('board_type')
    .order('role')
    .order('rank')
  if (error) throw error
  return (data as LeaderboardEntry[] | null) ?? []
}

/** Same as above but for every date in [startDate, endDate] inclusive — used by the "All Boards" overview's monthly view. */
export async function fetchLeaderboardEntriesRange(startDate: string, endDate: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('fiege_leaderboard_entries')
    .select('*')
    .gte('report_date', startDate)
    .lte('report_date', endDate)
    .order('report_date')
    .order('board_type')
    .order('role')
    .order('rank')
  if (error) throw error
  return (data as LeaderboardEntry[] | null) ?? []
}

export async function saveAndBroadcast(data: FullReportDay): Promise<void> {
  const { day, hourly, leaderboard } = data

  const { error: dayError } = await supabase
    .from('fiege_report_days')
    .upsert({ ...day, updated_at: new Date().toISOString() }, { onConflict: 'report_date' })
  if (dayError) throw dayError

  const { error: hourlyError } = await supabase
    .from('fiege_hourly_data')
    .upsert(
      hourly.map(({ id: _id, ...rest }) => rest),
      { onConflict: 'report_date,hour_index' }
    )
  if (hourlyError) throw hourlyError

  const { error: lbError } = await supabase
    .from('fiege_leaderboard_entries')
    .upsert(
      leaderboard.map(({ id: _id, ...rest }) => rest),
      { onConflict: 'report_date,board_type,role,rank' }
    )
  if (lbError) throw lbError
}

export async function resetDay(reportDate: string): Promise<void> {
  await Promise.all([
    supabase.from('fiege_hourly_data').delete().eq('report_date', reportDate),
    supabase.from('fiege_leaderboard_entries').delete().eq('report_date', reportDate),
  ])
  await supabase
    .from('fiege_report_days')
    .upsert(
      {
        report_date: reportDate,
        banner_message: null,
        units_to_pick: null,
        units_to_pack: null,
        pre_processed_failed: null,
        backlog_orders: null,
        overpicks: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'report_date' }
    )
}
