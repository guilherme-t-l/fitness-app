"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Edit2, X, Clock, ArrowLeft, Check } from "lucide-react"
import type { SetStateAction } from "react"
import { useTimer } from "@/hooks/useTimer"
import { useAutoSave } from "@/hooks/useAutoSave"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { databaseService } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface Exercise {
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

interface Workout {
  id: string
  name: string
  description: string
  exercises: Exercise[]
  estimatedDuration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
}

interface WorkoutSessionProps {
  workout: Workout
  onComplete: () => void
  onExit: () => void
  onSaveChanges: (workoutId: string, updatedExercises: Exercise[]) => void
}

interface ExerciseState extends Exercise {
  completed: boolean;
  currentSets: number;
  actualReps?: string;
  actualWeight?: string;
  actualName?: string;
  adjustment?: string;
  description?: string;
}

export function WorkoutSession({ workout, onComplete, onExit, onSaveChanges }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<ExerciseState[]>(
    workout.exercises.map((ex) => ({
      ...ex,
      completed: false,
      currentSets: 0,
      actualReps: ex.reps,
      actualWeight: ex.weight,
      actualName: ex.name,
      adjustment: ex.adjustment || "",
      description: ex.description || "",
    })),
  )
  const [startTime] = useState(Date.now())
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [savedChanges, setSavedChanges] = useState<Set<string>>(new Set())
  const [saveTimeouts, setSaveTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [restTimers, setRestTimers] = useState<Record<string, number>>({})
  const [restActive, setRestActive] = useState<Record<string, boolean>>({})
  const restIntervals = useRef<Record<string, NodeJS.Timeout | null>>({})
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)
  const navFallbackTimeout = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      saveTimeouts.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
    }
  }, [saveTimeouts])

  const parseRestTime = (restTime?: string) => {
    if (!restTime) return 60
    const match = restTime.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 60
  }

  // Play sound and vibrate when timer hits 0
  const notifyRestEnd = () => {
    // Play a short beep using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = 880
      g.gain.value = 0.2
      o.connect(g); g.connect(ctx.destination)
      o.start()
      setTimeout(() => { o.stop(); ctx.close() }, 200)
    } catch {}
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(200)
  }

  // Keep timer in sync with restTime changes
  useEffect(() => {
    exercises.forEach((ex: ExerciseState) => {
      const parsed = parseRestTime(ex.restTime)
      setRestTimers((prev: Record<string, number>) => {
        if (prev[ex.id] === undefined || prev[ex.id] > parsed) {
          return { ...prev, [ex.id]: parsed }
        }
        return prev
      })
    })
  }, [exercises])

  // Countdown logic
  useEffect(() => {
    exercises.forEach((ex: ExerciseState) => {
      if (restActive[ex.id] && !restIntervals.current[ex.id]) {
        restIntervals.current[ex.id] = setInterval(() => {
          setRestTimers((prev: Record<string, number>) => {
            const next = (prev[ex.id] ?? parseRestTime(ex.restTime)) - 1
            if (next === 0) notifyRestEnd()
            return { ...prev, [ex.id]: Math.max(0, next) }
          })
        }, 1000)
      } else if (!restActive[ex.id] && restIntervals.current[ex.id]) {
        clearInterval(restIntervals.current[ex.id] as NodeJS.Timeout)
        restIntervals.current[ex.id] = null
      }
    })
    return () => {
      Object.values(restIntervals.current).forEach((interval) => interval && clearInterval(interval as NodeJS.Timeout))
    }
  }, [exercises, restActive])

  const handleRestButton = (id: string, restTime?: string) => {
    if (restActive[id]) {
      // Reset timer
      setRestTimers((prev) => ({ ...prev, [id]: parseRestTime(restTime) }))
    } else {
      // Start timer
      setRestTimers((prev) => ({ ...prev, [id]: parseRestTime(restTime) }))
      setRestActive((prev) => ({ ...prev, [id]: true }))
    }
  }

  // If restTime changes, reset timer to new value
  useEffect(() => {
    exercises.forEach((ex: ExerciseState) => {
      setRestTimers((prev: Record<string, number>) => {
        const parsed = parseRestTime(ex.restTime)
        if (prev[ex.id] !== undefined && prev[ex.id] > parsed) {
          return { ...prev, [ex.id]: parsed }
        }
        return prev
      })
    })
  }, [exercises.map((ex: ExerciseState) => ex.restTime).join(",")])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const toggleExerciseComplete = (exerciseId: string) => {
    setExercises(
      exercises.map((ex: ExerciseState) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed, currentSets: ex.completed ? 0 : ex.sets } : ex
      ),
    )
  }

  const saveExerciseImmediately = (exerciseId: string) => {
    const updatedExercises: Exercise[] = exercises.map((ex: ExerciseState) => ({
      id: ex.id,
      name: ex.actualName || ex.name,
      sets: ex.sets,
      reps: ex.actualReps || ex.reps,
      weight: ex.actualWeight || ex.weight,
      restTime: ex.restTime,
      notes: ex.notes,
      adjustment: ex.adjustment,
      description: ex.description,
    }))

    onSaveChanges(workout.id, updatedExercises)

    // Show visual confirmation
    setSavedChanges((prev: Set<string>) => new Set(prev).add(exerciseId))
    setTimeout(() => {
      setSavedChanges((prev: Set<string>) => {
        const newSet = new Set(prev)
        newSet.delete(exerciseId)
        return newSet
      })
    }, 2000)
  }

  const updateExercise = (exerciseId: string, field: keyof ExerciseState, value: string) => {
    setExercises(exercises.map((ex: ExerciseState) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex)))

    // Clear existing timeout for this exercise
    const existingTimeout = saveTimeouts.get(exerciseId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout for auto-save
    const newTimeout = setTimeout(() => {
      saveExerciseImmediately(exerciseId)
      setSaveTimeouts((prev: Map<string, NodeJS.Timeout>) => {
        const newMap = new Map(prev)
        newMap.delete(exerciseId)
        return newMap
      })
    }, 1000)

    setSaveTimeouts((prev: Map<string, NodeJS.Timeout>) => new Map(prev).set(exerciseId, newTimeout))
  }

  const completedExercises = exercises.filter((ex: ExerciseState) => ex.completed).length
  const progressPercentage = (completedExercises / exercises.length) * 100

  const saveChangesToWorkout = () => {
    const updatedExercises: Exercise[] = exercises.map((ex: ExerciseState) => ({
      id: ex.id,
      name: ex.actualName || ex.name,
      sets: ex.sets,
      reps: ex.actualReps || ex.reps,
      weight: ex.actualWeight || ex.weight,
      restTime: ex.restTime,
      notes: ex.notes,
      adjustment: ex.adjustment,
      description: ex.description,
    }))

    onSaveChanges(workout.id, updatedExercises)
  }

  const handleCompleteWithConfirm = async () => {
    setCompleting(true)
    try {
      saveChangesToWorkout()
      // Prepare completion data
      const exercisesData = exercises.map((ex) => ({
        name: ex.actualName || ex.name,
        sets: ex.sets,
        reps: ex.actualReps || ex.reps,
        weight: ex.actualWeight || ex.weight,
        restTime: ex.restTime,
        notes: ex.notes,
        adjustment: ex.adjustment,
        description: ex.description,
      }))
      const weights = exercisesData.map((ex) => ex.weight)
      await databaseService.insertWorkoutCompletion({
        workoutId: workout.id,
        category: workout.category,
        exercises: exercisesData,
        weights,
      })
      setShowConfirm(false)
      setCompleting(false)
      toast({
        title: "Workout complete",
        description: "Progress and details are saved. Keep building your legacy.",
        duration: 5000,
        variant: "default",
      })
      onExit()
    } catch (err) {
      setCompleting(false)
      // Optionally show error toast
    }
  }

  const formatRestTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header - Responsive Redesign */}
      <div className="sticky top-0 z-30 bg-gray-950/90 border-b border-gray-800 shadow-sm backdrop-blur px-2 py-2 md:static md:bg-transparent md:border-none md:shadow-none md:backdrop-blur-none">
        <div className="flex items-center justify-between md:justify-between mb-2">
          <Button
            variant="outline"
            onClick={() => {
              saveChangesToWorkout()
              onExit()
            }}
            className="border-gray-600 text-gray-300 hover:text-white bg-transparent px-2 py-1 text-xs md:text-base md:px-4 md:py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden xs:inline">Exit</span>
          </Button>
          <span className="flex items-center space-x-1 text-gray-400 text-xs md:text-base">
            <Clock className="h-4 w-4" />
            <span>{formatTime(currentTime - startTime)}</span>
          </span>
        </div>
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-2xl font-bold text-white truncate">{workout.name}</h1>
        </div>
        <div className="flex items-center justify-between gap-2 md:justify-center md:gap-4">
          <Badge className="bg-green-500/20 text-green-400 px-2 py-1 text-xs md:text-sm">
            {completedExercises}/{exercises.length} completed
          </Badge>
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={() => setShowConfirm(true)}
                className="primary-glow text-white font-semibold px-3 py-1 text-xs md:text-base"
                disabled={completedExercises === 0 || completing}
              >
                Complete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-br from-[#101c2c] via-[#181c2f] to-[#1a133a] border border-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm mx-auto flex flex-col gap-8 items-center">
              <AlertDialogHeader className="w-full flex flex-col items-center">
                <AlertDialogTitle className="text-white text-2xl md:text-3xl font-extrabold mb-3 tracking-tight text-center">Complete Workout?</AlertDialogTitle>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-center">Keep building your legacy.</span>
                <span className="text-gray-300 text-base md:text-lg text-center">Your progress and all exercise details will be saved.</span>
              </AlertDialogHeader>
              <div className="border-t border-gray-800 w-full" />
              <AlertDialogFooter className="w-full flex flex-row gap-4 justify-center mt-2">
                <AlertDialogCancel className="text-gray-400 border-gray-700 px-6 py-2 rounded-lg font-medium bg-gray-900/70 hover:bg-gray-800 transition">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all primary-glow"
                  onClick={handleCompleteWithConfirm}
                  disabled={completing}
                >
                  {completing ? "Saving..." : "Yes, Complete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress */}
      <Card className="card-glow">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Workout Progress</span>
              <span className="text-white">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise: ExerciseState, index: number) => (
          <Card
            key={exercise.id}
            className={`card-glow transition-all duration-300 ${exercise.completed ? "ring-2 ring-green-500/50" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExerciseComplete(exercise.id)}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    {exercise.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className={`text-lg ${exercise.completed ? "text-green-400" : "text-white"}`}>
                      {exercise.actualName || exercise.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{exercise.sets} sets</span>
                      {exercise.restTime && <span>• Rest: {exercise.restTime}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingExercise === exercise.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Save changes immediately
                          saveExerciseImmediately(exercise.id)
                          setEditingExercise(null)
                        }}
                        className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Discard changes by reverting to original values
                          setExercises(
                            exercises.map((ex: ExerciseState) =>
                              ex.id === exercise.id
                                ? {
                                    ...ex,
                                    actualReps: ex.reps,
                                    actualWeight: ex.weight,
                                    actualName: ex.name,
                                    adjustment: workout.exercises.find((orig) => orig.id === ex.id)?.adjustment || "",
                                    description: workout.exercises.find((orig) => orig.id === ex.id)?.description || "",
                                  }
                                : ex
                            )
                          )
                          setEditingExercise(null)
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingExercise(exercise.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingExercise === exercise.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Exercise Name</label>
                    <Input
                      value={exercise.actualName || ""}
                      onChange={(e) => updateExercise(exercise.id, "actualName", e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <Input
                      value={exercise.description || ""}
                      onChange={(e) => updateExercise(exercise.id, "description", e.target.value)}
                      placeholder="Brief exercise description or notes..."
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Reps</label>
                      <Input
                        value={exercise.actualReps || ""}
                        onChange={(e) => updateExercise(exercise.id, "actualReps", e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Weight</label>
                      <Input
                        value={exercise.actualWeight || ""}
                        onChange={(e) => updateExercise(exercise.id, "actualWeight", e.target.value)}
                        placeholder="kg/lbs"
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Rest Time</label>
                      <Input
                        value={exercise.restTime || ""}
                        onChange={(e) => updateExercise(exercise.id, "restTime", e.target.value)}
                        placeholder="60s"
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Machine Position</label>
                      <Input
                        type="number"
                        value={exercise.adjustment || ""}
                        onChange={(e) => updateExercise(exercise.id, "adjustment", e.target.value)}
                        placeholder="e.g., 5, 12"
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {exercise.description && (
                    <div className="text-sm">
                      <span className="text-gray-400">Description: </span>
                      <span className="text-gray-300">{exercise.description}</span>
                    </div>
                  )}
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Reps: </span>
                      <span className="text-white">{exercise.actualReps || exercise.reps}</span>
                    </div>
                    {(exercise.actualWeight || exercise.weight) && (
                      <div>
                        <span className="text-gray-400">Weight: </span>
                        <span className="text-white">{exercise.actualWeight || exercise.weight}</span>
                      </div>
                    )}
                    {exercise.restTime && (
                      <div>
                        <span className="text-gray-400">Rest: </span>
                        <span className="text-white">{exercise.restTime}</span>
                      </div>
                    )}
                    {exercise.adjustment && (
                      <div>
                        <span className="text-gray-400">Position: </span>
                        <span className="text-green-400">{exercise.adjustment}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {exercise.notes && (
                <div className="text-sm">
                  <span className="text-gray-400">Notes: </span>
                  <span className="text-gray-300">{exercise.notes}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {exercise.completed && <Badge className="bg-green-500/20 text-green-400">✓ Completed</Badge>}
                  {savedChanges.has(exercise.id) && (
                    <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">✓ Saved</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Rest Timer:</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded border ${restTimers[exercise.id] === 0 ? 'bg-red-900/60 text-red-400 border-red-700/30 animate-pulse' : 'text-green-400 bg-gray-900/60 border-green-700/30'}` }>
                    {formatRestTime(restTimers[exercise.id] ?? parseRestTime(exercise.restTime))}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    className="px-2 py-1 text-xs border-green-700/30 text-green-400 hover:bg-green-900/20"
                    onClick={() => {
                      if (restActive[exercise.id]) {
                        setRestTimers((prev: Record<string, number>) => ({ ...prev, [exercise.id]: parseRestTime(exercise.restTime) }))
                      } else {
                        setRestTimers((prev: Record<string, number>) => ({ ...prev, [exercise.id]: parseRestTime(exercise.restTime) }))
                        setRestActive((prev: Record<string, boolean>) => ({ ...prev, [exercise.id]: true }))
                      }
                    }}
                    type="button"
                  >
                    {restActive[exercise.id] ? 'Reset' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
