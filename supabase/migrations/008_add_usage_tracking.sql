-- Add usage tracking columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS export_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_export_at TIMESTAMP WITH TIME ZONE;

-- Update existing profiles to have 0 scans and exports
UPDATE profiles
SET
  scan_count = 0,
  export_count = 0
WHERE scan_count IS NULL OR export_count IS NULL;
