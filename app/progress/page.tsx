"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress as WorkoutProgress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, Award, Flame, BarChart3 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"

const weeklyData = [
  { day: "Mon", workouts: 1, duration: 45 },
  { day: "Tue", workouts: 0, duration: 0 },
  { day: "Wed", workouts: 1, duration: 30 },
  { day: "Thu", workouts: 1, duration: 50 },
  { day: "Fri", workouts: 0, duration: 0 },
  { day: "Sat", workouts: 1, duration: 60 },
  { day: "Sun", workouts: 1, duration: 40 },
]

const monthlyProgress = [
  { month: "Oct", workouts: 16, avgDuration: 42 },
  { month: "Nov", workouts: 20, avgDuration: 45 },
  { month: "Dec", workouts: 18, avgDuration: 48 },
  { month: "Jan", workouts: 22, avgDuration: 50 },
]

export default function ProgressPage() {
  const currentStreak = 12
  const totalWorkouts = 89
  const thisWeekWorkouts = 5
  const weeklyGoal = 6
  const monthlyGoal = 24
  const thisMonthWorkouts = 18

  const achievements = [
    { name: "First Workout", description: "Completed your first workout", earned: true },
    { name: "Week Warrior", description: "Complete 7 workouts in a week", earned: true },
    { name: "Consistency King", description: "Maintain a 10-day streak", earned: true },
    { name: "Century Club", description: "Complete 100 workouts", earned: false },
    { name: "Marathon Master", description: "Complete a 60-minute workout", earned: true },
    { name: "Monthly Champion", description: "Complete 25 workouts in a month", earned: false },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Progress Analytics
        </h1>
        <p className="text-gray-400">Track your fitness evolution</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">{currentStreak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
            <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
            <div className="text-sm text-gray-400">Total Workouts</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{thisWeekWorkouts}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{thisMonthWorkouts}</div>
            <div className="text-sm text-gray-400">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400">Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {thisWeekWorkouts}/{weeklyGoal} workouts
              </span>
            </div>
            <WorkoutProgress value={(thisWeekWorkouts / weeklyGoal) * 100} className="h-3 bg-gray-800" />
            <div className="text-center text-sm text-gray-400">
              {Math.round((thisWeekWorkouts / weeklyGoal) * 100)}% completed
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-400">Monthly Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {thisMonthWorkouts}/{monthlyGoal} workouts
              </span>
            </div>
            <WorkoutProgress value={(thisMonthWorkouts / monthlyGoal) * 100} className="h-3 bg-gray-800" />
            <div className="text-center text-sm text-gray-400">
              {Math.round((thisMonthWorkouts / monthlyGoal) * 100)}% completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
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
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="workouts" fill="var(--color-workouts)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
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
                <LineChart data={monthlyProgress}>
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

      {/* Achievements */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  achievement.earned
                    ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                    : "bg-gray-800/30 border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Award className={`h-8 w-8 ${achievement.earned ? "text-yellow-400" : "text-gray-600"}`} />
                  <div>
                    <h3 className={`font-semibold ${achievement.earned ? "text-white" : "text-gray-400"}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 text-xs">Earned</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
