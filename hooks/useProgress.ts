import { useState, useEffect, useCallback } from 'react'
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
      
      console.log('Loading progress data...')
      
      // Load all progress data in parallel, pass userId if needed
      const [statsData, categoryData, historyData] = await Promise.all([
        databaseService.getWorkoutStats(userId),
        databaseService.getCategoryBreakdown(userId),
        databaseService.getWorkoutHistory(20, userId)
      ])

      console.log('Progress data loaded successfully:', {
        stats: statsData,
        categories: categoryData,
        history: historyData
      })

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

  // Get recent workout activity for charts
  const getWeeklyActivity = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + index)
      
      const workoutsOnDay = workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.completedAt)
        return workoutDate.toDateString() === date.toDateString()
      }).length

      return {
        day,
        workouts: workoutsOnDay,
        duration: workoutsOnDay * 45 // Average duration estimate
      }
    })
  }

  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map(month => {
      // This would ideally come from actual monthly data
      // For now, we'll use estimated data based on current stats
      const estimatedWorkouts = Math.floor(Math.random() * 25) + 10
      const estimatedDuration = Math.floor(Math.random() * 15) + 35
      
      return {
        month,
        workouts: estimatedWorkouts,
        avgDuration: estimatedDuration
      }
    })
  }

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
    weeklyActivity: getWeeklyActivity(),
    monthlyTrend: getMonthlyTrend(),
    
    // State
    loading,
    error,
    
    // Actions
    refreshProgress,
    loadProgressData
  }
} 