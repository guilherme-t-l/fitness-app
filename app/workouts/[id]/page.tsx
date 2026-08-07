"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { WorkoutSession } from "@/components/workout-session"
import { useWorkouts } from "@/hooks/useWorkouts"
import { type FrontendWorkout } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from '@/components/AuthProvider'

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { workouts, loading, error, completeWorkout, updateWorkoutExercises } = useWorkouts(user?.id, !authLoading)
  const [workout, setWorkout] = useState<FrontendWorkout | null>(null)
  const [notFound, setNotFound] = useState(false)

  const workoutId = params.id as string

  useEffect(() => {
    if (loading) return
    const foundWorkout = workouts.find(w => w.id === workoutId)
    if (foundWorkout) {
      setWorkout(foundWorkout)
      setNotFound(false)
    } else {
      setWorkout(null)
      setNotFound(true)
    }
  }, [workoutId, workouts, loading])

  const handleCompleteWorkout = async (opts: {
    durationMinutes: number
    notes: string
    performances?: Array<{
      exerciseName: string
      setsCompleted: number
      repsPerformed?: string
      weightUsed?: string
      notes?: string
    }>
  }) => {
    if (!workout) {
      throw new Error('Workout not loaded')
    }
    try {
      await completeWorkout(workout.id, {
        durationMinutes: opts.durationMinutes,
        notes: opts.notes,
        performances: opts.performances,
      })
      router.push('/workouts')
    } catch (error) {
      console.error('Failed to complete workout:', error)
      throw error
    }
  }

  const handleExit = () => {
    router.push('/workouts')
  }

  const handleSaveChanges = async (workoutId: string, updatedExercises: any[]) => {
    await updateWorkoutExercises(workoutId, updatedExercises)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Preparing your session…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <p className="font-display text-2xl text-foreground">Workout not found</p>
          <p className="text-muted-foreground text-sm">This routine may have been removed.</p>
          <Button onClick={() => router.push('/workouts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to workouts
          </Button>
        </div>
      </div>
    )
  }

  if (workout) {
    return (
      <WorkoutSession
        workout={workout}
        onComplete={handleCompleteWorkout}
        onExit={handleExit}
        onSaveChanges={handleSaveChanges}
      />
    )
  }

  return null
}
