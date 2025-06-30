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
    difficulty VARCHAR(20) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    category VARCHAR(100),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order_index ON exercises(workout_id, order_index);

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

-- Create RLS (Row Level Security) policies for future multi-user support
-- For now, we'll allow all operations (single user)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single user setup)
CREATE POLICY "Allow all operations on workouts" ON workouts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on exercises" ON exercises
    FOR ALL USING (true);

-- Insert sample data (optional - you can remove this if you want to start fresh)
INSERT INTO workouts (id, name, description, estimated_duration, difficulty, category, created_at, last_completed, completions) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Upper Body Strength', 'Focus on building upper body muscle and strength', '45 min', 'Intermediate', 'Strength', '2024-01-10T00:00:00Z', '2024-01-15T00:00:00Z', 8),
    ('550e8400-e29b-41d4-a716-446655440002', 'Full Body HIIT', 'High-intensity interval training for full body conditioning', '25 min', 'Advanced', 'Cardio', '2024-01-12T00:00:00Z', NULL, 5),
    ('550e8400-e29b-41d4-a716-446655440003', 'Lower Body Focus', 'Comprehensive lower body strength and power workout', '50 min', 'Intermediate', 'Strength', '2024-01-08T00:00:00Z', '2024-01-14T00:00:00Z', 12)
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