import { useState, useEffect, useCallback } from 'react'
import { databaseService, type FrontendWorkout, type FrontendExercise } from '@/lib/database'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<FrontendWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load workouts from database
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await databaseService.getWorkouts()
      setWorkouts(data)
    } catch (err) {
      console.error('Error loading workouts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new workout
  const createWorkout = useCallback(async (workoutData: Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>) => {
    try {
      setError(null)
      const newWorkout = await databaseService.createWorkout(workoutData)
      setWorkouts(prev => [newWorkout, ...prev])
      return newWorkout
    } catch (err) {
      console.error('Error creating workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to create workout')
      throw err
    }
  }, [])

  // Update workout
  const updateWorkout = useCallback(async (id: string, workoutData: Partial<Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>>) => {
    try {
      setError(null)
      const updatedWorkout = await databaseService.updateWorkout(id, workoutData)
      setWorkouts(prev => prev.map(w => w.id === id ? updatedWorkout : w))
      return updatedWorkout
    } catch (err) {
      console.error('Error updating workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to update workout')
      throw err
    }
  }, [])

  // Delete workout
  const deleteWorkout = useCallback(async (id: string) => {
    try {
      setError(null)
      await databaseService.deleteWorkout(id)
      setWorkouts(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Error deleting workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete workout')
      throw err
    }
  }, [])

  // Complete workout
  const completeWorkout = useCallback(async (id: string) => {
    try {
      setError(null)
      await databaseService.updateWorkoutCompletion(id)
      setWorkouts(prev => prev.map(w => 
        w.id === id 
          ? { 
              ...w, 
              completions: w.completions + 1, 
              lastCompleted: new Date().toISOString() 
            }
          : w
      ))
    } catch (err) {
      console.error('Error completing workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete workout')
      throw err
    }
  }, [])

  // Update workout exercises
  const updateWorkoutExercises = useCallback(async (workoutId: string, exercises: FrontendExercise[]) => {
    try {
      setError(null)
      await databaseService.updateWorkoutExercises(workoutId, exercises)
      setWorkouts(prev => prev.map(w => 
        w.id === workoutId 
          ? { ...w, exercises }
          : w
      ))
    } catch (err) {
      console.error('Error updating workout exercises:', err)
      setError(err instanceof Error ? err.message : 'Failed to update exercises')
      throw err
    }
  }, [])

  // Load workouts on mount
  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  return {
    workouts,
    loading,
    error,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    updateWorkoutExercises,
    refreshWorkouts: loadWorkouts,
  }
} 