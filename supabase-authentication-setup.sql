-- =====================================================
-- FitFlow Authentication Setup - Phase 1
-- =====================================================
-- This file contains all necessary SQL queries to enable
-- user authentication and guest mode functionality.
-- 
-- RUN THESE QUERIES IN YOUR SUPABASE SQL EDITOR
-- =====================================================

-- =====================================================
-- SECTION 1: CREATE DEFAULT USER ACCOUNT
-- =====================================================

-- Create default user account for guest mode
-- This will be used for existing data and guest mode access
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'guilherme@fitflow.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"guilherme"}',
    false,
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SECTION 2: MIGRATE EXISTING DATA
-- =====================================================

-- Update existing data to assign to default user
-- This ensures all existing workouts and data are associated with the default user
UPDATE workouts 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL;

UPDATE workout_history 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL;

UPDATE categories 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL;

-- =====================================================
-- SECTION 3: DROP EXISTING RLS POLICIES
-- =====================================================

-- Drop existing RLS policies to replace with user-aware ones
DROP POLICY IF EXISTS "Allow all operations on workouts" ON workouts;
DROP POLICY IF EXISTS "Allow all operations on exercises" ON exercises;
DROP POLICY IF EXISTS "Allow all operations on workout_history" ON workout_history;
DROP POLICY IF EXISTS "Allow all operations on exercise_performance" ON exercise_performance;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- =====================================================
-- SECTION 4: CREATE NEW RLS POLICIES FOR USER ISOLATION
-- =====================================================

-- Workouts table policies
CREATE POLICY "Users can view their own workouts" ON workouts
    FOR SELECT USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can insert their own workouts" ON workouts
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can update their own workouts" ON workouts
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can delete their own workouts" ON workouts
    FOR DELETE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

-- Exercises table policies (exercises are linked to workouts, so they inherit user access)
CREATE POLICY "Users can view exercises for their workouts" ON exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can insert exercises for their workouts" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can update exercises for their workouts" ON exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can delete exercises for their workouts" ON exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = exercises.workout_id 
            AND (workouts.user_id = auth.uid() OR workouts.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

-- Workout history table policies
CREATE POLICY "Users can view their own workout history" ON workout_history
    FOR SELECT USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can insert their own workout history" ON workout_history
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can update their own workout history" ON workout_history
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can delete their own workout history" ON workout_history
    FOR DELETE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

-- Exercise performance table policies (linked to workout history)
CREATE POLICY "Users can view exercise performance for their workouts" ON exercise_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_history 
            WHERE workout_history.id = exercise_performance.workout_history_id 
            AND (workout_history.user_id = auth.uid() OR workout_history.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can insert exercise performance for their workouts" ON exercise_performance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_history 
            WHERE workout_history.id = exercise_performance.workout_history_id 
            AND (workout_history.user_id = auth.uid() OR workout_history.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can update exercise performance for their workouts" ON exercise_performance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_history 
            WHERE workout_history.id = exercise_performance.workout_history_id 
            AND (workout_history.user_id = auth.uid() OR workout_history.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

CREATE POLICY "Users can delete exercise performance for their workouts" ON exercise_performance
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_history 
            WHERE workout_history.id = exercise_performance.workout_history_id 
            AND (workout_history.user_id = auth.uid() OR workout_history.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
        )
    );

-- Categories table policies
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid OR
        user_id IS NULL
    );

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (
        user_id = auth.uid() OR 
        user_id = '00000000-0000-0000-0000-000000000001'::uuid
    );

-- =====================================================
-- SECTION 5: CREATE HELPER FUNCTIONS
-- =====================================================

-- Create function to get current user ID for database operations
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Return the authenticated user's ID, or the default user ID for guest mode
    RETURN COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000001'::uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 6: UPDATE DATABASE FUNCTIONS FOR USER CONTEXT
-- =====================================================

-- Update the get_workout_stats function to work with user isolation
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
        WHERE w.user_id = get_current_user_id()
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
                        JOIN workouts w2 ON wh2.workout_id = w2.id
                        WHERE w2.user_id = get_current_user_id()
                        AND wh2.completed_at >= (
                            SELECT MAX(wh3.completed_at) - INTERVAL '30 days'
                            FROM workout_history wh3
                            JOIN workouts w3 ON wh3.workout_id = w3.id
                            WHERE w3.user_id = get_current_user_id()
                        )
                        ORDER BY workout_date DESC
                    ) dates
                    WHERE dates.workout_date >= (
                        SELECT MAX(DATE(wh4.completed_at)) - INTERVAL '30 days'
                        FROM workout_history wh4
                        JOIN workouts w4 ON wh4.workout_id = w4.id
                        WHERE w4.user_id = get_current_user_id()
                    )
                )
            END as current_streak
        FROM workout_history wh
        JOIN workouts w ON wh.workout_id = w.id
        WHERE w.user_id = get_current_user_id()
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

