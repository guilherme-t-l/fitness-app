-- Migration script to replace difficulty with workout_type and category with categories
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new workout_type column
ALTER TABLE workouts ADD COLUMN workout_type VARCHAR(20);

-- Step 2: Add the check constraint for workout_type
ALTER TABLE workouts ADD CONSTRAINT workouts_workout_type_check 
CHECK (workout_type IN ('Strength', 'Hypertrophy', 'Endurance', 'Cardio', 'Mobility', 'Skill', 'Recovery'));

-- Step 3: Add the new categories column (JSONB)
ALTER TABLE workouts ADD COLUMN categories JSONB DEFAULT '[]'::jsonb;

-- Step 4: Migrate existing data from difficulty to workout_type
-- Map old difficulty values to new workout types
UPDATE workouts 
SET workout_type = CASE 
  WHEN difficulty = 'Beginner' THEN 'Strength'
  WHEN difficulty = 'Intermediate' THEN 'Hypertrophy' 
  WHEN difficulty = 'Advanced' THEN 'Strength'
  ELSE 'Strength'
END
WHERE workout_type IS NULL;

-- Step 5: Migrate existing category data to categories JSONB
UPDATE workouts 
SET categories = CASE 
  WHEN category IS NOT NULL AND category != '' THEN jsonb_build_array(category)
  ELSE '[]'::jsonb
END
WHERE categories IS NULL;

-- Step 6: Make workout_type NOT NULL
ALTER TABLE workouts ALTER COLUMN workout_type SET NOT NULL;

-- Step 7: Drop the old columns
ALTER TABLE workouts DROP COLUMN difficulty;
ALTER TABLE workouts DROP COLUMN category;

-- Step 8: Update sample data to use proper workout types
UPDATE workouts 
SET workout_type = 'Strength'
WHERE name = 'Upper Body Strength';

UPDATE workouts 
SET workout_type = 'Cardio'
WHERE name = 'Full Body HIIT';

UPDATE workouts 
SET workout_type = 'Strength'
WHERE name = 'Lower Body Focus';

-- Verify the migration
SELECT id, name, workout_type, categories FROM workouts; 