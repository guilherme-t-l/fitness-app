"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress as WorkoutProgress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, Award, Flame, BarChart3, Loader2 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useProgress } from "@/hooks/useProgress"
import { ProgressMetrics } from "@/components/progress-metrics"
import { useAuth } from '@/components/AuthProvider'

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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Progress Analytics
          </h1>
          <p className="text-gray-400">Track your fitness evolution</p>
        </div>

        {/* Loading state */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto" />
            <p className="text-gray-400">Loading your progress data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Progress Analytics
          </h1>
          <p className="text-gray-400">Track your fitness evolution</p>
        </div>

        {/* Error state */}
        <Card className="cyber-border bg-red-900/20 border-red-500/30">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Progress</div>
            <p className="text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Progress Analytics
        </h1>
        <p className="text-gray-400">Track your fitness evolution</p>
      </div>

      {/* Progress Metrics */}
      <ProgressMetrics
        stats={stats}
        categoryBreakdown={categoryBreakdown}
        weeklyGoal={weeklyGoal}
        monthlyGoal={monthlyGoal}
        weeklyProgress={weeklyProgress}
        monthlyProgress={monthlyProgress}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Weekly Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                workouts: {
                  label: "Workouts",
                  color: "hsl(var(--neon-cyan))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="workouts" fill="var(--color-workouts)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                workouts: {
                  label: "Workouts",
                  color: "hsl(var(--neon-purple))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workout Summary */}
      {stats.totalCompletions > 0 && (
        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Workout Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <div className="text-3xl font-bold text-white mb-2">{stats.totalCompletions}</div>
                <div className="text-gray-400">Total Workouts Completed</div>
                <div className="text-sm text-cyan-400 mt-1">Keep building your legacy</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <div className="text-3xl font-bold text-white mb-2">{stats.currentStreak}</div>
                <div className="text-gray-400">Current Streak</div>
                <div className="text-sm text-orange-400 mt-1">Days of consistency</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <div className="text-3xl font-bold text-white mb-2">{stats.thisMonthWorkouts}</div>
                <div className="text-gray-400">This Month</div>
                <div className="text-sm text-green-400 mt-1">Monthly progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalCompletions === 0 && (
        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <Target className="h-16 w-16 text-gray-600 mx-auto" />
              <h3 className="text-xl font-semibold text-white">No Workouts Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Complete your first workout to start tracking your progress and building your fitness legacy.
              </p>
              <div className="pt-4">
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  Start your journey today
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
