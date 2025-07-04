import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parses a rest time string like '60s', '1m', '90', '2min' into seconds
export function parseRestTime(rest: string | undefined): number {
  if (!rest) return 60;
  const trimmed = rest.trim().toLowerCase();
  if (trimmed.endsWith('s')) {
    return parseInt(trimmed.replace('s', '')) || 60;
  }
  if (trimmed.endsWith('m') || trimmed.endsWith('min')) {
    return (parseInt(trimmed) || 1) * 60;
  }
  const asNum = parseInt(trimmed);
  if (!isNaN(asNum)) return asNum;
  return 60;
}

// Calculates total workout duration in minutes (rounded)
export function calculateWorkoutDuration(exercises: { sets: number; restTime?: string }[]): number {
  let totalSeconds = 0;
  for (const ex of exercises) {
    const sets = ex.sets || 1;
    const rest = parseRestTime(ex.restTime);
    // Each set: 40s execution + rest (except after last set)
    totalSeconds += sets * 40 + sets * rest;
  }
  return Math.round(totalSeconds / 60);
}