-- Update the get_category_breakdown function to work with user isolation
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
    WHERE w.user_id = get_current_user_id()
    AND w.categories IS NOT NULL AND jsonb_array_length(w.categories) > 0
    GROUP BY category_value
    ORDER BY completion_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Update the get_all_categories function to work with user isolation
CREATE OR REPLACE FUNCTION get_all_categories()
RETURNS TABLE (
    name VARCHAR(100),
    usage_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.name, c.usage_count
    FROM categories c
    WHERE c.user_id = get_current_user_id() OR c.user_id IS NULL
    ORDER BY c.usage_count DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 7: VERIFICATION QUERIES
-- =====================================================

-- Verify the migration was successful
SELECT 'Migration completed successfully' as status;

-- Check that existing data was migrated
SELECT 
    'Workouts migrated' as table_name,
    COUNT(*) as record_count
FROM workouts 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
    'Workout history migrated' as table_name,
    COUNT(*) as record_count
FROM workout_history 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
    'Categories migrated' as table_name,
    COUNT(*) as record_count
FROM categories 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Check RLS policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('workouts', 'exercises', 'workout_history', 'exercise_performance', 'categories')
ORDER BY tablename, policyname;

-- =====================================================
-- ROLLBACK QUERIES (RUN ONLY IF YOU NEED TO REVERT)
-- =====================================================

/*
-- ROLLBACK SECTION 1: RESTORE ORIGINAL RLS POLICIES
-- Run these if you need to revert to the original single-user setup

-- Drop user-aware policies
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

DROP POLICY IF EXISTS "Users can view exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can insert exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can update exercises for their workouts" ON exercises;
DROP POLICY IF EXISTS "Users can delete exercises for their workouts" ON exercises;

DROP POLICY IF EXISTS "Users can view their own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can insert their own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can update their own workout history" ON workout_history;
DROP POLICY IF EXISTS "Users can delete their own workout history" ON workout_history;

DROP POLICY IF EXISTS "Users can view exercise performance for their workouts" ON exercise_performance;
DROP POLICY IF EXISTS "Users can insert exercise performance for their workouts" ON exercise_performance;
DROP POLICY IF EXISTS "Users can update exercise performance for their workouts" ON exercise_performance;
DROP POLICY IF EXISTS "Users can delete exercise performance for their workouts" ON exercise_performance;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- Restore original policies (allow all operations)
CREATE POLICY "Allow all operations on workouts" ON workouts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on exercises" ON exercises
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on workout_history" ON workout_history
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on exercise_performance" ON exercise_performance
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on categories" ON categories
    FOR ALL USING (true);

-- ROLLBACK SECTION 2: REMOVE USER_ID FROM EXISTING DATA
-- Run these if you want to remove user_id from existing data

UPDATE workouts SET user_id = NULL WHERE user_id = '00000000-0000-0000-0000-000000000001';
UPDATE workout_history SET user_id = NULL WHERE user_id = '00000000-0000-0000-0000-000000000001';
UPDATE categories SET user_id = NULL WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- ROLLBACK SECTION 3: DELETE DEFAULT USER
-- Run this if you want to remove the default user account

DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- ROLLBACK SECTION 4: RESTORE ORIGINAL FUNCTIONS
-- Run these if you want to restore the original functions

-- Restore original get_workout_stats function
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

-- Restore original get_category_breakdown function
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

-- Restore original get_all_categories function
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

-- Remove the get_current_user_id function
DROP FUNCTION IF EXISTS get_current_user_id();
*/ 