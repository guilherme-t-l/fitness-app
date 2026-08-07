"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, ChevronUp, ChevronDown, GripVertical } from "lucide-react"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { ExerciseDndWrapper } from "@/components/ui/exercise-dnd-wrapper"
import { MultiSelect } from "@/components/ui/multi-select"
import { MuscleGroupChips } from "@/components/exercise/MuscleGroupChips"
import { calculateWorkoutDuration } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider'
import { cn } from "@/lib/utils"
import { EXERCISE_SUGGESTIONS, resolveMuscleGroups } from "@/lib/exercise-library"
import { databaseService } from "@/lib/database"

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
  muscleGroups?: string[]
}

interface Workout {
  name: string
  description: string
  exercises: Exercise[]
  estimatedDuration: string
  workoutType: "Strength" | "Hypertrophy" | "Endurance" | "Cardio" | "Mobility" | "Skill" | "Recovery"
  categories: string[]
}

interface CreateWorkoutFormProps {
  onSubmit: (workout: Workout) => void
}

export function CreateWorkoutForm({ onSubmit }: CreateWorkoutFormProps) {
  const { user } = useAuth()
  const [workoutName, setWorkoutName] = useState("")
  const [workoutDescription, setWorkoutDescription] = useState("")
  const [workoutType, setWorkoutType] = useState<"Strength" | "Hypertrophy" | "Endurance" | "Cardio" | "Mobility" | "Skill" | "Recovery">("Strength")
  const [categories, setCategories] = useState<string[]>([])
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [durationManuallyEdited, setDurationManuallyEdited] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscleHistory, setMuscleHistory] = useState<Map<string, string[]>>(new Map())
  const manualMuscleOverrides = useRef(new Set<string>())
  const nameResolveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { categories: availableCategories, loading: categoriesLoading, saveNewCategory, deleteCategory } = useCategories(user?.id)

  useEffect(() => {
    let cancelled = false
    databaseService.getUserExerciseMuscleHistory(user?.id).then((history) => {
      if (!cancelled) setMuscleHistory(history)
    })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    return () => {
      nameResolveTimers.current.forEach((timer) => clearTimeout(timer))
      nameResolveTimers.current.clear()
    }
  }, [])

  const handleNewCategory = async (newCategory: string) => {
    await saveNewCategory(newCategory)
  }

  const handleDeleteCategory = async (category: string) => {
    await deleteCategory(category)
  }

  const applyResolvedMuscles = useCallback((id: string, name: string, workoutCats: string[]) => {
    if (manualMuscleOverrides.current.has(id)) return
    const muscles = resolveMuscleGroups(name, {
      historyByName: muscleHistory,
      workoutCategories: workoutCats,
    })
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id ? { ...exercise, muscleGroups: muscles } : exercise
      )
    )
  }, [muscleHistory])

  const handleExerciseNameChange = (id: string, value: string) => {
    manualMuscleOverrides.current.delete(id)
    setExercises((prev) =>
      prev.map((exercise) => (exercise.id === id ? { ...exercise, name: value } : exercise))
    )
    const existing = nameResolveTimers.current.get(id)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      applyResolvedMuscles(id, value, categories)
      nameResolveTimers.current.delete(id)
    }, 300)
    nameResolveTimers.current.set(id, timer)
  }

  const handleMuscleGroupsChange = (id: string, muscles: string[]) => {
    manualMuscleOverrides.current.add(id)
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id ? { ...exercise, muscleGroups: muscles } : exercise
      )
    )
  }

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: 3,
      reps: "10",
      restTime: "60s",
      muscleGroups: [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workoutName || exercises.length === 0) return
    setFormError(null);
    setSaving(true);
    try {
      const workout: Workout = {
        name: workoutName,
        description: workoutDescription,
        exercises: exercises.filter((ex) => ex.name),
        estimatedDuration,
        workoutType,
        categories,
      }

      await onSubmit(workout)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create workout');
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create workout',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!durationManuallyEdited) {
      const min = calculateWorkoutDuration(exercises)
      setEstimatedDuration(min ? `${min} min` : "")
    }
  }, [exercises, durationManuallyEdited])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="workout-name">Name</Label>
          <Input
            id="workout-name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Upper Body"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={estimatedDuration}
            onChange={(e) => {
              setEstimatedDuration(e.target.value)
              setDurationManuallyEdited(true)
            }}
            placeholder="e.g., 45 min"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={workoutType} onValueChange={(value: any) => setWorkoutType(value)}>
            <SelectTrigger>
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
          <Label htmlFor="category">Categories</Label>
          <MultiSelect
            options={availableCategories}
            selected={categories}
            onChange={setCategories}
            onNewOption={handleNewCategory}
            onDeleteOption={handleDeleteCategory}
            placeholder="Select or create…"
            searchPlaceholder="Search categories…"
            emptyText="No categories found. Type to create a new one."
            disabled={categoriesLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={workoutDescription}
          onChange={(e) => setWorkoutDescription(e.target.value)}
          placeholder="Optional notes about this routine…"
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-t border-border/70 pt-6">
          <h3 className="font-display text-xl font-normal text-foreground">
            Exercises <span className="text-muted-foreground text-base">({exercises.length})</span>
          </h3>
          <Button type="button" onClick={addExercise} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <ExerciseDndWrapper
          items={exercises.map((ex) => ({ id: ex.id, name: ex.name }))}
          onReorder={handleReorder}
        >
          {({ id, listeners, isDragging }) => {
            const exercise = exercises.find((ex) => ex.id === id)!
            const index = exercises.findIndex((ex) => ex.id === id)
            return (
              <div
                key={exercise.id}
                className={cn(
                  "border-b border-border/60 py-5 last:border-b-0",
                  isDragging && "bg-muted/50 rounded-md ring-1 ring-border"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button type="button" className="text-muted-foreground cursor-grab touch-none p-1" {...listeners} aria-label="Drag to reorder">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-foreground">
                      {exercise.name || "New exercise"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExerciseUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExerciseDown(index)}
                      disabled={index === exercises.length - 1}
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(exercise.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pl-7">
                  <div>
                    <Label className="text-xs text-muted-foreground">Exercise</Label>
                    <AutocompleteInput
                      value={exercise.name}
                      onChange={(value) => handleExerciseNameChange(exercise.id, value)}
                      placeholder="Type exercise name…"
                      suggestions={[...EXERCISE_SUGGESTIONS]}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Muscles</Label>
                    <MuscleGroupChips
                      selected={exercise.muscleGroups || []}
                      onChange={(muscles) => handleMuscleGroupsChange(exercise.id, muscles)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, "sets", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Reps</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                        placeholder="10-12"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Weight</Label>
                      <Input
                        value={exercise.weight || ""}
                        onChange={(e) => updateExercise(exercise.id, "weight", e.target.value)}
                        placeholder="kg/lbs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Rest</Label>
                      <Input
                        value={exercise.restTime || ""}
                        onChange={(e) => updateExercise(exercise.id, "restTime", e.target.value)}
                        placeholder="60s"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Machine position</Label>
                      <Input
                        type="number"
                        value={exercise.adjustment || ""}
                        onChange={(e) => updateExercise(exercise.id, "adjustment", e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <Input
                        value={exercise.description || ""}
                        onChange={(e) => updateExercise(exercise.id, "description", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        </ExerciseDndWrapper>

        {exercises.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">No exercises yet</p>
            <p className="text-xs mt-1">Add one to begin shaping this routine.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-border/70">
        <Button
          type="submit"
          disabled={!workoutName || exercises.length === 0 || saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving…' : 'Create workout'}
        </Button>
      </div>
      {formError && <div className="text-destructive text-sm">{formError}</div>}
    </form>
  )
}
