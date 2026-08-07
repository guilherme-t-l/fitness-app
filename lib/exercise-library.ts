export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

const MUSCLE_SET = new Set<string>(MUSCLE_GROUPS)

/** Autocomplete suggestions (display names). */
export const EXERCISE_SUGGESTIONS = [
  'Push-ups',
  'Pull-ups',
  'Squats',
  'Deadlifts',
  'Bench Press',
  'Overhead Press',
  'Rows',
  'Lunges',
  'Planks',
  'Burpees',
  'Mountain Climbers',
  'Jumping Jacks',
  'Bicep Curls',
  'Tricep Dips',
  'Leg Press',
  'Lat Pulldowns',
  'Shoulder Press',
  'Chest Flyes',
  'Leg Curls',
  'Calf Raises',
  'Dips',
  'Face Pulls',
  'Hip Thrusts',
  'Russian Twists',
  'Plank Variations',
] as const

/** Alias → muscles. Longer aliases are preferred when several match. */
// Primary / major muscles only. Skip minor synergists (e.g. triceps on bench, biceps on rows).
// Multi-tag only when several groups are a real focus (squat, deadlift, lunge, leg press).
const ALIAS_MUSCLES: { alias: string; muscles: MuscleGroup[] }[] = ([
  // Chest (presses: Chest only — triceps are minor)
  { alias: 'bench press', muscles: ['Chest'] },
  { alias: 'chest flyes', muscles: ['Chest'] },
  { alias: 'chest fly', muscles: ['Chest'] },
  { alias: 'supino reto', muscles: ['Chest'] },
  { alias: 'supino inclinado', muscles: ['Chest'] },
  { alias: 'supino declinado', muscles: ['Chest'] },
  { alias: 'supino', muscles: ['Chest'] },
  { alias: 'crucifixo', muscles: ['Chest'] },
  { alias: 'peck deck', muscles: ['Chest'] },
  { alias: 'push-ups', muscles: ['Chest'] },
  { alias: 'push ups', muscles: ['Chest'] },
  { alias: 'pushup', muscles: ['Chest'] },
  { alias: 'flexao', muscles: ['Chest'] },
  { alias: 'flexao de braco', muscles: ['Chest'] },
  { alias: 'bench', muscles: ['Chest'] },

  // Back (pulls/rows: Back only — biceps are minor)
  { alias: 'lat pulldowns', muscles: ['Back'] },
  { alias: 'lat pulldown', muscles: ['Back'] },
  { alias: 'pull-ups', muscles: ['Back'] },
  { alias: 'pull ups', muscles: ['Back'] },
  { alias: 'pullup', muscles: ['Back'] },
  { alias: 'barra fixa', muscles: ['Back'] },
  { alias: 'puxada', muscles: ['Back'] },
  { alias: 'pulldown', muscles: ['Back'] },
  { alias: 'deadlifts', muscles: ['Back', 'Hamstrings', 'Glutes'] },
  { alias: 'deadlift', muscles: ['Back', 'Hamstrings', 'Glutes'] },
  { alias: 'levantamento terra', muscles: ['Back', 'Hamstrings', 'Glutes'] },
  { alias: 'face pulls', muscles: ['Shoulders'] },
  { alias: 'face pull', muscles: ['Shoulders'] },
  { alias: 'remada', muscles: ['Back'] },
  { alias: 'rows', muscles: ['Back'] },
  { alias: 'row', muscles: ['Back'] },

  // Shoulders (presses: Shoulders only — triceps are minor)
  { alias: 'overhead press', muscles: ['Shoulders'] },
  { alias: 'shoulder press', muscles: ['Shoulders'] },
  { alias: 'military press', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento', muscles: ['Shoulders'] },
  { alias: 'elevacao lateral', muscles: ['Shoulders'] },
  { alias: 'lateral raise', muscles: ['Shoulders'] },
  { alias: 'elevacao frontal', muscles: ['Shoulders'] },
  { alias: 'front raise', muscles: ['Shoulders'] },

  // Arms
  { alias: 'bicep curls', muscles: ['Biceps'] },
  { alias: 'bicep curl', muscles: ['Biceps'] },
  { alias: 'biceps curl', muscles: ['Biceps'] },
  { alias: 'rosca direta', muscles: ['Biceps'] },
  { alias: 'rosca', muscles: ['Biceps'] },
  { alias: 'tricep dips', muscles: ['Triceps'] },
  { alias: 'tricep dip', muscles: ['Triceps'] },
  { alias: 'triceps dip', muscles: ['Triceps'] },
  { alias: 'triceps', muscles: ['Triceps'] },
  { alias: 'tricep', muscles: ['Triceps'] },
  { alias: 'mergulho', muscles: ['Triceps'] },
  { alias: 'dips', muscles: ['Triceps'] },
  { alias: 'dip', muscles: ['Triceps'] },

  // Legs — multi only when several groups are a real focus
  { alias: 'leg press', muscles: ['Quads', 'Glutes'] },
  { alias: 'leg curls', muscles: ['Hamstrings'] },
  { alias: 'leg curl', muscles: ['Hamstrings'] },
  { alias: 'mesa flexora', muscles: ['Hamstrings'] },
  { alias: 'cadeira extensora', muscles: ['Quads'] },
  { alias: 'leg extension', muscles: ['Quads'] },
  { alias: 'hip thrusts', muscles: ['Glutes'] },
  { alias: 'hip thrust', muscles: ['Glutes'] },
  { alias: 'elevacao pelvica', muscles: ['Glutes'] },
  { alias: 'calf raises', muscles: ['Calves'] },
  { alias: 'calf raise', muscles: ['Calves'] },
  { alias: 'panturrilha', muscles: ['Calves'] },
  { alias: 'agachamento', muscles: ['Quads', 'Glutes'] },
  { alias: 'squats', muscles: ['Quads', 'Glutes'] },
  { alias: 'squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'lunges', muscles: ['Quads', 'Glutes'] },
  { alias: 'lunge', muscles: ['Quads', 'Glutes'] },
  { alias: 'afundo', muscles: ['Quads', 'Glutes'] },

  // Abs
  { alias: 'russian twists', muscles: ['Abs'] },
  { alias: 'russian twist', muscles: ['Abs'] },
  { alias: 'plank variations', muscles: ['Abs'] },
  { alias: 'mountain climbers', muscles: ['Abs'] },
  { alias: 'mountain climber', muscles: ['Abs'] },
  { alias: 'jumping jacks', muscles: ['Calves'] },
  { alias: 'burpees', muscles: ['Abs'] },
  { alias: 'burpee', muscles: ['Abs'] },
  { alias: 'planks', muscles: ['Abs'] },
  { alias: 'plank', muscles: ['Abs'] },
  { alias: 'prancha', muscles: ['Abs'] },
  { alias: 'abdominal', muscles: ['Abs'] },
  { alias: 'crunch', muscles: ['Abs'] },
  { alias: 'abs', muscles: ['Abs'] },
] as { alias: string; muscles: MuscleGroup[] }[]).sort((a, b) => b.alias.length - a.alias.length)

export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
}

export function parseMuscleGroups(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && MUSCLE_SET.has(item))
}

