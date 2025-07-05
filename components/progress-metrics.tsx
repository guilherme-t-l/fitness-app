"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, Award, Flame, BarChart3, Clock, Zap } from "lucide-react"
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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="cyber-border bg-black/40 backdrop-blur-sm animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 mx-auto mb-2 bg-gray-700 rounded" />
                <div className="h-6 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
            <div className="text-2xl font-bold text-white">{stats.totalCompletions}</div>
            <div className="text-sm text-gray-400">Total Workouts</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{stats.thisWeekWorkouts}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{stats.thisMonthWorkouts}</div>
            <div className="text-sm text-gray-400">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Weekly Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {stats.thisWeekWorkouts}/{weeklyGoal} workouts
              </span>
            </div>
            <Progress 
              value={weeklyProgress} 
              className="h-3 bg-gray-800" 
            />
            <div className="text-center text-sm text-gray-400">
              {Math.round(weeklyProgress)}% completed
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Monthly Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {stats.thisMonthWorkouts}/{monthlyGoal} workouts
              </span>
            </div>
            <Progress 
              value={monthlyProgress} 
              className="h-3 bg-gray-800"
            />
            <div className="text-center text-sm text-gray-400">
              {Math.round(monthlyProgress)}% completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Top Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 border border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{category.category}</div>
                      <div className="text-sm text-gray-400">
                        {category.workoutCount} workout{category.workoutCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-400">
                      {category.completionCount} completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Summary */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm hover:bg-black/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.totalCompletions >= 1 && (
              <div className="p-4 rounded-lg border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-white">First Workout</h3>
                    <p className="text-sm text-gray-400">Completed your first workout</p>
                    <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 text-xs">Earned</Badge>
                  </div>
                </div>
              </div>
            )}
            
            {stats.thisWeekWorkouts >= 5 && (
              <div className="p-4 rounded-lg border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-white">Week Warrior</h3>
                    <p className="text-sm text-gray-400">Complete 5+ workouts in a week</p>
                    <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 text-xs">Earned</Badge>
                  </div>
                </div>
              </div>
            )}
            
            {stats.currentStreak >= 7 && (
              <div className="p-4 rounded-lg border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-white">Consistency King</h3>
                    <p className="text-sm text-gray-400">Maintain a 7+ day streak</p>
                    <Badge className="mt-1 bg-yellow-500/20 text-yellow-400 text-xs">Earned</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 