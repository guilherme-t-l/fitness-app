import { useEffect, useState, useRef } from "react"

// Custom hook for workout session timer
export function useTimer(startTimestamp: number) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format elapsed time as mm:ss or hh:mm:ss
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  return {
    currentTime,
    formatTime,
  }
}

// Custom hook for accurate rest timer
export function useRestTimer() {
  const [restTimers, setRestTimers] = useState<Record<string, number>>({})
  const [restActive, setRestActive] = useState<Record<string, boolean>>({})
  const [restStartTimes, setRestStartTimes] = useState<Record<string, number>>({})
  const [totalRestTimes, setTotalRestTimes] = useState<Record<string, number>>({})
  const updateInterval = useRef<NodeJS.Timeout | null>(null)

  // Parse rest time string to seconds
  const parseRestTime = (restTime?: string): number => {
    if (!restTime) return 60
    const match = restTime.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 60
  }

  // Calculate remaining time based on actual elapsed time
  const calculateRemainingTime = (exerciseId: string): number => {
    const startTime = restStartTimes[exerciseId]
    const totalRestTime = totalRestTimes[exerciseId]
    
    if (!startTime || !totalRestTime) return totalRestTime || 60
    
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
    const remaining = Math.max(0, totalRestTime - elapsedSeconds)
    
    return remaining
  }

  // Notify when timer ends
  const notifyRestEnd = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0.2
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      setTimeout(() => { o.stop(); ctx.close() }, 200)
    } catch {}
    
    if (navigator.vibrate) navigator.vibrate(200)
  }

  // Update timer display based on actual elapsed time
  useEffect(() => {
    const updateTimers = () => {
      setRestTimers((prev) => {
        const newTimers = { ...prev }
        let hasActiveTimers = false
        
        Object.keys(restActive).forEach((exerciseId) => {
          if (restActive[exerciseId]) {
            hasActiveTimers = true
            const remaining = calculateRemainingTime(exerciseId)
            
            if (remaining === 0) {
              notifyRestEnd()
              setRestActive((prev) => ({ ...prev, [exerciseId]: false }))
            }
            
            newTimers[exerciseId] = remaining
          }
        })
        
        // Only continue interval if there are active timers
        if (!hasActiveTimers && updateInterval.current) {
          clearInterval(updateInterval.current)
          updateInterval.current = null
        }
        
        return newTimers
      })
    }

    // Update immediately
    updateTimers()

    // Set up interval for UI updates only if there are active timers
    if (Object.values(restActive).some(active => active)) {
      if (!updateInterval.current) {
        updateInterval.current = setInterval(updateTimers, 100)
      }
    }
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
        updateInterval.current = null
      }
    }
  }, [restActive, restStartTimes, totalRestTimes])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force update timers when page becomes visible again
        setRestTimers((prev) => {
          const newTimers = { ...prev }
          Object.keys(restActive).forEach((exerciseId) => {
            if (restActive[exerciseId]) {
              newTimers[exerciseId] = calculateRemainingTime(exerciseId)
            }
          })
          return newTimers
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [restActive, restStartTimes, totalRestTimes])

  // Start or reset rest timer
  const handleRestTimer = (exerciseId: string, restTime?: string) => {
    const totalRestTime = parseRestTime(restTime)
    
    if (restActive[exerciseId]) {
      // Reset timer
      setRestTimers((prev) => ({ ...prev, [exerciseId]: totalRestTime }))
      setRestActive((prev) => ({ ...prev, [exerciseId]: false }))
      setRestStartTimes((prev) => {
        const newTimes = { ...prev }
        delete newTimes[exerciseId]
        return newTimes
      })
      setTotalRestTimes((prev) => {
        const newTimes = { ...prev }
        delete newTimes[exerciseId]
        return newTimes
      })
    } else {
      // Start timer with current timestamp
      setRestTimers((prev) => ({ ...prev, [exerciseId]: totalRestTime }))
      setRestActive((prev) => ({ ...prev, [exerciseId]: true }))
      setRestStartTimes((prev) => ({ ...prev, [exerciseId]: Date.now() }))
      setTotalRestTimes((prev) => ({ ...prev, [exerciseId]: totalRestTime }))
    }
  }

  // Format rest time for display
  const formatRestTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return {
    restTimers,
    restActive,
    handleRestTimer,
    formatRestTime,
    parseRestTime,
  }
} 