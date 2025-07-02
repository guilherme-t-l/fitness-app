import React from "react"
import { Exercise } from "@/hooks/useExercises"
import { ExerciseRow } from "./ExerciseRow"

interface ExerciseListProps {
  exercises: Exercise[]
  onUpdate: (id: string, field: keyof Exercise, value: Exercise[keyof Exercise]) => void
  onRemove: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

// Renders a list of exercises with controls
export function ExerciseList({ exercises, onUpdate, onRemove, onMoveUp, onMoveDown }: ExerciseListProps) {
  return (
    <div>
      {exercises.map((exercise, idx) => (
        <ExerciseRow
          key={exercise.id}
          exercise={exercise}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onMoveUp={() => onMoveUp(idx)}
          onMoveDown={() => onMoveDown(idx)}
          isFirst={idx === 0}
          isLast={idx === exercises.length - 1}
        />
      ))}
    </div>
  )
} 