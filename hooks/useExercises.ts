import { useState } from "react"

export interface Exercise {
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

// Custom hook for managing a list of exercises
export function useExercises(initial: Exercise[] = []) {
  const [exercises, setExercises] = useState<Exercise[]>(initial)

  // Add a new exercise
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

  // Update an exercise by id and field
  const updateExercise = <K extends keyof Exercise>(id: string, field: K, value: Exercise[K]) => {
    setExercises(exercises.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)))
  }

  // Remove an exercise by id
  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id))
  }

  // Move an exercise up in the list
  const moveExerciseUp = (index: number) => {
    if (index > 0) {
      const newExercises = [...exercises]
      ;[newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]]
      setExercises(newExercises)
    }
  }

  // Move an exercise down in the list
  const moveExerciseDown = (index: number) => {
    if (index < exercises.length - 1) {
      const newExercises = [...exercises]
      ;[newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]]
      setExercises(newExercises)
    }
  }

  // Reorder exercises by a new order of ids
  const handleReorder = (newOrder: string[]) => {
    setExercises((prev) => newOrder.map((id) => prev.find((ex) => ex.id === id)!))
  }

  return {
    exercises,
    setExercises,
    addExercise,
    updateExercise,
    removeExercise,
    moveExerciseUp,
    moveExerciseDown,
    handleReorder,
  }
} 