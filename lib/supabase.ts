import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          name: string
          description: string
          estimated_duration: string
          workout_type: 'Strength' | 'Hypertrophy' | 'Endurance' | 'Cardio' | 'Mobility' | 'Skill' | 'Recovery'
          category: string
          created_at: string
          last_completed?: string
          completions: number
          user_id?: string // For future multi-user support
        }
        Insert: {
          id?: string
          name: string
          description: string
          estimated_duration: string
          workout_type: 'Strength' | 'Hypertrophy' | 'Endurance' | 'Cardio' | 'Mobility' | 'Skill' | 'Recovery'
          category: string
          created_at?: string
          last_completed?: string
          completions?: number
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          estimated_duration?: string
          workout_type?: 'Strength' | 'Hypertrophy' | 'Endurance' | 'Cardio' | 'Mobility' | 'Skill' | 'Recovery'
          category?: string
          created_at?: string
          last_completed?: string
          completions?: number
          user_id?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          sets: number
          reps: string
          weight?: string
          rest_time?: string
          notes?: string
          adjustment?: string
          description?: string
          order_index: number
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          sets: number
          reps: string
          weight?: string
          rest_time?: string
          notes?: string
          adjustment?: string
          description?: string
          order_index: number
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          sets?: number
          reps?: string
          weight?: string
          rest_time?: string
          notes?: string
          adjustment?: string
          description?: string
          order_index?: number
        }
      }
    }
  }
} 