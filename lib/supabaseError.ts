/** Supabase PostgREST errors are plain objects with `message`, not Error instances. */
export function getSupabaseErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message
  }
  if (typeof err === "string") return err
  return "Request failed"
}
