// TODO: Technical Debt
// - Refactor: Separate data conversion, business logic, and error handling into distinct modules/functions for maintainability.
// - Optimize: Avoid deleting and re-inserting all exercises on update; implement granular updates for better scalability.
// - Error Handling: Add more granular error handling and user feedback throughout service methods.

import { supabase } from './supabase'
import type { Database } from './supabase'
import { getSupabaseErrorMessage } from './supabaseError'
import { runSerializedWorkoutExerciseWrite } from './workoutExerciseWriteQueue'
import { getCurrentUserId } from './utils'

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
  workoutType: "Strength" | "Hypertrophy" | "Endurance" | "Cardio" | "Mobility" | "Skill" | "Recovery"
  categories: string[]
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
    workoutType: workout.workout_type,
    categories: (workout as any).categories || [],
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
const convertWorkoutToDatabase = async (workout: Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>): Promise<{
  workout: WorkoutInsert
  exercises: ExerciseInsert[]
}> => {
  const user_id = await getCurrentUserId()
  const workoutData = {
    name: workout.name,
    description: workout.description,
    estimated_duration: workout.estimatedDuration,
    workout_type: workout.workoutType,
    categories: workout.categories,
    last_completed: workout.lastCompleted,
    completions: 0,
    user_id,
  } as unknown as WorkoutInsert

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
    // user_id will be set after workout creation if needed
  }))

  return { workout: workoutData, exercises: exercisesData }
}

