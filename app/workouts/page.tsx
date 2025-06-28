"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Play, Edit, Trash2, Calendar, Clock, Dumbbell, Filter } from "lucide-react"

interface Workout {
  id: string
  name: string
  description: string
  duration: string
  exercises: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  lastCompleted?: string
  completions: number
}

const sampleWorkouts: Workout[] = [
  {
    id: "1",
    name: "Cyber Strength Circuit",
    description: "High-intensity full-body workout designed for maximum gains",
    duration: "45 min",
    exercises: 8,
    difficulty: "Advanced",
    category: "Strength",
    lastCompleted: "2024-01-15",
    completions: 12,
  },
  {
    id: "2",
    name: "Neural Network Cardio",
    description: "AI-optimized cardio routine for enhanced endurance",
    duration: "30 min",
    exercises: 6,
    difficulty: "Intermediate",
    category: "Cardio",
    lastCompleted: "2024-01-14",
    completions: 8,
  },
  {
    id: "3",
    name: "Matrix Core Protocol",
    description: "Core strengthening program inspired by digital aesthetics",
    duration: "25 min",
    exercises: 10,
    difficulty: "Beginner",
    category: "Core",
    completions: 5,
  },
  {
    id: "4",
    name: "Quantum Leg Day",
    description: "Explosive lower body workout for power and definition",
    duration: "50 min",
    exercises: 7,
    difficulty: "Advanced",
    category: "Legs",
    lastCompleted: "2024-01-13",
    completions: 15,
  },
]

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [workouts] = useState<Workout[]>(sampleWorkouts)

  const categories = ["All", "Strength", "Cardio", "Core", "Legs", "Upper Body"]

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || workout.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400"
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400"
      case "Advanced":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Workout Library
        </h1>
        <p className="text-gray-400">Your collection of training programs</p>
      </div>

      {/* Search and Filter */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                      : "border-gray-600 text-gray-300 hover:text-cyan-400"
                  }
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => (
          <Card
            key={workout.id}
            className="cyber-border bg-black/40 backdrop-blur-sm hover:cyber-glow transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-white text-lg">{workout.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(workout.difficulty)}>{workout.difficulty}</Badge>
                    <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">
                      {workout.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-sm">{workout.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>{workout.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Dumbbell className="h-4 w-4 text-purple-400" />
                  <span>{workout.exercises} exercises</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span>{workout.completions} completed</span>
                </div>
                {workout.lastCompleted && (
                  <div className="text-gray-400 text-xs">
                    Last: {new Date(workout.lastCompleted).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-cyan-400 bg-transparent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:text-red-400 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <Card className="cyber-border bg-black/40 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workouts found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
