import { useState, useEffect, useCallback } from 'react'
import { databaseService } from '@/lib/database'

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categoriesData = await databaseService.getAllCategories()
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save new category and refresh list
  const saveNewCategory = useCallback(async (category: string) => {
    try {
      await databaseService.saveNewCategory(category)
      // Refresh the categories list to include the new category
      await loadCategories()
    } catch (err) {
      console.error('Error saving new category:', err)
      setError(err instanceof Error ? err.message : 'Failed to save new category')
    }
  }, [loadCategories])

  // Delete category and refresh list
  const deleteCategory = useCallback(async (category: string) => {
    try {
      await databaseService.deleteCategory(category)
      // Refresh the categories list to remove the deleted category
      await loadCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }, [loadCategories])

  // Refresh categories
  const refreshCategories = useCallback(async () => {
    await loadCategories()
  }, [loadCategories])

  // Load data on mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    saveNewCategory,
    deleteCategory,
    refreshCategories
  }
} 