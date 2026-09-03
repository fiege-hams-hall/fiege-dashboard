import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { HourlyRow, LeaderboardEntry, ReportDay } from '../lib/types'

export interface ReportDayData {
  day: ReportDay | null
  hourly: HourlyRow[]
  leaderboard: LeaderboardEntry[]
  loading: boolean
  refresh: () => void
}

/**
 * Loads (and keeps live via Supabase Realtime) all data for a given report date:
 * the day summary row, the 24 hourly rows, and every leaderboard entry.
 */
export function useReportDay(reportDate: string): ReportDayData {
  const [day, setDay] = useState<ReportDay | null>(null)
  const [hourly, setHourly] = useState<HourlyRow[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [dayRes, hourlyRes, leaderboardRes] = await Promise.all([
      supabase.from('fiege_report_days').select('*').eq('report_date', reportDate).maybeSingle(),
      supabase.from('fiege_hourly_data').select('*').eq('report_date', reportDate).order('hour_index'),
      supabase.from('fiege_leaderboard_entries').select('*').eq('report_date', reportDate).order('rank'),
    ])
    setDay((dayRes.data as ReportDay | null) ?? null)
    setHourly((hourlyRes.data as HourlyRow[] | null) ?? [])
    setLeaderboard((leaderboardRes.data as LeaderboardEntry[] | null) ?? [])
    setLoading(false)
  }, [reportDate])

  useEffect(() => {
    setLoading(true)
    load()

    const channel = supabase
      .channel(`report-day-${reportDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fiege_report_days', filter: `report_date=eq.${reportDate}` },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fiege_hourly_data', filter: `report_date=eq.${reportDate}` },
        () => load()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fiege_leaderboard_entries',
          filter: `report_date=eq.${reportDate}`,
        },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reportDate, load])

  return { day, hourly, leaderboard, loading, refresh: load }
}
