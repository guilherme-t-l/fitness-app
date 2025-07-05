// TODO: Technical Debt
// - Refactor: Separate data conversion, business logic, and error handling into distinct modules/functions for maintainability.
// - Optimize: Avoid deleting and re-inserting all exercises on update; implement granular updates for better scalability.
// - Error Handling: Add more granular error handling and user feedback throughout service methods.

import { supabase } from './supabase'
import type { Database } from './supabase'

type Workout = Database['public']['Tables']['workouts']['Row']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

type Exercise = Database['public']['Tables']['exercises']['Row']
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
type ExerciseUpdate = Database['public']['Tables']['exercises']['Update']

// Extended workout type with exercises for the frontend
export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[]
}

// Frontend workout type (for compatibility)
export interface FrontendWorkout {
  id: string
  name: string
  description: string
  exercises: FrontendExercise[]
  estimatedDuration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  createdAt: string
  lastCompleted?: string
  completions: number
}

// Frontend exercise type
export interface FrontendExercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  restTime?: string
  notes?: string
  adjustment?: string
  description?: string
}

// Workout history types
export interface WorkoutHistory {
  id: string
  workoutId: string
  completedAt: string
  durationMinutes?: number
  notes?: string
}

export interface ExercisePerformance {
  id: string
  workoutHistoryId: string
  exerciseId: string
  exerciseName: string
  setsCompleted: number
  repsPerformed?: string
  weightUsed?: string
  notes?: string
  createdAt: string
}

// Progress statistics types
export interface WorkoutStats {
  totalWorkouts: number
  totalCompletions: number
  thisWeekWorkouts: number
  thisMonthWorkouts: number
  currentStreak: number
}

export interface CategoryBreakdown {
  category: string
  workoutCount: number
  completionCount: number
}

// Convert database workout to frontend format
const convertWorkoutToFrontend = (workout: Workout, exercises: Exercise[]): FrontendWorkout => {
  return {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    estimatedDuration: workout.estimated_duration,
    difficulty: workout.difficulty,
    category: workout.category,
    createdAt: workout.created_at,
    lastCompleted: workout.last_completed || undefined,
    completions: workout.completions,
    exercises: exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || undefined,
      restTime: exercise.rest_time || undefined,
      notes: exercise.notes || undefined,
      adjustment: exercise.adjustment || undefined,
      description: exercise.description || undefined,
    }))
  }
}

// Convert frontend workout to database format
const convertWorkoutToDatabase = (workout: Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>): {
  workout: WorkoutInsert
  exercises: ExerciseInsert[]
} => {
  const workoutData: WorkoutInsert = {
    name: workout.name,
    description: workout.description,
    estimated_duration: workout.estimatedDuration,
    difficulty: workout.difficulty,
    category: workout.category,
    last_completed: workout.lastCompleted,
    completions: 0,
  }

  const exercisesData: ExerciseInsert[] = workout.exercises.map((exercise, index) => ({
    workout_id: '', // Will be set after workout creation
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    rest_time: exercise.restTime,
    notes: exercise.notes,
    adjustment: exercise.adjustment,
    description: exercise.description,
    order_index: index,
  }))

  return { workout: workoutData, exercises: exercisesData }
}

