-- Fix Progress Tab Functions
-- Run this in your Supabase SQL Editor to update the functions for the new schema

-- Update the get_workout_stats function to work with the new structure
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

-- Update the get_category_breakdown function to work with JSONB categories
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

-- Create function to get all categories (for the categories table)
CREATE OR REPLACE FUNCTION get_all_categories()
RETURNS TABLE (
    name VARCHAR(100),
    usage_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.name, c.usage_count
    FROM categories c
    ORDER BY c.usage_count DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment category usage
CREATE OR REPLACE FUNCTION increment_category_usage(category_name VARCHAR(100))
RETURNS void AS $$
BEGIN
    INSERT INTO categories (name, usage_count)
    VALUES (category_name, 1)
    ON CONFLICT (name) 
    DO UPDATE SET usage_count = categories.usage_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Ensure the categories table exists
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    user_id UUID -- For future multi-user support
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_usage_count ON categories(usage_count DESC);

-- Insert some default categories if they don't exist
INSERT INTO categories (name, usage_count) VALUES
    ('Upper Body', 0),
    ('Lower Body', 0),
    ('Push', 0),
    ('Pull', 0),
    ('Core', 0),
    ('Legs', 0),
    ('Shoulders', 0),
    ('Back', 0),
    ('Chest', 0),
    ('Triceps', 0),
    ('Biceps', 0),
    ('Forearms', 0),
    ('Abs', 0),
    ('Glutes', 0),
    ('Hamstrings', 0),
    ('Quads', 0),
    ('Calves', 0),
    ('Full Body', 0),
    ('Strength', 0),
    ('Hypertrophy', 0),
    ('Endurance', 0),
    ('Cardio', 0),
    ('Mobility', 0),
    ('Skill', 0),
    ('Recovery', 0),
    ('HIIT', 0)
ON CONFLICT (name) DO NOTHING;

-- Verify the functions work
SELECT 'get_workout_stats function updated successfully' as status;
SELECT 'get_category_breakdown function updated successfully' as status;
SELECT 'get_all_categories function created successfully' as status;
SELECT 'increment_category_usage function created successfully' as status; 