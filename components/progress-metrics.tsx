"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type WorkoutStats, type CategoryBreakdown, type StrengthTrend, type WorkoutHistory } from "@/lib/database"
import { weightUnit } from "@/lib/utils"

interface MuscleSetsPoint {
  muscle: string
  sets: number
}

interface WeekSessionsPoint {
  week: string
  sessions: number
}

interface ProgressMetricsProps {
  stats: WorkoutStats
  weeklySets: number
  weeklySetsByMuscle: MuscleSetsPoint[]
  monthlySetsByMuscle: MuscleSetsPoint[]
  monthlySessionsByWeek: WeekSessionsPoint[]
  strengthTrends: StrengthTrend[]
  recentSessions: WorkoutHistory[]
  categoryBreakdown: CategoryBreakdown[]
  loading?: boolean
}

function formatStrengthLoad(trend: StrengthTrend): string {
  const weight = trend.latestWeight?.trim()
  const reps = trend.latestReps?.trim()
  if (weight && reps) return `${weight} × ${reps}`
  if (weight) return weight
  if (reps) return `${reps} reps`
  return "No load logged"
}

function formatDelta(trend: StrengthTrend): string {
  if (trend.delta === "new") return "New"
  if (trend.delta === "unknown") return "—"
  if (trend.delta === "same") return "—"
  if (trend.deltaKg == null) return "—"

  const abs = Math.abs(trend.deltaKg)
  const formatted = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  const unit = weightUnit(trend.latestWeight || trend.previousWeight)
  const arrow = trend.delta === "up" ? "↑" : "↓"
  return `${arrow} ${formatted}${unit}`
}

function formatSessionDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d")
  } catch {
    return ""
  }
}

export function ProgressMetrics({
  stats,
  weeklySets,
  weeklySetsByMuscle,
  monthlySetsByMuscle,
  monthlySessionsByWeek,
  strengthTrends,
  recentSessions,
  categoryBreakdown,
  loading = false,
}: ProgressMetricsProps) {
  const [muscleRange, setMuscleRange] = useState<"week" | "month">("week")

  const topCategories = categoryBreakdown
    .filter((cat) => cat.completionCount > 0)
    .slice(0, 5)

  const muscleSetsData = muscleRange === "week" ? weeklySetsByMuscle : monthlySetsByMuscle

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
      {/* This week hero */}
      <section className="space-y-6">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
            This week
          </p>
          <p className="font-display text-7xl md:text-8xl font-normal tracking-tight text-foreground leading-none">
            {stats.thisWeekWorkouts}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {stats.thisWeekWorkouts === 1 ? "session" : "sessions"}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm border-t border-border/70 pt-6">
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.thisMonthWorkouts}</span>
            <span className="text-muted-foreground ml-1.5">this month</span>
          </div>
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.totalCompletions}</span>
            <span className="text-muted-foreground ml-1.5">lifetime</span>
          </div>
          <div>
            <span className="text-foreground font-medium tabular-nums">{weeklySets}</span>
            <span className="text-muted-foreground ml-1.5">sets this week</span>
          </div>
          <div>
            <span className="text-foreground font-medium tabular-nums">{stats.currentStreak}</span>
            <span className="text-muted-foreground ml-1.5">
              day{stats.currentStreak === 1 ? "" : "s"} streak
            </span>
          </div>
        </div>
      </section>

      {/* Sets by muscle group */}
      <section className="space-y-4 border-t border-border/70 pt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-normal text-foreground">
            Sets by muscle group
          </h2>
          <ToggleGroup
            type="single"
            value={muscleRange}
            onValueChange={(value) => {
              if (value === "week" || value === "month") setMuscleRange(value)
            }}
            variant="outline"
            size="sm"
            className="justify-end"
          >
            <ToggleGroupItem value="week" aria-label="Weekly view" className="px-3 text-xs">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Monthly view" className="px-3 text-xs">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {muscleSetsData.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Complete a session with categories to see sets by muscle group.
          </p>
        ) : (
          <ChartContainer
            config={{
              sets: {
                label: "Sets",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[220px] w-full aspect-auto"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={muscleSetsData}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
              >
                <XAxis
                  dataKey="muscle"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sets" fill="var(--color-sets)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </section>

      {/* Sessions by week */}
      <section className="space-y-4 border-t border-border/70 pt-10">
        <h2 className="font-display text-2xl font-normal text-foreground">Sessions by week</h2>
        <ChartContainer
          config={{
            sessions: {
              label: "Sessions",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[200px] w-full aspect-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySessionsByWeek}>
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="var(--color-sessions)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-sessions)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {/* Getting stronger */}
      <section className="space-y-4 border-t border-border/70 pt-10">
        <h2 className="font-display text-2xl font-normal text-foreground">Getting stronger</h2>
        {strengthTrends.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Log weight on exercises to see trends.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {strengthTrends.map((trend) => (
              <li
                key={`${trend.exerciseName}-${trend.completedAt}`}
                className="flex items-baseline justify-between py-3 gap-4"
              >
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">
                    {trend.exerciseName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                    {formatStrengthLoad(trend)}
                  </p>
                </div>
                <p
                  className={`text-sm tabular-nums shrink-0 ${
                    trend.delta === "up"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatDelta(trend)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Focus */}
      {topCategories.length > 0 && (
        <section className="space-y-4 border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl font-normal text-foreground">Focus</h2>
          <ul className="divide-y divide-border/60">
            {topCategories.map((category) => (
              <li
                key={category.category}
                className="flex items-baseline justify-between py-3 gap-4"
              >
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

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section className="space-y-4 border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl font-normal text-foreground">Recent sessions</h2>
          <ul className="divide-y divide-border/60">
            {recentSessions.map((session) => (
              <li
                key={session.id}
                className="flex items-baseline justify-between py-3 gap-4"
              >
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">
                    {session.workoutName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatSessionDate(session.completedAt)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground tabular-nums shrink-0">
                  {session.durationMinutes != null
                    ? `${session.durationMinutes} min`
                    : "—"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
