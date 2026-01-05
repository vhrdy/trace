-- Remove auth.users dependency from profiles
-- Make profiles table independent with wallet_address as primary identifier

-- Drop the foreign key constraint to auth.users if it exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make id a regular UUID column with default
ALTER TABLE profiles
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure wallet_address is unique and not null
ALTER TABLE profiles
ALTER COLUMN wallet_address SET NOT NULL;

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
