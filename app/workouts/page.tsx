"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Search, Play, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { CreateWorkoutForm } from "@/components/create-workout-form"
import { EditWorkoutForm } from "@/components/edit-workout-form"
import { useWorkouts } from "@/hooks/useWorkouts"
import { type FrontendWorkout } from "@/lib/database"
import { useAuth } from '@/components/AuthProvider'
import { cn } from "@/lib/utils"

type Workout = FrontendWorkout

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const { 
    workouts, 
    loading, 
    error, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout
  } = useWorkouts(user?.id, !authLoading)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setIsCreateDialogOpen(true)
      router.replace("/workouts", { scroll: false })
    }
  }, [searchParams, router])

  const filteredWorkouts = workouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your workouts…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm px-6">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:py-14 space-y-10">
      <header className="space-y-3 animate-fade-rise">
        <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground">
          Workouts
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md">
          Your routines, ready when you are.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-rise-delay">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search…"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              New workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <div className="max-h-[calc(100dvh-5rem)] space-y-4 overflow-y-auto pr-1">
              <DialogHeader className="pr-6">
                <DialogTitle>New workout</DialogTitle>
                <DialogDescription>Add exercises, sets, and details.</DialogDescription>
              </DialogHeader>
              <CreateWorkoutForm onSubmit={handleCreateWorkout} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="max-h-[calc(100dvh-5rem)] space-y-4 overflow-y-auto pr-1">
            <DialogHeader className="pr-6">
              <DialogTitle>Edit workout</DialogTitle>
              <DialogDescription>Refine this routine.</DialogDescription>
            </DialogHeader>
            {editingWorkout && <EditWorkoutForm workout={editingWorkout} onSubmit={handleUpdateWorkout} />}
          </div>
        </DialogContent>
      </Dialog>

      <div className="divide-y divide-border/70">
        {filteredWorkouts.map((workout: Workout, index) => {
          const meta = [
            workout.estimatedDuration,
            `${workout.exercises.length} exercises`,
            workout.workoutType,
          ].filter(Boolean).join(" · ")
          const categoriesLine = workout.categories.length > 0
            ? workout.categories.slice(0, 3).join(" · ") + (workout.categories.length > 3 ? ` · +${workout.categories.length - 3}` : "")
            : null
          const historyLine = workout.completions === 0
            ? "Not yet completed"
            : `${workout.completions} completed${workout.lastCompleted ? ` · last ${new Date(workout.lastCompleted).toLocaleDateString()}` : ""}`

          return (
            <article
              key={workout.id}
              className={cn(
                "group py-7 first:pt-2 animate-row-in",
              )}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
                    {workout.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{meta}</p>
                  {categoriesLine && (
                    <p className="text-xs text-muted-foreground/80 tracking-wide">{categoriesLine}</p>
                  )}
                  {workout.description && (
                    <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed pt-1">
                      {workout.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70 pt-1">{historyLine}</p>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-1 sm:gap-2 shrink-0">
                  <Button
                    onClick={() => handleStartWorkout(workout)}
                    size="sm"
                    className="min-h-[40px] flex-1 sm:flex-none px-6 sm:px-3"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Start
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditWorkout(workout)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit workout"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete workout"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <p className="font-display text-2xl text-foreground">No workouts yet</p>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {searchTerm
              ? "Nothing matches that search. Try another term, or create something new."
              : "Begin with a simple routine — a few exercises is enough."}
          </p>
          {!searchTerm && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New workout
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
