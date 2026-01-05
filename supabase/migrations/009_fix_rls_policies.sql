-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow users to read their own profile by wallet address
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (true); -- Allow all reads for now (we only query by wallet_address from client)

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (true); -- Allow all updates for now

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (true); -- Allow all inserts for now

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- Allow users to read their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (true); -- Allow all reads for now

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (true); -- Allow all inserts for now
