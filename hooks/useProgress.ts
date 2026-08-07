import { useState, useEffect, useCallback, useMemo } from 'react'
import { databaseService, type WorkoutStats, type CategoryBreakdown, type WorkoutHistory } from '@/lib/database'

export function useProgress(userId?: string) {
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalCompletions: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
    currentStreak: 0
  })
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load progress data
  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all progress data in parallel, pass userId if needed
      const [statsData, categoryData, historyData] = await Promise.all([
        databaseService.getWorkoutStats(userId),
        databaseService.getCategoryBreakdown(userId),
        // Pull enough history for monthly trends (not just the chart week)
        databaseService.getWorkoutHistory(365, userId)
      ])

      setStats(statsData)
      setCategoryBreakdown(categoryData)
      setWorkoutHistory(historyData)
    } catch (err) {
      console.error('Error loading progress data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Refresh progress data
  const refreshProgress = useCallback(async () => {
    await loadProgressData()
  }, [loadProgressData])

  // Load data on mount or when userId changes
  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  // Calculate additional metrics
  const weeklyGoal = 6 // Configurable goal
  const monthlyGoal = 24 // Configurable goal
  const weeklyProgress = (stats.thisWeekWorkouts / weeklyGoal) * 100
  const monthlyProgress = (stats.thisMonthWorkouts / monthlyGoal) * 100

  // Get top performing categories
  const topCategories = categoryBreakdown
    .filter(cat => cat.completionCount > 0)
    .slice(0, 5)

  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
    startOfWeek.setHours(0, 0, 0, 0)

    return days.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + index)

      const dayWorkouts = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.completedAt)
        return workoutDate.toDateString() === date.toDateString()
      })

      const duration = dayWorkouts.reduce(
        (sum, workout) => sum + (workout.durationMinutes || 0),
        0
      )

      return {
        day,
        workouts: dayWorkouts.length,
        duration
      }
    })
  }, [workoutHistory])

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return Array.from({ length: 6 }, (_, offset) => {
      const monthIndex = (currentMonth - 5 + offset + 12) % 12
      const year = currentMonth - 5 + offset < 0 ? currentYear - 1 : currentYear
      const label = months[monthIndex]

      const monthWorkouts = workoutHistory.filter(workout => {
        const completedAt = new Date(workout.completedAt)
        return completedAt.getMonth() === monthIndex && completedAt.getFullYear() === year
      })

      const totalDuration = monthWorkouts.reduce(
        (sum, workout) => sum + (workout.durationMinutes || 0),
        0
      )
      const avgDuration =
        monthWorkouts.length > 0 ? Math.round(totalDuration / monthWorkouts.length) : 0

      return {
        month: label,
        workouts: monthWorkouts.length,
        avgDuration
      }
    })
  }, [workoutHistory])

  return {
    // Data
    stats,
    categoryBreakdown,
    workoutHistory,
    topCategories,
    
    // Calculated metrics
    weeklyGoal,
    monthlyGoal,
    weeklyProgress,
    monthlyProgress,
    
    // Chart data
    weeklyActivity,
    monthlyTrend,
    
    // State
    loading,
    error,
    
    // Actions
    refreshProgress,
    loadProgressData
  }
}
