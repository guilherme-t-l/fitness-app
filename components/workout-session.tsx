"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Edit2, X, ArrowLeft, Check } from "lucide-react"
import { useRestTimer } from "@/hooks/useTimer"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
  workoutType: "Strength" | "Hypertrophy" | "Endurance" | "Cardio" | "Mobility" | "Skill" | "Recovery"
  categories: string[]
}

interface WorkoutSessionProps {
  workout: Workout
  onComplete: (opts: { durationMinutes: number; notes: string }) => void | Promise<void>
  onExit: () => void
  onSaveChanges: (workoutId: string, updatedExercises: Exercise[]) => void | Promise<void>
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)
  const navFallbackTimeout = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const { restTimers, restActive, handleRestTimer, formatRestTime, parseRestTime } = useRestTimer()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      saveTimeouts.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
    }
  }, [saveTimeouts])

  useEffect(() => {
    exercises.forEach((ex: ExerciseState) => {
      parseRestTime(ex.restTime)
    })
  }, [exercises, parseRestTime])

  // silence unused ref (kept for parity with prior session behavior)
  void navFallbackTimeout

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

  const saveExerciseImmediately = async (exerciseId: string) => {
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

    try {
      await Promise.resolve(onSaveChanges(workout.id, updatedExercises))
    } catch {
      toast({
        title: "Could not save exercise",
        description: "Check your connection and try again.",
        variant: "destructive",
      })
      return
    }

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

    const existingTimeout = saveTimeouts.get(exerciseId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const newTimeout = setTimeout(() => {
      void saveExerciseImmediately(exerciseId)
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

  const saveChangesToWorkout = async () => {
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

    await Promise.resolve(onSaveChanges(workout.id, updatedExercises))
  }

  const handleCompleteWithConfirm = async () => {
    setCompleting(true)
    try {
      await saveChangesToWorkout()

      const durationMinutes = Math.floor((currentTime - startTime) / 1000 / 60)
      const notes = `Completed ${exercises.length} exercises`

      await Promise.resolve(onComplete({ durationMinutes, notes }))

      setShowConfirm(false)
      setCompleting(false)
      toast({
        title: "Session complete",
        description: `Saved · ${durationMinutes} minutes.`,
        duration: 5000,
        variant: "default",
      })
      onExit()
    } catch (err) {
      setCompleting(false)
      toast({
        title: "Could not complete",
        description: "Failed to save progress. Please try again.",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
      {/* Sticky session header */}
      <div className="sticky top-14 md:top-16 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mb-2 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="flex items-center justify-between gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void saveChangesToWorkout()
              onExit()
            }}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Exit
          </Button>
          <p className="font-sans text-2xl sm:text-3xl tracking-tight text-foreground tabular-nums">
            {formatTime(currentTime - startTime)}
          </p>
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => setShowConfirm(true)}
                disabled={completedExercises === 0 || completing}
              >
                Complete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-popover border-border max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-2xl font-medium text-center">
                  Finish this session?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-muted-foreground">
                  Your progress and exercise details will be saved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  type="button"
                  onClick={() => void handleCompleteWithConfirm()}
                  disabled={completing}
                >
                  {completing ? "Saving…" : "Yes, finish"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground truncate">
            {workout.name}
          </h1>
          <p className="text-xs text-muted-foreground tracking-wide">
            {completedExercises} of {exercises.length} complete
          </p>
          <Progress value={progressPercentage} className="h-0.5 mt-2" />
        </div>
      </div>

      {/* Exercise journal rows */}
      <div className="divide-y divide-border/70 mt-4">
        {exercises.map((exercise: ExerciseState) => (
          <div
            key={exercise.id}
            className={cn(
              "py-6 transition-colors duration-300",
              exercise.completed && "opacity-70"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleExerciseComplete(exercise.id)}
                  className="mt-0.5 shrink-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                  aria-label={exercise.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {exercise.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-primary transition-transform duration-200" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </button>
                <div className="min-w-0 space-y-1">
                  <h2
                    className={cn(
                      "font-display text-xl font-normal tracking-tight",
                      exercise.completed ? "text-muted-foreground line-through decoration-border" : "text-foreground"
                    )}
                  >
                    {exercise.actualName || exercise.name}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      <span className="text-muted-foreground/70">Sets </span>
                      <span className="text-foreground">{exercise.sets}</span>
                    </span>
                    {(exercise.actualReps || exercise.reps) && (
                      <span>
                        <span className="text-muted-foreground/70">Reps </span>
                        <span className="text-foreground">{exercise.actualReps || exercise.reps}</span>
                      </span>
                    )}
                    {(exercise.actualWeight || exercise.weight) && (
                      <span>
                        <span className="text-muted-foreground/70">Weight </span>
                        <span className="text-foreground">{exercise.actualWeight || exercise.weight}</span>
                      </span>
                    )}
                  </div>
                  {(exercise.restTime || exercise.adjustment) && (
                    <p className="text-xs text-muted-foreground/70">
                      {[
                        exercise.restTime ? `Rest ${exercise.restTime}` : null,
                        exercise.adjustment ? `Position ${exercise.adjustment}` : null,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {savedChanges.has(exercise.id) && (
                  <span className="text-xs text-primary mr-1">Saved</span>
                )}
                {editingExercise === exercise.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void saveExerciseImmediately(exercise.id)
                        setEditingExercise(null)
                      }}
                      className="h-9 w-9 text-primary"
                      aria-label="Save edits"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
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
                      className="h-9 w-9 text-muted-foreground"
                      aria-label="Discard edits"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingExercise(exercise.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    aria-label="Edit exercise"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {editingExercise === exercise.id ? (
              <div className="mt-4 ml-9 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                    value={exercise.actualName || ""}
                    onChange={(e) => updateExercise(exercise.id, "actualName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Input
                    value={exercise.description || ""}
                    onChange={(e) => updateExercise(exercise.id, "description", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Reps</label>
                    <Input
                      value={exercise.actualReps || ""}
                      onChange={(e) => updateExercise(exercise.id, "actualReps", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Weight</label>
                    <Input
                      value={exercise.actualWeight || ""}
                      onChange={(e) => updateExercise(exercise.id, "actualWeight", e.target.value)}
                      placeholder="kg/lbs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Rest</label>
                    <Input
                      value={exercise.restTime || ""}
                      onChange={(e) => updateExercise(exercise.id, "restTime", e.target.value)}
                      placeholder="60s"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Position</label>
                    <Input
                      type="number"
                      value={exercise.adjustment || ""}
                      onChange={(e) => updateExercise(exercise.id, "adjustment", e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {exercise.description && (
                  <p className="mt-2 ml-9 text-sm text-muted-foreground leading-relaxed">
                    {exercise.description}
                  </p>
                )}
                {exercise.notes && (
                  <p className="mt-1 ml-9 text-sm text-muted-foreground/80">
                    {exercise.notes}
                  </p>
                )}
              </>
            )}

            <div className="mt-4 ml-9 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Rest timer</span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-sans text-lg tabular-nums tracking-tight min-w-[3.5rem] text-right",
                    restTimers[exercise.id] === 0 && restActive[exercise.id]
                      ? "text-destructive"
                      : "text-foreground"
                  )}
                >
                  {formatRestTime(restTimers[exercise.id] ?? parseRestTime(exercise.restTime))}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 min-w-[4.5rem] px-3"
                  onClick={() => handleRestTimer(exercise.id, exercise.restTime)}
                  type="button"
                  aria-label={restActive[exercise.id] ? "Reset rest timer" : "Start rest timer"}
                >
                  {restActive[exercise.id] ? "Reset" : "Start"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
