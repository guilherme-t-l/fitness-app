-- Migration script to create a dedicated categories table
-- Run this in your Supabase SQL Editor

-- Create categories table
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

-- Insert some default categories
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
    ('Full Body', 0)
ON CONFLICT (name) DO NOTHING;

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

-- Create function to get all categories with usage count
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