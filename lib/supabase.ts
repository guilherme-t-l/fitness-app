import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client if environment variables are not set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
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
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
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
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
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