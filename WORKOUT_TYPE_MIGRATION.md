# Workout Type Migration

## Overview
This migration replaces the "Difficulty" field with "Workout Type" to provide more meaningful classification of workouts.

## Changes Made

### Database Schema
- **Before**: `difficulty VARCHAR(20) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'))`
- **After**: `workout_type VARCHAR(20) CHECK (workout_type IN ('Strength', 'Hypertrophy', 'Endurance', 'Cardio', 'Mobility', 'Skill', 'Recovery'))`

### New Workout Types
1. **Strength** - Focus on building strength and power
2. **Hypertrophy** - Muscle building and size focus
3. **Endurance** - Stamina and endurance training
4. **Cardio** - Cardiovascular fitness
5. **Mobility** - Flexibility and mobility work
6. **Skill** - Technique-focused sessions
7. **Recovery** - Active recovery sessions

### Files Modified
1. **Database Schema**: `supabase-schema.sql`
2. **TypeScript Interfaces**: `lib/supabase.ts`, `lib/database.ts`
3. **UI Components**: 
   - `components/create-workout-form.tsx`
   - `components/edit-workout-form.tsx`
   - `components/workout-session.tsx`
   - `app/workouts/page.tsx`

### Migration Steps
1. Run the migration script: `migration-workout-type.sql`
2. Update your local code with the new changes
3. Test the application to ensure everything works correctly

## Benefits
- More meaningful workout classification
- Better tracking of progress by workout type
- Improved analytics capabilities
- More specific workout planning

## Color Coding
Each workout type has a distinct color for easy identification:
- **Strength**: Red
- **Hypertrophy**: Purple  
- **Endurance**: Blue
- **Cardio**: Green
- **Mobility**: Yellow
- **Skill**: Orange
- **Recovery**: Gray

## Backward Compatibility
- Existing workouts are migrated automatically
- Old difficulty values are mapped to appropriate workout types
- No data loss during migration 