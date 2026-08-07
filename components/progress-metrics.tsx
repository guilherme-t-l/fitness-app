"use client"

import { Progress } from "@/components/ui/progress"
import { type WorkoutStats, type CategoryBreakdown } from "@/lib/database"

interface ProgressMetricsProps {
  stats: WorkoutStats
  categoryBreakdown: CategoryBreakdown[]
  weeklyGoal: number
  monthlyGoal: number
  weeklyProgress: number
  monthlyProgress: number
  loading?: boolean
}

export function ProgressMetrics({ 
  stats, 
  categoryBreakdown, 
  weeklyGoal, 
  monthlyGoal, 
  weeklyProgress, 
  monthlyProgress,
  loading = false 
}: ProgressMetricsProps) {
  const topCategories = categoryBreakdown
    .filter(cat => cat.completionCount > 0)
    .slice(0, 5)

  const achievements = [
    stats.totalCompletions >= 1 && {
      title: "First session",
      detail: "Completed your first workout",
    },
    stats.thisWeekWorkouts >= 5 && {
      title: "Week of motion",
      detail: "Five or more sessions this week",
    },
    stats.currentStreak >= 7 && {
      title: "Consistency",
      detail: "A streak of seven days or more",
    },
  ].filter(Boolean) as { title: string; detail: string }[]

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-24 bg-muted/60 rounded-md max-w-xs" />
        <div className="h-16 bg-muted/40 rounded-md" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero streak + supporting totals */}
      <section className="space-y-6">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Current streak</p>
          <p className="font-display text-7xl md:text-8xl font-normal tracking-tight text-foreground leading-none">
            {stats.currentStreak}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {stats.currentStreak === 1 ? "day" : "days"} of returning
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm border-t border-border/70 pt-6">
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.thisWeekWorkouts}</span>
            <span className="text-muted-foreground ml-1.5">this week</span>
          </div>
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.thisMonthWorkouts}</span>
            <span className="text-muted-foreground ml-1.5">this month</span>
          </div>
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.totalCompletions}</span>
            <span className="text-muted-foreground ml-1.5">lifetime</span>
          </div>
        </div>
      </section>

      {/* Goals — tonal, not card-stacked */}
      <section className="space-y-6 border-t border-border/70 pt-10">
        <h2 className="font-display text-2xl font-normal text-foreground">Goals</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Week</span>
              <span className="text-foreground tabular-nums">
                {stats.thisWeekWorkouts} / {weeklyGoal}
              </span>
            </div>
            <Progress value={weeklyProgress} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Month</span>
              <span className="text-foreground tabular-nums">
                {stats.thisMonthWorkouts} / {monthlyGoal}
              </span>
            </div>
            <Progress value={monthlyProgress} />
          </div>
        </div>
      </section>

      {/* Categories */}
      {topCategories.length > 0 && (
        <section className="space-y-4 border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl font-normal text-foreground">Focus</h2>
          <ul className="divide-y divide-border/60">
            {topCategories.map((category) => (
              <li key={category.category} className="flex items-baseline justify-between py-3 gap-4">
                <div>
                  <p className="text-foreground text-sm font-medium">{category.category}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.workoutCount} routine{category.workoutCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground tabular-nums shrink-0">
                  {category.completionCount} done
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements — earned only */}
      {achievements.length > 0 && (
        <section className="space-y-4 border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl font-normal text-foreground">Milestones</h2>
          <ul className="space-y-4">
            {achievements.map((a) => (
              <li key={a.title}>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
