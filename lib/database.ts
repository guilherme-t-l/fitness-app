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

  // Update workout completion
  async updateWorkoutCompletion(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          completions: supabase.rpc('increment', { row_id: id, x: 1 }),
          last_completed: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating workout completion:', error)
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