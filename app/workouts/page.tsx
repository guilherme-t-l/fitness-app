"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Play, Edit, Trash2, Clock, Dumbbell, Plus, Calendar, Loader2 } from "lucide-react"
import { CreateWorkoutForm } from "@/components/create-workout-form"
import { EditWorkoutForm } from "@/components/edit-workout-form"
import { useWorkouts } from "@/hooks/useWorkouts"
import { type FrontendWorkout, type FrontendExercise } from "@/lib/database"

// Use the types from database service
type Exercise = FrontendExercise
type Workout = FrontendWorkout

// Sample workouts moved to database - no longer needed here

// TODO: Technical Debt
// - Extract UI components (WorkoutCard, dialogs, etc.) into separate files for readability and reusability.
// - Move dialog and selection logic into custom hooks to simplify the main page component.
// - Consider splitting business logic from UI rendering for future scalability.

export default function WorkoutsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { 
    workouts, 
    loading, 
    error, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout
  } = useWorkouts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)

  const filteredWorkouts = workouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getWorkoutTypeColor = (workoutType: string) => {
    switch (workoutType) {
      case "Strength":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Hypertrophy":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Endurance":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Cardio":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Mobility":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Skill":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Recovery":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleCreateWorkout = async (newWorkout: Omit<Workout, "id" | "createdAt" | "completions">) => {
    try {
      await createWorkout(newWorkout)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create workout:', error)
    }
  }

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setIsEditDialogOpen(true)
  }

  const handleUpdateWorkout = async (updatedWorkout: Omit<Workout, "id" | "createdAt" | "completions">) => {
    if (editingWorkout) {
      try {
        await updateWorkout(editingWorkout.id, updatedWorkout)
        setIsEditDialogOpen(false)
        setEditingWorkout(null)
      } catch (error) {
        console.error('Failed to update workout:', error)
      }
    }
  }

  const handleStartWorkout = (workout: Workout) => {
    router.push(`/workouts/${workout.id}`)
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId)
    } catch (error) {
      console.error('Failed to delete workout:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="text-gray-400">Loading your workouts...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">⚠️ {error}</div>
          <p className="text-gray-400">Please check your database connection</p>
          <Button onClick={() => window.location.reload()} className="primary-glow">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-10">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8 max-w-7xl mx-auto px-4">
        {filteredWorkouts.map((workout: Workout) => (
          <Card key={workout.id} className="card-glow transition-all duration-300 flex flex-col min-h-[320px] h-full p-6 bg-gray-900/80 border border-gray-800 shadow-xl min-w-[340px]">
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-2">
                  <CardTitle className="text-white text-xl font-bold">{workout.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getWorkoutTypeColor(workout.workoutType)} variant="default">{workout.workoutType}</Badge>
                    {workout.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {workout.categories.slice(0, 2).map((category, index) => (
                          <Badge key={index} variant="outline" className="border-green-400/50 text-green-400 text-xs font-medium transition-colors hover:bg-green-400/10">
                            {category}
                          </Badge>
                        ))}
                        {workout.categories.length > 2 && (
                          <Badge variant="outline" className="border-green-400/50 text-green-400 text-xs font-medium transition-colors hover:bg-green-400/10">
                            +{workout.categories.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-gray-400 text-base mb-4 min-h-[2.5em] line-clamp-2">{workout.description || ''}</div>
              <div className="flex-1" />
              {/* Info rows: 2x2 grid for icons/stats */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6">
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
                  <span>{workout.completions === 0 ? 'Not started' : workout.completions + ' completed'}</span>
                </div>
                {workout.lastCompleted ? (
                  <div className="flex items-center space-x-2 text-gray-400 text-xs">
                    <span>Last:</span>
                    <span>{new Date(workout.lastCompleted).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div />
                )}
              </div>
              <div className="mt-auto flex space-x-2 pt-2">
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
            </div>
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
