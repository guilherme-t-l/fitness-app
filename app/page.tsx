"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Play, Edit, Trash2, Clock, Dumbbell, Plus, Calendar } from "lucide-react"
import { CreateWorkoutForm } from "@/components/create-workout-form"
import { EditWorkoutForm } from "@/components/edit-workout-form"
import { WorkoutSession } from "@/components/workout-session"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  restTime?: string
  notes?: string
  adjustment?: string
  description?: string
}

interface Workout {
  id: string
  name: string
  description: string
  exercises: Exercise[]
  estimatedDuration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  createdAt: string
  lastCompleted?: string
  completions: number
}

const sampleWorkouts: Workout[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    description: "Focus on building upper body muscle and strength",
    exercises: [
      { id: "1", name: "Push-ups", sets: 3, reps: "12-15", restTime: "60s" },
      { id: "2", name: "Pull-ups", sets: 3, reps: "8-10", restTime: "90s" },
      { id: "3", name: "Bench Press", sets: 4, reps: "8-10", weight: "70kg", restTime: "120s" },
      { id: "4", name: "Overhead Press", sets: 3, reps: "10-12", weight: "40kg", restTime: "90s" },
    ],
    estimatedDuration: "45 min",
    difficulty: "Intermediate",
    category: "Strength",
    createdAt: "2024-01-10",
    lastCompleted: "2024-01-15",
    completions: 8,
  },
  {
    id: "2",
    name: "Full Body HIIT",
    description: "High-intensity interval training for full body conditioning",
    exercises: [
      { id: "5", name: "Burpees", sets: 4, reps: "30s", restTime: "30s" },
      { id: "6", name: "Mountain Climbers", sets: 4, reps: "30s", restTime: "30s" },
      { id: "7", name: "Jump Squats", sets: 4, reps: "30s", restTime: "30s" },
      { id: "8", name: "High Knees", sets: 4, reps: "30s", restTime: "30s" },
    ],
    estimatedDuration: "25 min",
    difficulty: "Advanced",
    category: "Cardio",
    createdAt: "2024-01-12",
    completions: 5,
  },
  {
    id: "3",
    name: "Lower Body Focus",
    description: "Comprehensive lower body strength and power workout",
    exercises: [
      { id: "9", name: "Squats", sets: 4, reps: "12-15", weight: "60kg", restTime: "90s" },
      { id: "10", name: "Deadlifts", sets: 3, reps: "8-10", weight: "80kg", restTime: "120s" },
      { id: "11", name: "Lunges", sets: 3, reps: "12 each leg", restTime: "60s" },
      { id: "12", name: "Calf Raises", sets: 4, reps: "15-20", weight: "20kg", restTime: "45s" },
    ],
    estimatedDuration: "50 min",
    difficulty: "Intermediate",
    category: "Strength",
    createdAt: "2024-01-08",
    lastCompleted: "2024-01-14",
    completions: 12,
  },
]

export default function WorkoutsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [workouts, setWorkouts] = useState<Workout[]>(sampleWorkouts)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)

  const filteredWorkouts = workouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleCreateWorkout = (newWorkout: Omit<Workout, "id" | "createdAt" | "completions">) => {
    const workout: Workout = {
      ...newWorkout,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completions: 0,
    }
    setWorkouts([...workouts, workout])
    setIsCreateDialogOpen(false)
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setIsEditDialogOpen(true)
  }

  const handleUpdateWorkout = (updatedWorkout: Omit<Workout, "id" | "createdAt" | "completions">) => {
    if (editingWorkout) {
      const workout: Workout = {
        ...updatedWorkout,
        id: editingWorkout.id,
        createdAt: editingWorkout.createdAt,
        completions: editingWorkout.completions,
        lastCompleted: editingWorkout.lastCompleted,
      }
      setWorkouts(workouts.map((w) => (w.id === editingWorkout.id ? workout : w)))
      setIsEditDialogOpen(false)
      setEditingWorkout(null)
    }
  }

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout)
  }

  const handleCompleteWorkout = () => {
    if (activeWorkout) {
      setWorkouts(
        workouts.map((w) =>
          w.id === activeWorkout.id
            ? { ...w, completions: w.completions + 1, lastCompleted: new Date().toISOString() }
            : w,
        ),
      )
      setActiveWorkout(null)
    }
  }

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter((w) => w.id !== workoutId))
  }

  const handleSaveWorkoutChanges = (workoutId: string, updatedExercises: Exercise[]) => {
    setWorkouts(workouts.map((w) => (w.id === workoutId ? { ...w, exercises: updatedExercises } : w)))
  }

  if (activeWorkout) {
    return (
      <WorkoutSession
        workout={activeWorkout}
        onComplete={handleCompleteWorkout}
        onExit={() => setActiveWorkout(null)}
        onSaveChanges={handleSaveWorkoutChanges}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">My Workouts</h1>
        <p className="text-gray-400 text-lg">Create, track, and complete your fitness routines</p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="primary-glow text-white font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create New Workout</DialogTitle>
            </DialogHeader>
            <CreateWorkoutForm onSubmit={handleCreateWorkout} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Workout Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Edit Workout</DialogTitle>
          </DialogHeader>
          {editingWorkout && <EditWorkoutForm workout={editingWorkout} onSubmit={handleUpdateWorkout} />}
        </DialogContent>
      </Dialog>

      {/* Workouts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="card-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-white text-lg">{workout.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(workout.difficulty)}>{workout.difficulty}</Badge>
                    <Badge variant="outline" className="border-green-400/50 text-green-400">
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
                  <Clock className="h-4 w-4 text-green-400" />
                  <span>{workout.estimatedDuration}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Dumbbell className="h-4 w-4 text-blue-400" />
                  <span>{workout.exercises.length} exercises</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="h-4 w-4 text-purple-400" />
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
                  onClick={() => handleStartWorkout(workout)}
                  className="flex-1 primary-glow text-white font-semibold"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditWorkout(workout)}
                  className="border-gray-600 text-gray-300 hover:text-green-400 hover:border-green-400 bg-transparent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWorkout(workout.id)}
                  className="border-gray-600 text-gray-300 hover:text-red-400 hover:border-red-400 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <Card className="card-glow">
          <CardContent className="p-12 text-center">
            <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workouts found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new workout</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
