import React from "react"
import { Exercise } from "@/hooks/useExercises"

interface ExerciseRowProps {
  exercise: Exercise
  onUpdate: (id: string, field: keyof Exercise, value: Exercise[keyof Exercise]) => void
  onRemove: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

// Renders a single exercise row with controls
export function ExerciseRow({ exercise, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: ExerciseRowProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        className="bg-gray-800/50 border-gray-600 text-white px-2 py-1 rounded"
        value={exercise.name}
        onChange={e => onUpdate(exercise.id, "name", e.target.value)}
        placeholder="Exercise name"
      />
      <input
        className="bg-gray-800/50 border-gray-600 text-white px-2 py-1 rounded w-16"
        value={exercise.sets}
        type="number"
        min={1}
        onChange={e => onUpdate(exercise.id, "sets", Number(e.target.value))}
        placeholder="Sets"
      />
      <input
        className="bg-gray-800/50 border-gray-600 text-white px-2 py-1 rounded w-16"
        value={exercise.reps}
        onChange={e => onUpdate(exercise.id, "reps", e.target.value)}
        placeholder="Reps"
      />
      <button onClick={onMoveUp} disabled={isFirst} className="px-2">↑</button>
      <button onClick={onMoveDown} disabled={isLast} className="px-2">↓</button>
      <button onClick={() => onRemove(exercise.id)} className="px-2 text-red-500">✕</button>
    </div>
  )
} 