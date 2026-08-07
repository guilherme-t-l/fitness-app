"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Legacy route — create flow lives on /workouts. */
export default function CreateRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/workouts?create=1")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
      Redirecting to workouts…
    </div>
  )
}
