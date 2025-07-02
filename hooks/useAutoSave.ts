import { useRef } from "react"

// Custom hook for auto-saving exercises
export function useAutoSave<T>(onSave: (id: string, data: T) => void, delay = 1000) {
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Schedule an auto-save for a given id
  const scheduleSave = (id: string, data: T) => {
    // Clear existing timeout
    const existing = timeouts.current.get(id)
    if (existing) clearTimeout(existing)
    // Set new timeout
    const timeout = setTimeout(() => {
      onSave(id, data)
      timeouts.current.delete(id)
    }, delay)
    timeouts.current.set(id, timeout)
  }

  // Cleanup all timeouts
  const cleanup = () => {
    timeouts.current.forEach((timeout) => clearTimeout(timeout))
    timeouts.current.clear()
  }

  return { scheduleSave, cleanup }
} 