-- Fix all existing accounts to use free plan

-- Update all existing profiles to free plan
UPDATE profiles
SET plan = 'free'
WHERE plan IS NOT NULL AND plan != 'free';

-- Remove the old constraint if it exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add new constraint that only allows 'free'
ALTER TABLE profiles
ADD CONSTRAINT profiles_plan_check CHECK (plan = 'free');

-- Ensure default is free
ALTER TABLE profiles
ALTER COLUMN plan SET DEFAULT 'free';

-- Clean up any pro or trenchor plans from plans table
DELETE FROM plans WHERE name IN ('pro', 'trenchor');

-- Ensure only free plan exists
INSERT INTO plans (name, limits) VALUES
  ('free', '{"max_wallets": 1, "max_scans": 2, "max_exports": 2}'::jsonb)
ON CONFLICT (name) DO UPDATE SET limits = EXCLUDED.limits;