// Database operations
export const databaseService = {
  // Get all workouts with exercises
  async getWorkouts(userId?: string): Promise<FrontendWorkout[]> {
    try {
      const user_id = userId || await getCurrentUserId();
      // Get only workouts for the current user (or default user if guest)
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (workoutsError) throw new Error(getSupabaseErrorMessage(workoutsError))

      if (!workouts || workouts.length === 0) return []

      const workoutIds = workouts.map((w: Workout) => w.id)

      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_id', workoutIds)
        .order('order_index', { ascending: true })

      if (exercisesError) throw new Error(getSupabaseErrorMessage(exercisesError))

      // Group exercises by workout_id
      const exercisesByWorkout = exercises?.reduce((acc: Record<string, Exercise[]>, exercise: Exercise) => {
        if (!acc[exercise.workout_id]) {
          acc[exercise.workout_id] = []
        }
        acc[exercise.workout_id].push(exercise)
        return acc
      }, {} as Record<string, Exercise[]>) || {}

      // Convert to frontend format
      return workouts.map((workout: Workout) => 
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
  async createWorkout(
    workoutData: Omit<FrontendWorkout, 'id' | 'createdAt' | 'completions'>,
    overrideUserId?: string
  ): Promise<FrontendWorkout> {
    try {
      const { workout, exercises } = await convertWorkoutToDatabase(workoutData)
      if (overrideUserId) {
        workout.user_id = overrideUserId
      }

      // Insert workout first
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert(workout)
        .select()
        .single()

      if (workoutError) throw workoutError
      if (!newWorkout) throw new Error('Failed to create workout')

      // Insert exercises with workout_id (exercises table has no user_id; scoped via workout)
      const exercisesWithWorkoutId = exercises.map(exercise => ({
        ...exercise,
        workout_id: newWorkout.id,
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
      if (workoutData.workoutType) workoutUpdate.workout_type = workoutData.workoutType
      if (workoutData.categories) (workoutUpdate as any).categories = workoutData.categories
      if (workoutData.lastCompleted) workoutUpdate.last_completed = workoutData.lastCompleted
      workoutUpdate.user_id = await getCurrentUserId()

      const { error: workoutError } = await supabase
        .from('workouts')
        .update(workoutUpdate)
        .eq('id', id)

      if (workoutError) throw workoutError

      // Update exercises if provided
      if (workoutData.exercises) {
        await runSerializedWorkoutExerciseWrite(id, async () => {
          const validExercises = workoutData.exercises!.filter(
            (exercise) =>
              exercise.name &&
              typeof exercise.sets === 'number' &&
              typeof exercise.reps === 'string' &&
              exercise.reps.length > 0
          )
          const { error: deleteError } = await supabase
            .from('exercises')
            .delete()
            .eq('workout_id', id)

          if (deleteError) {
            console.error('Error deleting exercises:', deleteError?.message || deleteError)
            throw deleteError
          }

          const exercisesData: ExerciseInsert[] = validExercises.map((exercise, index) => ({
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

          if (exercisesError) {
            console.error('Error inserting exercises:', exercisesError?.message || exercisesError)
            throw exercisesError
          }
        })
      }

      // Return updated workout
      return await this.getWorkout(id) as FrontendWorkout
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating workout:', error.message)
        throw error
      } else {
        console.error('Error updating workout:', String(error))
        throw error
      }
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

  // Update workout completion with detailed history (+ optional per-exercise rows)
  async updateWorkoutCompletion(
    id: string,
    durationMinutes?: number,
    notes?: string,
    performances?: Array<{
      exerciseName: string
      setsCompleted: number
      repsPerformed?: string
      weightUsed?: string
      notes?: string
    }>
  ): Promise<void> {
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

      // Create workout history record (user_id required for RLS when not logged in)
      const historyUserId = await getCurrentUserId()
      const { data: historyRow, error: historyError } = await supabase
        .from('workout_history')
        .insert({
          workout_id: id,
          duration_minutes: durationMinutes,
          notes: notes,
          user_id: historyUserId,
        })
        .select('id')
        .single()
      if (historyError) {
        console.error('Error creating workout history:', historyError)
        throw historyError
      }

      if (performances && performances.length > 0 && historyRow?.id) {
        const { data: currentExercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('id, name, order_index')
          .eq('workout_id', id)
          .order('order_index', { ascending: true })
        if (exercisesError) {
          console.error('Error loading exercises for performance rows:', exercisesError)
          throw exercisesError
        }

        const usedExerciseIds = new Set<string>()
        const performanceRows = performances
          .map((performance, index) => {
            const byName = currentExercises?.find(
              (exercise) =>
                exercise.name === performance.exerciseName && !usedExerciseIds.has(exercise.id)
            )
            const indexed = currentExercises?.[index]
            const byIndex =
              !byName && indexed && !usedExerciseIds.has(indexed.id) ? indexed : undefined
            const matched = byName || byIndex
            if (!matched) return null
            usedExerciseIds.add(matched.id)
            return {
              workout_history_id: historyRow.id,
              exercise_id: matched.id,
              exercise_name: performance.exerciseName,
              sets_completed: performance.setsCompleted,
              reps_performed: performance.repsPerformed || null,
              weight_used: performance.weightUsed || null,
              notes: performance.notes || null,
            }
          })
          .filter((row): row is NonNullable<typeof row> => row !== null)

        if (performanceRows.length > 0) {
          const { error: performanceError } = await supabase
            .from('exercise_performance')
            .insert(performanceRows)
          if (performanceError) {
            console.error('Error creating exercise performance:', performanceError)
            throw performanceError
          }
        }
      }
    } catch (error) {
      console.error('Error updating workout completion:', error)
      throw error
    }
  },

  async getWorkoutStatsFromTables(userId: string): Promise<WorkoutStats> {
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, completions')
      .eq('user_id', userId)
    if (workoutsError) throw workoutsError

    const { data: history, error: historyError } = await supabase
      .from('workout_history')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
    if (historyError) throw historyError

    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000
    const completedDates = (history || [])
      .map((row) => new Date(row.completed_at).getTime())
      .filter((ts) => !Number.isNaN(ts))

    // Simple consecutive-day streak from most recent completion
    let currentStreak = 0
    if (completedDates.length > 0) {
      const uniqueDays = Array.from(
        new Set(completedDates.map((ts) => new Date(ts).toDateString()))
      ).map((day) => new Date(day))
      uniqueDays.sort((a, b) => b.getTime() - a.getTime())

      const latestDay = uniqueDays[0]
      if (latestDay) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const cursor = new Date(latestDay)
        cursor.setHours(0, 0, 0, 0)
        const dayMs = 24 * 60 * 60 * 1000
        // Streak only counts if last workout was today or yesterday
        if (today.getTime() - cursor.getTime() <= dayMs) {
          currentStreak = 1
          for (let i = 1; i < uniqueDays.length; i++) {
            const prevDay = uniqueDays[i - 1]
            const currDay = uniqueDays[i]
            if (!prevDay || !currDay) break
            const prev = new Date(prevDay)
            const curr = new Date(currDay)
            prev.setHours(0, 0, 0, 0)
            curr.setHours(0, 0, 0, 0)
            if (prev.getTime() - curr.getTime() === dayMs) currentStreak += 1
            else break
          }
        }
      }
    }

    return {
      totalWorkouts: workouts?.length || 0,
      totalCompletions: (workouts || []).reduce((sum, w) => sum + (w.completions || 0), 0),
      thisWeekWorkouts: completedDates.filter((ts) => ts >= weekAgo).length,
      thisMonthWorkouts: completedDates.filter((ts) => ts >= monthAgo).length,
      currentStreak,
    }
  },

  // Get workout statistics (RPC scopes via auth.uid; table fallback for local guests)
  async getWorkoutStats(_userId?: string): Promise<WorkoutStats> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data, error } = await supabase.rpc('get_workout_stats')
        if (error) throw error
        if (data && data.length > 0) {
          const stats = data[0]
          return {
            totalWorkouts: Number(stats.total_workouts) || 0,
            totalCompletions: Number(stats.total_completions) || 0,
            thisWeekWorkouts: Number(stats.this_week_workouts) || 0,
            thisMonthWorkouts: Number(stats.this_month_workouts) || 0,
            currentStreak: Number(stats.current_streak) || 0
          }
        }
      }

      const userId = _userId || await getCurrentUserId()
      return await this.getWorkoutStatsFromTables(userId)
    } catch (error) {
      console.error('Error fetching workout stats:', error)
      throw error
    }
  },

  // Get category breakdown (RPC scopes via auth.uid; table fallback for local guests)
  async getCategoryBreakdown(_userId?: string): Promise<CategoryBreakdown[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data, error } = await supabase.rpc('get_category_breakdown')
        if (error) throw error
        if (data) {
          return data.map((item: any) => ({
            category: item.category,
            workoutCount: Number(item.workout_count) || 0,
            completionCount: Number(item.completion_count) || 0
          }))
        }
      }

      const userId = _userId || await getCurrentUserId()
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('categories, completions')
        .eq('user_id', userId)
      if (error) throw error

      const breakdown = new Map<string, { workoutCount: number; completionCount: number }>()
      for (const workout of workouts || []) {
        const categories = Array.isArray(workout.categories) ? workout.categories : []
        for (const category of categories) {
          if (typeof category !== 'string' || !category) continue
          const current = breakdown.get(category) || { workoutCount: 0, completionCount: 0 }
          current.workoutCount += 1
          current.completionCount += workout.completions || 0
          breakdown.set(category, current)
        }
      }

      return Array.from(breakdown.entries())
        .map(([category, values]) => ({ category, ...values }))
        .sort((a, b) => b.completionCount - a.completionCount)
    } catch (error) {
      console.error('Error fetching category breakdown:', error)
      throw error
    }
  },

  // Get all unique categories (RPC scopes via auth.uid; table fallback for local guests)
  async getAllCategories(_userId?: string): Promise<string[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data, error } = await supabase.rpc('get_all_categories')
        if (error) throw error
        if (data) return data.map((item: any) => item.name)
      }

      const userId = _userId || await getCurrentUserId()
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('usage_count', { ascending: false })
      if (error) throw error
      return (data || []).map((item) => item.name)
    } catch (error) {
      console.error('Error fetching all categories:', error)
      throw error
    }
  },

  // Save new category to database
  async saveNewCategory(category: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('increment_category_usage', { category_name: category })

      if (error) throw error
    } catch (error) {
      console.error('Error saving new category:', error)
      throw error
    }
  },

  // Delete category from database
  async deleteCategory(category: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', category)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },

  // Get workout history
  async getWorkoutHistory(limit: number = 50, userId?: string): Promise<WorkoutHistory[]> {
    try {
      const user_id = userId || await getCurrentUserId();
      const { data, error } = await supabase
        .from('workout_history')
        .select(`
          id,
          workout_id,
          completed_at,
          duration_minutes,
          notes,
          workouts!inner(name, workout_type, categories)
        `)
        .eq('user_id', user_id)
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
    return runSerializedWorkoutExerciseWrite(workoutId, async () => {
      try {
        const validExercises = exercises.filter(
          (exercise) =>
            exercise.name &&
            typeof exercise.sets === 'number' &&
            typeof exercise.reps === 'string' &&
            exercise.reps.length > 0
        )
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .eq('workout_id', workoutId)

        if (deleteError) {
          console.error('Error deleting exercises:', deleteError?.message || deleteError)
          throw deleteError
        }

        const exercisesData: ExerciseInsert[] = validExercises.map((exercise, index) => ({
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

        if (exercisesError) {
          console.error('Error inserting exercises:', exercisesError?.message || exercisesError)
          throw exercisesError
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error updating workout exercises:', error.message)
          throw error
        }
        console.error('Error updating workout exercises:', String(error))
        throw error
      }
    })
  }
} 

export async function createStarterWorkoutsForUser(userId: string) {
  // Define starter workouts
  const starterWorkouts = [
    {
      name: 'Leg Day',
      description: 'Build lower body strength and power.',
      estimatedDuration: '45 min',
      workoutType: 'Strength',
      categories: ['Legs', 'Strength'],
      lastCompleted: undefined,
      exercises: [
        { name: 'Squat', sets: 4, reps: '8-10', weight: '', restTime: '90', notes: '', adjustment: '', description: '' },
        { name: 'Lunges', sets: 3, reps: '10/leg', weight: '', restTime: '60', notes: '', adjustment: '', description: '' },
        { name: 'Calf Raises', sets: 3, reps: '15', weight: '', restTime: '45', notes: '', adjustment: '', description: '' },
      ],
    },
    {
      name: 'Upper Body Blast',
      description: 'Push and pull for a strong upper body.',
      estimatedDuration: '40 min',
      workoutType: 'Strength',
      categories: ['Upper Body', 'Strength'],
      lastCompleted: undefined,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '12-15', weight: '', restTime: '60', notes: '', adjustment: '', description: '' },
        { name: 'Pull-ups', sets: 3, reps: '6-8', weight: '', restTime: '90', notes: '', adjustment: '', description: '' },
        { name: 'Shoulder Press', sets: 3, reps: '10', weight: '', restTime: '75', notes: '', adjustment: '', description: '' },
      ],
    },
  ];

  for (const workout of starterWorkouts) {
    await databaseService.createWorkout(
      {
        ...workout,
        id: undefined,
        createdAt: new Date().toISOString(),
        completions: 0,
      } as any,
      userId
    )
  }
}
