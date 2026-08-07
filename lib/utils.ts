import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

/** Shared guest UUID — all unauthenticated users read/write this account. */
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"

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
