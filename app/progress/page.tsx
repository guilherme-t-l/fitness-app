"use client"

import { Loader2 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useProgress } from "@/hooks/useProgress"
import { ProgressMetrics } from "@/components/progress-metrics"
import { useAuth } from '@/components/AuthProvider'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProgressPage() {
  const { user } = useAuth()
  const {
    stats,
    categoryBreakdown,
    weeklyGoal,
    monthlyGoal,
    weeklyProgress,
    monthlyProgress,
    weeklyActivity,
    monthlyTrend,
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

      <ProgressMetrics
        stats={stats}
        categoryBreakdown={categoryBreakdown}
        weeklyGoal={weeklyGoal}
        monthlyGoal={monthlyGoal}
        weeklyProgress={weeklyProgress}
        monthlyProgress={monthlyProgress}
      />

      {stats.totalCompletions > 0 && (
        <section className="space-y-10 border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl font-normal text-foreground">Activity</h2>
          <div className="space-y-12">
            <div>
              <p className="text-sm text-muted-foreground mb-4">This week</p>
              <ChartContainer
                config={{
                  workouts: {
                    label: "Sessions",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4">Monthly trend</p>
              <ChartContainer
                config={{
                  workouts: {
                    label: "Sessions",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </section>
      )}

      {stats.totalCompletions === 0 && (
        <section className="border-t border-border/70 pt-12 text-center space-y-4">
          <p className="font-display text-2xl text-foreground">Nothing logged yet</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Complete a session and it will appear here — a calm trail of consistency.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/workouts">Go to workouts</Link>
          </Button>
        </section>
      )}
    </div>
  )
}
