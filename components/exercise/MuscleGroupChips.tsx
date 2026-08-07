"use client"

import { MUSCLE_GROUPS } from "@/lib/exercise-library"
import { cn } from "@/lib/utils"

interface MuscleGroupChipsProps {
  selected: string[]
  onChange: (muscles: string[]) => void
  className?: string
}

export function MuscleGroupChips({ selected, onChange, className }: MuscleGroupChipsProps) {
  const toggle = (muscle: string) => {
    if (selected.includes(muscle)) {
      onChange(selected.filter((item) => item !== muscle))
    } else {
      onChange([...selected, muscle])
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {MUSCLE_GROUPS.map((muscle) => {
        const isSelected = selected.includes(muscle)
        return (
          <button
            key={muscle}
            type="button"
            onClick={() => toggle(muscle)}
            className={cn(
              "min-h-9 px-2.5 text-xs tracking-wide transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-pressed={isSelected}
          >
            {muscle}
          </button>
        )
      })}
    </div>
  )
}
