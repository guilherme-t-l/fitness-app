-- Supabase Database Schema for Fitness App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration VARCHAR(50),
    workout_type VARCHAR(20) CHECK (workout_type IN ('Strength', 'Hypertrophy', 'Endurance', 'Cardio', 'Mobility', 'Skill', 'Recovery')),
    categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_completed TIMESTAMP WITH TIME ZONE,
    completions INTEGER DEFAULT 0,
    user_id UUID -- For future multi-user support
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    reps VARCHAR(50) NOT NULL,
    weight VARCHAR(50),
    rest_time VARCHAR(50),
    notes TEXT,
    adjustment VARCHAR(100),
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_history table for detailed tracking
CREATE TABLE IF NOT EXISTS workout_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    user_id UUID -- For future multi-user support
);

-- Create exercise_performance table for detailed exercise tracking
CREATE TABLE IF NOT EXISTS exercise_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_history_id UUID NOT NULL REFERENCES workout_history(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_performed VARCHAR(50),
    weight_used VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_categories ON workouts USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order_index ON exercises(workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_history_workout_id ON workout_history(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_completed_at ON workout_history(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_history_id ON exercise_performance(workout_history_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_exercise_id ON exercise_performance(exercise_id);

-- Create function to increment completions
CREATE OR REPLACE FUNCTION increment_completions(workout_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE workouts 
    SET completions = completions + 1,
        last_completed = NOW()
    WHERE id = workout_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get workout statistics
CREATE OR REPLACE FUNCTION get_workout_stats()
RETURNS TABLE (
    total_workouts BIGINT,
    total_completions BIGINT,
    this_week_workouts BIGINT,
    this_month_workouts BIGINT,
    current_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT w.id) as total_workouts,
            COALESCE(SUM(w.completions), 0) as total_completions,
            COUNT(CASE WHEN wh.completed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week_workouts,
            COUNT(CASE WHEN wh.completed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as this_month_workouts
        FROM workouts w
        LEFT JOIN workout_history wh ON w.id = wh.workout_id
    ),
    streak_calc AS (
        SELECT 
            CASE 
                WHEN MAX(wh.completed_at) IS NULL THEN 0
                ELSE (
                    SELECT COUNT(*)::INTEGER
                    FROM (
                        SELECT DISTINCT DATE(wh2.completed_at) as workout_date
                        FROM workout_history wh2
                        WHERE wh2.completed_at >= (
                            SELECT MAX(wh3.completed_at) - INTERVAL '30 days'
                            FROM workout_history wh3
                        )
                        ORDER BY workout_date DESC
                    ) dates
                    WHERE dates.workout_date >= (
                        SELECT MAX(DATE(wh4.completed_at)) - INTERVAL '30 days'
                        FROM workout_history wh4
                    )
                )
            END as current_streak
        FROM workout_history wh
    )
    SELECT 
        s.total_workouts,
        s.total_completions,
        s.this_week_workouts,
        s.this_month_workouts,
        sc.current_streak
    FROM stats s, streak_calc sc;
END;
$$ LANGUAGE plpgsql;

-- Create function to get category breakdown
CREATE OR REPLACE FUNCTION get_category_breakdown()
RETURNS TABLE (
    category VARCHAR(100),
    workout_count BIGINT,
    completion_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        category_value::VARCHAR(100) as category,
        COUNT(DISTINCT w.id) as workout_count,
        COALESCE(SUM(w.completions), 0) as completion_count
    FROM workouts w,
         jsonb_array_elements_text(w.categories) as category_value
    WHERE w.categories IS NOT NULL AND jsonb_array_length(w.categories) > 0
    GROUP BY category_value
    ORDER BY completion_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security) policies for future multi-user support
-- For now, we'll allow all operations (single user)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations on workouts" ON workouts;
DROP POLICY IF EXISTS "Allow all operations on exercises" ON exercises;
DROP POLICY IF EXISTS "Allow all operations on workout_history" ON workout_history;
DROP POLICY IF EXISTS "Allow all operations on exercise_performance" ON exercise_performance;

-- Create new policies
CREATE POLICY "Allow all operations on workouts" ON workouts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on exercises" ON exercises
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on workout_history" ON workout_history
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on exercise_performance" ON exercise_performance
    FOR ALL USING (true);

-- Insert sample data (optional - you can remove this if you want to start fresh)
INSERT INTO workouts (id, name, description, estimated_duration, workout_type, categories, created_at, last_completed, completions) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Upper Body Strength', 'Focus on building upper body muscle and strength', '45 min', 'Strength', '["Strength", "Upper Body", "Push"]', '2024-01-10T00:00:00Z', '2024-01-15T00:00:00Z', 8),
    ('550e8400-e29b-41d4-a716-446655440002', 'Full Body HIIT', 'High-intensity interval training for full body conditioning', '25 min', 'Cardio', '["Cardio", "HIIT", "Full Body"]', '2024-01-12T00:00:00Z', NULL, 5),
    ('550e8400-e29b-41d4-a716-446655440003', 'Lower Body Focus', 'Comprehensive lower body strength and power workout', '50 min', 'Strength', '["Strength", "Lower Body", "Legs"]', '2024-01-08T00:00:00Z', '2024-01-14T00:00:00Z', 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (workout_id, name, sets, reps, weight, rest_time, order_index) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Push-ups', 3, '12-15', NULL, '60s', 0),
    ('550e8400-e29b-41d4-a716-446655440001', 'Pull-ups', 3, '8-10', NULL, '90s', 1),
    ('550e8400-e29b-41d4-a716-446655440001', 'Bench Press', 4, '8-10', '70kg', '120s', 2),
    ('550e8400-e29b-41d4-a716-446655440001', 'Overhead Press', 3, '10-12', '40kg', '90s', 3),
    ('550e8400-e29b-41d4-a716-446655440002', 'Burpees', 4, '30s', NULL, '30s', 0),
    ('550e8400-e29b-41d4-a716-446655440002', 'Mountain Climbers', 4, '30s', NULL, '30s', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'Jump Squats', 4, '30s', NULL, '30s', 2),
    ('550e8400-e29b-41d4-a716-446655440002', 'High Knees', 4, '30s', NULL, '30s', 3),
    ('550e8400-e29b-41d4-a716-446655440003', 'Squats', 4, '12-15', '60kg', '90s', 0),
    ('550e8400-e29b-41d4-a716-446655440003', 'Deadlifts', 3, '8-10', '80kg', '120s', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'Lunges', 3, '12 each leg', NULL, '60s', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Calf Raises', 4, '15-20', '20kg', '45s', 3)
ON CONFLICT DO NOTHING; 