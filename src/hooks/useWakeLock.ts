import { useCallback, useRef } from 'react'

type WakeLockSentinelLike = { release: () => Promise<void> }

/**
 * Requests a screen wake lock on demand (browsers require a user gesture).
 * Call `requestWakeLock` from a click/tap handler.
 */
export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  const requestWakeLock = useCallback(async () => {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> }
      }
      if (nav.wakeLock) {
        sentinelRef.current = await nav.wakeLock.request('screen')
      }
    } catch {
      // Wake lock isn't available/allowed here — fail silently, it's a nice-to-have.
    }
  }, [])

  return { requestWakeLock }
}
