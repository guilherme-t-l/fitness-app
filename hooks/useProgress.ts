import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  databaseService,
  type WorkoutStats,
  type WorkoutHistory,
  type ExercisePerformanceHistory,
  type StrengthTrend,
  type StrengthDelta,
} from '@/lib/database'
import { parseWeight } from '@/lib/utils'

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)
  return start
}

function buildStrengthTrends(
  performances: ExercisePerformanceHistory[],
  limit = 5
): StrengthTrend[] {
  const byExercise = new Map<string, ExercisePerformanceHistory[]>()

  for (const row of performances) {
    const key = row.exerciseName.trim().toLowerCase()
    if (!key) continue
    const list = byExercise.get(key) || []
    list.push(row)
    byExercise.set(key, list)
  }

  const trends: StrengthTrend[] = []

  for (const [, rows] of byExercise) {
    const sorted = [...rows].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    const latest = sorted[0]
    if (!latest) continue

    const withWeight = sorted.filter((r) => parseWeight(r.weightUsed) !== null)
    const latestWeighed = withWeight[0]
    const previousWeighed = withWeight[1]

    let delta: StrengthDelta = 'unknown'
    let deltaKg: number | null = null
    let previousWeight: string | undefined

    if (latestWeighed && previousWeighed) {
      const latestNum = parseWeight(latestWeighed.weightUsed)!
      const prevNum = parseWeight(previousWeighed.weightUsed)!
      deltaKg = latestNum - prevNum
      previousWeight = previousWeighed.weightUsed
      if (deltaKg > 0) delta = 'up'
      else if (deltaKg < 0) delta = 'down'
      else delta = 'same'
    } else if (latestWeighed && !previousWeighed) {
      delta = 'new'
    } else if (!latest.weightUsed) {
      delta = 'unknown'
    } else {
      delta = 'new'
    }

    trends.push({
      exerciseName: latest.exerciseName,
      latestWeight: (latestWeighed || latest).weightUsed,
      latestReps: (latestWeighed || latest).repsPerformed,
      previousWeight,
      deltaKg,
      delta,
      completedAt: latest.completedAt,
    })
  }

  const withSignal = trends.filter(
    (t) => t.delta !== 'unknown' || Boolean(t.latestWeight)
  )

  return withSignal
    .sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, limit)
}

export function useProgress(userId?: string) {
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalCompletions: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
    currentStreak: 0
  })
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([])
  const [performanceHistory, setPerformanceHistory] = useState<ExercisePerformanceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsData, historyData, performanceData] = await Promise.all([
        databaseService.getWorkoutStats(userId),
        databaseService.getWorkoutHistory(365, userId),
        databaseService.getExercisePerformanceHistory(200, userId),
      ])

      setStats(statsData)
      setWorkoutHistory(historyData)
      setPerformanceHistory(performanceData)
    } catch (err) {
      console.error('Error loading progress data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const refreshProgress = useCallback(async () => {
    await loadProgressData()
  }, [loadProgressData])

  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  const recentSessions = useMemo(
    () => workoutHistory.slice(0, 8),
    [workoutHistory]
  )

  const strengthTrends = useMemo(
    () => buildStrengthTrends(performanceHistory, 5),
    [performanceHistory]
  )

  const weeklySets = useMemo(() => {
    const weekStart = startOfWeek(new Date()).getTime()
    return performanceHistory
      .filter((row) => new Date(row.completedAt).getTime() >= weekStart)
      .reduce((sum, row) => sum + (row.setsCompleted || 0), 0)
  }, [performanceHistory])

  const setsByMuscleForRange = useCallback(
    (sinceMs: number) => {
      const totals = new Map<string, number>()

      for (const row of performanceHistory) {
        if (new Date(row.completedAt).getTime() < sinceMs) continue
        const sets = row.setsCompleted || 0
        if (sets <= 0) continue
        const muscles =
          row.muscleGroups.length > 0
            ? row.muscleGroups
            : row.categories.length > 0
              ? row.categories
              : ['Uncategorized']
        for (const muscle of muscles) {
          totals.set(muscle, (totals.get(muscle) || 0) + sets)
        }
      }

      return Array.from(totals.entries())
        .map(([muscle, sets]) => ({ muscle, sets }))
        .sort((a, b) => b.sets - a.sets)
    },
    [performanceHistory]
  )

  /** Sets by muscle/category for the current calendar week. */
  const weeklySetsByMuscle = useMemo(
    () => setsByMuscleForRange(startOfWeek(new Date()).getTime()),
    [setsByMuscleForRange]
  )

  /** Sets by muscle/category for the last 30 days. */
  const monthlySetsByMuscle = useMemo(
    () => setsByMuscleForRange(Date.now() - 30 * 24 * 60 * 60 * 1000),
    [setsByMuscleForRange]
  )

  /** Sessions per week for the last 5 calendar weeks (oldest → newest). */
  const monthlySessionsByWeek = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date())
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return Array.from({ length: 5 }, (_, index) => {
      const weekStart = new Date(currentWeekStart)
      weekStart.setDate(weekStart.getDate() - (4 - index) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const sessions = workoutHistory.filter((workout) => {
        const ts = new Date(workout.completedAt).getTime()
        return ts >= weekStart.getTime() && ts < weekEnd.getTime()
      }).length

      return {
        week: `${monthLabels[weekStart.getMonth()]} ${weekStart.getDate()}`,
        sessions,
      }
    })
  }, [workoutHistory])

  return {
    stats,
    workoutHistory,
    recentSessions,
    strengthTrends,
    weeklySets,
    weeklySetsByMuscle,
    monthlySetsByMuscle,
    monthlySessionsByWeek,
    loading,
    error,
    refreshProgress,
    loadProgressData
  }
}
