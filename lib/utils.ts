import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

/** Shared guest UUID — all unauthenticated users read/write this account. */
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract a numeric weight from strings like "70kg", "135 lbs", "70". */
export function parseWeight(weight: string | undefined | null): number | null {
  if (!weight) return null
  const match = weight.trim().match(/^(\d+(?:\.\d+)?)/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

/** Preserve unit suffix from a weight string when formatting deltas (e.g. "kg", " lbs"). */
export function weightUnit(weight: string | undefined | null): string {
  if (!weight) return ""
  const match = weight.trim().match(/^\d+(?:\.\d+)?\s*(.*)$/)
  const unit = match?.[1]?.trim()
  return unit ? (unit.startsWith(" ") ? unit : ` ${unit}`) : ""
}

// Parses a rest time string like '60s', '1m', '90', '2min' into seconds
export function parseRestTime(rest: string | undefined): number {
  if (!rest) return 60;
  const trimmed = rest.trim().toLowerCase();
  if (trimmed.endsWith('s')) {
    return parseInt(trimmed.replace('s', '')) || 60;
  }
  if (trimmed.endsWith('min')) {
    return (parseInt(trimmed, 10) || 1) * 60;
  }
  if (trimmed.endsWith('m')) {
    return (parseInt(trimmed, 10) || 1) * 60;
  }
  const asNum = parseInt(trimmed, 10);
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

export async function getCurrentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  // Anonymous sessions are treated as guests → shared DEFAULT_USER_ID
  if (session?.user?.id && !session.user.is_anonymous) {
    return session.user.id
  }
  return DEFAULT_USER_ID
}