export function filterWorkoutMuscles(categories: string[]): string[] {
  return categories.filter((category) => MUSCLE_SET.has(category))
}

/** Match alias dictionary; longest whole-phrase alias wins. */
export function matchAliasMuscles(normalizedName: string): string[] | null {
  if (!normalizedName) return null

  for (const { alias, muscles } of ALIAS_MUSCLES) {
    if (normalizedName === alias) return [...muscles]
    // Whole phrase/word boundary match
    const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(alias)}(?:\\s|$)`)
    if (pattern.test(normalizedName)) return [...muscles]
  }

  return null
}

export function resolveMuscleGroups(
  name: string,
  options: {
    historyByName?: Map<string, string[]>
    workoutCategories?: string[]
  } = {}
): string[] {
  const normalized = normalizeExerciseName(name)
  if (!normalized) return []

  const fromHistory = options.historyByName?.get(normalized)
  if (fromHistory && fromHistory.length > 0) {
    return parseMuscleGroups(fromHistory)
  }

  const fromAlias = matchAliasMuscles(normalized)
  if (fromAlias && fromAlias.length > 0) return fromAlias

  const fromWorkout = filterWorkoutMuscles(options.workoutCategories || [])
  if (fromWorkout.length > 0) return fromWorkout

  return []
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
