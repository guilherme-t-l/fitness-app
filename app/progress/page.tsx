"use client"

import { Loader2 } from "lucide-react"
import { useProgress } from "@/hooks/useProgress"
import { ProgressMetrics } from "@/components/progress-metrics"
import { useAuth } from '@/components/AuthProvider'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProgressPage() {
  const { user } = useAuth()
  const {
    stats,
    weeklySets,
    strengthTrends,
    recentSessions,
    weeklySetsByMuscle,
    monthlySetsByMuscle,
    monthlySessionsByWeek,
    loading,
    error
  } = useProgress(user?.id)

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm">Gathering your progress…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-14">
        <header className="space-y-3 mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight">Progress</h1>
        </header>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-14 space-y-14">
      <header className="space-y-3 animate-fade-rise">
        <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground">
          Progress
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md">
          How you’ve been training lately.
        </p>
      </header>

      {stats.totalCompletions === 0 ? (
        <section className="border-t border-border/70 pt-12 text-center space-y-4">
          <p className="font-display text-2xl text-foreground">Nothing logged yet</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Complete a session and it will appear here — a calm trail of consistency.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/workouts">Go to workouts</Link>
          </Button>
        </section>
      ) : (
        <ProgressMetrics
          stats={stats}
          weeklySets={weeklySets}
          weeklySetsByMuscle={weeklySetsByMuscle}
          monthlySetsByMuscle={monthlySetsByMuscle}
          monthlySessionsByWeek={monthlySessionsByWeek}
          strengthTrends={strengthTrends}
          recentSessions={recentSessions}
        />
      )}
    </div>
  )
}
