"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Play, Edit, Trash2, Clock, Dumbbell, Plus, Calendar, Loader2 } from "lucide-react"
import { CreateWorkoutForm } from "@/components/create-workout-form"
import { EditWorkoutForm } from "@/components/edit-workout-form"
import { WorkoutSession } from "@/components/workout-session"
import { useWorkouts } from "@/hooks/useWorkouts"
import { type FrontendWorkout, type FrontendExercise } from "@/lib/database"
import Link from 'next/link'

// Use the types from database service
type Exercise = FrontendExercise
type Workout = FrontendWorkout

// Sample workouts moved to database - no longer needed here

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center gap-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Welcome to FitFlow</h1>
        <p className="text-gray-400 mb-4 text-center">Your smart fitness companion. Choose how you want to get started:</p>
        <div className="flex flex-col gap-4 w-full">
          <button disabled className="w-full py-3 rounded bg-gray-800 text-gray-500 font-semibold cursor-not-allowed opacity-60">Login / Sign Up (coming soon)</button>
          <Link href="/workouts" className="w-full block py-3 rounded bg-green-500 text-white font-semibold text-center hover:bg-green-600 transition">Use as Guest</Link>
        </div>
      </div>
    </main>
  )
}
