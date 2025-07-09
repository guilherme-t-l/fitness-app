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
  const { user } = useAuth()
  const { workouts, loading, error, completeWorkout, updateWorkoutExercises } = useWorkouts(user?.id)
  const [workout, setWorkout] = useState<FrontendWorkout | null>(null)
  const [notFound, setNotFound] = useState(false)

  const workoutId = params.id as string

  useEffect(() => {
    if (!loading && workouts.length > 0) {
      const foundWorkout = workouts.find(w => w.id === workoutId)
      if (foundWorkout) {
        setWorkout(foundWorkout)
        setNotFound(false)
      } else {
        setNotFound(true)
      }
    }
  }, [workoutId, workouts, loading])

  const handleCompleteWorkout = async () => {
    if (workout) {
      try {
        await completeWorkout(workout.id)
        router.push('/workouts')
      } catch (error) {
        console.error('Failed to complete workout:', error)
      }
    }
  }

  const handleExit = () => {
    router.push('/workouts')
  }

  const handleSaveChanges = async (workoutId: string, updatedExercises: any[]) => {
    try {
      await updateWorkoutExercises(workoutId, updatedExercises)
    } catch (error) {
      console.error('Failed to save workout changes:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading workout...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">⚠️ {error}</div>
          <p className="text-gray-400">Please check your database connection</p>
          <Button onClick={() => window.location.reload()} className="primary-glow">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">⚠️ Workout not found</div>
          <p className="text-gray-400">The workout you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/workouts')} className="primary-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </div>
      </div>
    )
  }

  // Show workout session
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