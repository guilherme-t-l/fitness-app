import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
        <p className="text-gray-400">Loading workout...</p>
      </div>
    </div>
  )
} 