/**
 * Serializes delete-and-reinsert exercise batches per workout. Concurrent calls
 * (e.g. debounced field saves + "Complete workout") would otherwise interleave
 * and insert duplicate exercise rows.
 */
const chains = new Map<string, Promise<unknown>>()

export function runSerializedWorkoutExerciseWrite<T>(workoutId: string, task: () => Promise<T>): Promise<T> {
  const prev = chains.get(workoutId) ?? Promise.resolve()
  const next = prev.then(() => task())
  chains.set(workoutId, next.then(() => undefined, () => undefined))
  return next
}
