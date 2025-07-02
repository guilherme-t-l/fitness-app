"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Edit2, X, Clock, ArrowLeft, Check } from "lucide-react"
import type React from "react"
import type { SetStateAction } from "react"
import { useTimer } from "@/hooks/useTimer"
import { useAutoSave } from "@/hooks/useAutoSave"

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

  const handleCompleteWorkout = () => {
    saveChangesToWorkout()
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            saveChangesToWorkout()
            onExit()
          }}
          className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Workout
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(currentTime - startTime)}</span>
            </span>
            <Badge className="bg-green-500/20 text-green-400">
              {completedExercises}/{exercises.length} completed
            </Badge>
          </div>
        </div>
        <Button
          onClick={handleCompleteWorkout}
          className="primary-glow text-white font-semibold"
          disabled={completedExercises === 0}
        >
          Complete Workout
        </Button>
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

              <div className="flex items-center space-x-2">
                {exercise.completed && <Badge className="bg-green-500/20 text-green-400">✓ Completed</Badge>}
                {savedChanges.has(exercise.id) && (
                  <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">✓ Saved</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