// Database operations
export const databaseService = {
  // Get all workouts with exercises
  async getWorkouts(): Promise<FrontendWorkout[]> {
    try {
      // Get all workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (workoutsError) throw workoutsError

      if (!workouts) return []

      // Get exercises for all workouts
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('order_index', { ascending: true })

      if (exercisesError) throw exercisesError

      // Group exercises by workout_id
      const exercisesByWorkout = exercises?.reduce((acc, exercise) => {
        if (!acc[exercise.workout_id]) {
          acc[exercise.workout_id] = []
        }
        acc[exercise.workout_id].push(exercise)
        return acc
      }, {} as Record<string, Exercise[]>) || {}

      // Convert to frontend format
      return workouts.map(workout => 
        convertWorkoutToFrontend(workout, exercisesByWorkout[workout.id] || [])
      )
    } catch (error) {
      console.error('Error fetching workouts:', error)
      throw error
    }
  },

  // Get single workout with exercises
  async getWorkout(id: string): Promise<FrontendWorkout | null> {
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

      if (workoutError) throw workoutError
      if (!workout) return null

      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', id)
        .order('order_index', { ascending: true })

      if (exercisesError) throw exercisesError

      return convertWorkoutToFrontend(workout, exercises || [])
    } catch (error) {
      console.error('Error fetching workout:', error)
      throw error
    }
  },

  // Create new workout with exercises
  async createWorkout(workoutData: Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>): Promise<FrontendWorkout> {
    try {
      const { workout, exercises } = convertWorkoutToDatabase(workoutData)

      // Insert workout first
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert(workout)
        .select()
        .single()

      if (workoutError) throw workoutError
      if (!newWorkout) throw new Error('Failed to create workout')

      // Insert exercises with workout_id
      const exercisesWithWorkoutId = exercises.map(exercise => ({
        ...exercise,
        workout_id: newWorkout.id
      }))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithWorkoutId)

      if (exercisesError) throw exercisesError

      // Return the complete workout
      return await this.getWorkout(newWorkout.id) as FrontendWorkout
    } catch (error) {
      console.error('Error creating workout:', error)
      throw error
    }
  },

  // Update workout
  async updateWorkout(id: string, workoutData: Partial<Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>>): Promise<FrontendWorkout> {
    try {
      // Update workout data
      const workoutUpdate: WorkoutUpdate = {}
      if (workoutData.name) workoutUpdate.name = workoutData.name
      if (workoutData.description) workoutUpdate.description = workoutData.description
      if (workoutData.estimatedDuration) workoutUpdate.estimated_duration = workoutData.estimatedDuration
      if (workoutData.difficulty) workoutUpdate.difficulty = workoutData.difficulty
      if (workoutData.category) workoutUpdate.category = workoutData.category
      if (workoutData.lastCompleted) workoutUpdate.last_completed = workoutData.lastCompleted

      const { error: workoutError } = await supabase
        .from('workouts')
        .update(workoutUpdate)
        .eq('id', id)

      if (workoutError) throw workoutError

      // Update exercises if provided
      if (workoutData.exercises) {
        // Delete existing exercises
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .eq('workout_id', id)

        if (deleteError) throw deleteError

        // Insert new exercises
        const exercisesData: ExerciseInsert[] = workoutData.exercises.map((exercise, index) => ({
          workout_id: id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest_time: exercise.restTime,
          notes: exercise.notes,
          adjustment: exercise.adjustment,
          description: exercise.description,
          order_index: index,
        }))

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesData)

        if (exercisesError) throw exercisesError
      }

      // Return updated workout
      return await this.getWorkout(id) as FrontendWorkout
    } catch (error) {
      console.error('Error updating workout:', error)
      throw error
    }
  },

  // Delete workout
  async deleteWorkout(id: string): Promise<void> {
    try {
      // Delete exercises first (due to foreign key constraint)
      const { error: exercisesError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', id)

      if (exercisesError) throw exercisesError

      // Delete workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (workoutError) throw workoutError
    } catch (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
  },

  // Update workout completion with detailed history
  async updateWorkoutCompletion(id: string, durationMinutes?: number, notes?: string): Promise<void> {
    try {
      // Fetch current completions
      const { data: workout, error: fetchError } = await supabase
        .from('workouts')
        .select('completions')
        .eq('id', id)
        .single()
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw fetchError
      }
      if (!workout) {
        console.error('No workout found for id:', id)
        throw new Error('No workout found for id: ' + id)
      }
      const newCompletions = (workout.completions || 0) + 1
      
      // Update workout completion count
      const { error: updateError, data } = await supabase
        .from('workouts')
        .update({
          completions: newCompletions,
          last_completed: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw updateError
      }
      if (!data || data.length === 0) {
        console.error('No data returned from updateWorkoutCompletion', { id })
        throw new Error('No data returned from updateWorkoutCompletion')
      }

      // Create workout history record
      const { error: historyError } = await supabase
        .from('workout_history')
        .insert({
          workout_id: id,
          duration_minutes: durationMinutes,
          notes: notes
        })
      if (historyError) {
        console.error('Error creating workout history:', historyError)
        throw historyError
      }
    } catch (error) {
      console.error('Error updating workout completion:', error)
      throw error
    }
  },

  // Get workout statistics
  async getWorkoutStats(): Promise<WorkoutStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_workout_stats')
      
      if (error) throw error
      if (!data || data.length === 0) {
        return {
          totalWorkouts: 0,
          totalCompletions: 0,
          thisWeekWorkouts: 0,
          thisMonthWorkouts: 0,
          currentStreak: 0
        }
      }

      const stats = data[0]
      return {
        totalWorkouts: Number(stats.total_workouts) || 0,
        totalCompletions: Number(stats.total_completions) || 0,
        thisWeekWorkouts: Number(stats.this_week_workouts) || 0,
        thisMonthWorkouts: Number(stats.this_month_workouts) || 0,
        currentStreak: Number(stats.current_streak) || 0
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error)
      throw error
    }
  },

  // Get category breakdown
  async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_category_breakdown')
      
      if (error) throw error
      if (!data) return []

      return data.map((item: any) => ({
        category: item.category,
        workoutCount: Number(item.workout_count) || 0,
        completionCount: Number(item.completion_count) || 0
      }))
    } catch (error) {
      console.error('Error fetching category breakdown:', error)
      throw error
    }
  },

  // Get workout history
  async getWorkoutHistory(limit: number = 50): Promise<WorkoutHistory[]> {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select(`
          id,
          workout_id,
          completed_at,
          duration_minutes,
          notes,
          workouts!inner(name, category)
        `)
        .order('completed_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      if (!data) return []

      return data.map((item: any) => ({
        id: item.id,
        workoutId: item.workout_id,
        completedAt: item.completed_at,
        durationMinutes: item.duration_minutes,
        notes: item.notes
      }))
    } catch (error) {
      console.error('Error fetching workout history:', error)
      throw error
    }
  },

  // Update exercises for a workout
  async updateWorkoutExercises(workoutId: string, exercises: FrontendExercise[]): Promise<void> {
    try {
      // Delete existing exercises
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workoutId)

      if (deleteError) throw deleteError

      // Insert new exercises
      const exercisesData: ExerciseInsert[] = exercises.map((exercise, index) => ({
        workout_id: workoutId,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        rest_time: exercise.restTime,
        notes: exercise.notes,
        adjustment: exercise.adjustment,
        description: exercise.description,
        order_index: index,
      }))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData)

      if (exercisesError) throw exercisesError
    } catch (error) {
      console.error('Error updating workout exercises:', error)
      throw error
    }
  }
} 