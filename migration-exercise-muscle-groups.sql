-- Per-exercise muscle tags + snapshot on performance
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS muscle_groups JSONB DEFAULT '[]'::jsonb;

ALTER TABLE exercise_performance
  ADD COLUMN IF NOT EXISTS muscle_groups JSONB DEFAULT '[]'::jsonb;

UPDATE exercises
SET muscle_groups = '[]'::jsonb
WHERE muscle_groups IS NULL;

UPDATE exercise_performance
SET muscle_groups = '[]'::jsonb
WHERE muscle_groups IS NULL;
