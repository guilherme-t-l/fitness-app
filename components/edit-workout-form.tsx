"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Save, ChevronUp, ChevronDown, GripVertical } from "lucide-react"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { ExerciseDndWrapper } from "@/components/ui/exercise-dnd-wrapper"
import { calculateWorkoutDuration } from "@/lib/utils"
import { useExercises } from "@/hooks/useExercises"
import { ExerciseList } from "@/components/exercise/ExerciseList"

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
  createdAt: string
  lastCompleted?: string
  completions: number
}

interface EditWorkoutFormProps {
  workout: Workout
  onSubmit: (workout: Omit<Workout, "id" | "createdAt" | "completions">) => void
}

const exerciseLibrary = [
  "Push-ups",
  "Pull-ups",
  "Squats",
  "Deadlifts",
  "Bench Press",
  "Overhead Press",
  "Rows",
  "Lunges",
  "Planks",
  "Burpees",
  "Mountain Climbers",
  "Jumping Jacks",
  "Bicep Curls",
  "Tricep Dips",
  "Leg Press",
  "Lat Pulldowns",
  "Shoulder Press",
  "Chest Flyes",
  "Leg Curls",
  "Calf Raises",
  "Dips",
  "Face Pulls",
  "Hip Thrusts",
  "Russian Twists",
  "Plank Variations",
]

export function EditWorkoutForm({ workout, onSubmit }: EditWorkoutFormProps) {
  const [workoutName, setWorkoutName] = useState(workout.name)
  const [workoutDescription, setWorkoutDescription] = useState(workout.description)
  const [workoutType, setWorkoutType] = useState<"Strength" | "Hypertrophy" | "Endurance" | "Cardio" | "Mobility" | "Skill" | "Recovery">(workout.workoutType)
  const [categories, setCategories] = useState<string[]>(workout.categories)
  const [estimatedDuration, setEstimatedDuration] = useState(workout.estimatedDuration)
  const [durationManuallyEdited, setDurationManuallyEdited] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>(workout.exercises)

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: 3,
      reps: "10",
      restTime: "60s",
    }
    setExercises([...exercises, newExercise])
  }

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)))
  }

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id))
  }

  const moveExerciseUp = (index: number) => {
    if (index > 0) {
      const newExercises = [...exercises]
      ;[newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]]
      setExercises(newExercises)
    }
  }

  const moveExerciseDown = (index: number) => {
    if (index < exercises.length - 1) {
      const newExercises = [...exercises]
      ;[newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]]
      setExercises(newExercises)
    }
  }

  const handleReorder = (newOrder: string[]) => {
    setExercises((prev) => newOrder.map((id) => prev.find((ex) => ex.id === id)!))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workoutName || exercises.length === 0) return

    const updatedWorkout = {
      name: workoutName,
      description: workoutDescription,
      exercises: exercises.filter((ex) => ex.name),
      estimatedDuration,
      workoutType,
      categories,
      lastCompleted: workout.lastCompleted,
    }

    onSubmit(updatedWorkout)
  }

  useEffect(() => {
    if (!durationManuallyEdited) {
      const min = calculateWorkoutDuration(exercises)
      setEstimatedDuration(min ? `${min} min` : "")
    }
  }, [exercises, durationManuallyEdited])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workout-name" className="text-gray-300">
            Workout Name
          </Label>
          <Input
            id="workout-name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Upper Body Strength"
            className="bg-gray-800/50 border-gray-600 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-gray-300">
            Estimated Duration
          </Label>
          <Input
            id="duration"
            value={estimatedDuration}
            onChange={(e) => {
              setEstimatedDuration(e.target.value)
              setDurationManuallyEdited(true)
            }}
            placeholder="e.g., 45 min"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Workout Type</Label>
          <Select value={workoutType} onValueChange={(value: any) => setWorkoutType(value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Strength">Strength</SelectItem>
              <SelectItem value="Hypertrophy">Hypertrophy</SelectItem>
              <SelectItem value="Endurance">Endurance</SelectItem>
              <SelectItem value="Cardio">Cardio</SelectItem>
              <SelectItem value="Mobility">Mobility</SelectItem>
              <SelectItem value="Skill">Skill</SelectItem>
              <SelectItem value="Recovery">Recovery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-300">
            Categories
          </Label>
          <Input
            id="category"
            value={categories.join(", ")}
            onChange={(e) => setCategories(e.target.value.split(", ").filter(c => c.trim()))}
            placeholder="e.g., Upper Body, Push, Core"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={workoutDescription}
          onChange={(e) => setWorkoutDescription(e.target.value)}
          placeholder="Describe your workout..."
          className="bg-gray-800/50 border-gray-600 text-white"
        />
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Exercises ({exercises.length})</h3>
          <Button type="button" onClick={addExercise} size="sm" className="primary-glow">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        <ExerciseDndWrapper
          items={exercises.map((ex) => ({ id: ex.id, name: ex.name }))}
          onReorder={handleReorder}
        >
          {({ id, name, attributes, listeners, isDragging }) => {
            const exercise = exercises.find((ex) => ex.id === id)!
            return (
              <Card key={exercise.id} className={`bg-gray-800/30 border-gray-700 ${isDragging ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" {...listeners} />
                      <h4 className="text-white font-medium">{exercise.name ? exercise.name : 'New Exercise'}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveExerciseUp(exercises.findIndex((ex) => ex.id === id))}
                        disabled={exercises.findIndex((ex) => ex.id === id) === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveExerciseDown(exercises.findIndex((ex) => ex.id === id))}
                        disabled={exercises.findIndex((ex) => ex.id === id) === exercises.length - 1}
                        className="text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeExercise(exercise.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-gray-300 text-sm">Exercise</Label>
                      <AutocompleteInput
                        value={exercise.name}
                        onChange={(value) => updateExercise(exercise.id, "name", value)}
                        placeholder="Type exercise name..."
                        suggestions={exerciseLibrary}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, "sets", Number.parseInt(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Reps</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                        placeholder="10-12"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Weight</Label>
                      <Input
                        value={exercise.weight || ""}
                        onChange={(e) => updateExercise(exercise.id, "weight", e.target.value)}
                        placeholder="kg/lbs"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Rest Time</Label>
                      <Input
                        value={exercise.restTime || ""}
                        onChange={(e) => updateExercise(exercise.id, "restTime", e.target.value)}
                        placeholder="60s"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-gray-300 text-sm">Machine Position</Label>
                      <Input
                        type="number"
                        value={exercise.adjustment || ""}
                        onChange={(e) => updateExercise(exercise.id, "adjustment", e.target.value)}
                        placeholder="e.g., 5, 12"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Notes</Label>
                      <Input
                        value={exercise.description || ""}
                        onChange={(e) => updateExercise(exercise.id, "description", e.target.value)}
                        placeholder="Optional notes, such as a brief exercise description"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }}
        </ExerciseDndWrapper>

        {exercises.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No exercises added yet</p>
            <p className="text-sm">Click "Add Exercise" to get started</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          className="primary-glow text-white font-semibold"
          disabled={!workoutName || exercises.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
