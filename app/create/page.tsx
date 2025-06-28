"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Dumbbell, Clock, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  duration?: string
  notes?: string
}

interface WorkoutDay {
  day: string
  exercises: Exercise[]
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const exerciseLibrary = [
  "Push-ups",
  "Pull-ups",
  "Squats",
  "Deadlifts",
  "Bench Press",
  "Overhead Press",
  "Rows",
  "Lunges",
  "Planks",
  "Burpees",
  "Mountain Climbers",
  "Jumping Jacks",
  "Bicep Curls",
  "Tricep Dips",
  "Leg Press",
  "Lat Pulldowns",
]

export default function CreateWorkout() {
  const [workoutName, setWorkoutName] = useState("")
  const [workoutDescription, setWorkoutDescription] = useState("")
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(daysOfWeek.map((day) => ({ day, exercises: [] })))

  const addExercise = (day: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      sets: 3,
      reps: "10",
    }

    setWorkoutDays((prev) =>
      prev.map((workoutDay) =>
        workoutDay.day === day ? { ...workoutDay, exercises: [...workoutDay.exercises, newExercise] } : workoutDay,
      ),
    )
  }

  const updateExercise = (day: string, exerciseId: string, field: keyof Exercise, value: any) => {
    setWorkoutDays((prev) =>
      prev.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise,
              ),
            }
          : workoutDay,
      ),
    )
  }

  const removeExercise = (day: string, exerciseId: string) => {
    setWorkoutDays((prev) =>
      prev.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.filter((exercise) => exercise.id !== exerciseId),
            }
          : workoutDay,
      ),
    )
  }

  const saveWorkout = () => {
    const workout = {
      name: workoutName,
      description: workoutDescription,
      days: workoutDays.filter((day) => day.exercises.length > 0),
      createdAt: new Date().toISOString(),
    }

    // Here you would save to your backend/database
    console.log("Saving workout:", workout)
    alert("Workout program saved successfully!")
  }

  const currentDay = workoutDays.find((day) => day.day === selectedDay)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Create Workout Program
        </h1>
        <p className="text-gray-400">Design your perfect training regimen</p>
      </div>

      {/* Workout Details */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Program Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout-name" className="text-gray-300">
                Program Name
              </Label>
              <Input
                id="workout-name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Beast Mode Training"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Total Active Days</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {workoutDays.filter((day) => day.exercises.length > 0).length} days
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workout-description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="workout-description"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              placeholder="Describe your workout program..."
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Day Selection */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Weekly Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                onClick={() => setSelectedDay(day)}
                className={`${
                  selectedDay === day
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "border-gray-600 text-gray-300 hover:text-cyan-400"
                } ${workoutDays.find((d) => d.day === day)?.exercises.length > 0 ? "ring-2 ring-green-400/50" : ""}`}
              >
                {day}
                {workoutDays.find((d) => d.day === day)?.exercises.length > 0 && (
                  <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">
                    {workoutDays.find((d) => d.day === day)?.exercises.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Builder */}
      <Card className="cyber-border bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>{selectedDay} Exercises</span>
            </div>
            <Button
              onClick={() => addExercise(selectedDay)}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentDay?.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exercises added for {selectedDay}</p>
              <p className="text-sm">Click "Add Exercise" to get started</p>
            </div>
          ) : (
            currentDay?.exercises.map((exercise, index) => (
              <Card key={exercise.id} className="bg-gray-800/30 border-gray-700">
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-gray-300 text-sm">Exercise</Label>
                      <Select
                        value={exercise.name}
                        onValueChange={(value) => updateExercise(selectedDay, exercise.id, "name", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {exerciseLibrary.map((ex) => (
                            <SelectItem key={ex} value={ex}>
                              {ex}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(selectedDay, exercise.id, "sets", Number.parseInt(e.target.value))
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Reps</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => updateExercise(selectedDay, exercise.id, "reps", e.target.value)}
                        placeholder="10-12"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Weight</Label>
                      <Input
                        value={exercise.weight || ""}
                        onChange={(e) => updateExercise(selectedDay, exercise.id, "weight", e.target.value)}
                        placeholder="kg/lbs"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExercise(selectedDay, exercise.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={saveWorkout}
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold cyber-glow px-8"
          disabled={!workoutName || workoutDays.every((day) => day.exercises.length === 0)}
        >
          <Save className="h-5 w-5 mr-2" />
          Save Workout Program
        </Button>
      </div>
    </div>
  )
}
