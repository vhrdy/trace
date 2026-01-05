-- ============================================
-- TRACE - Complete Database Schema Migration
-- ============================================
-- This migration creates the entire database schema from scratch
-- Run this on a fresh Supabase project
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PLANS TABLE
-- ============================================
-- Stores plan configurations and limits

CREATE TABLE IF NOT EXISTS plans (
  name TEXT PRIMARY KEY,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default free plan
INSERT INTO plans (name, limits) VALUES
  ('free', '{"max_wallets": 1, "max_scans": 2, "max_exports": 2}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. PROFILES TABLE
-- ============================================
-- User profiles - wallet_address is the primary identifier
-- No dependency on auth.users (wallet-based auth)

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  wallet_address TEXT UNIQUE NOT NULL,
  auth_provider TEXT CHECK (auth_provider IN ('email', 'google', 'solana')),
  plan TEXT DEFAULT 'free' CHECK (plan = 'free'),
  scan_count INTEGER DEFAULT 0,
  export_count INTEGER DEFAULT 0,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  last_export_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

-- ============================================
-- 3. TRANSACTIONS TABLE
-- ============================================
-- Stores transaction data per wallet (one row per wallet)
-- transactions_data is a JSONB array of parsed transactions

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  transactions_data JSONB DEFAULT '[]'::jsonb,
  transaction_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);

-- ============================================
-- 4. REPORTS TABLE (for future use)
-- ============================================
-- Stores generated tax reports

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_addresses TEXT[] NOT NULL,
  year INTEGER NOT NULL,
  country TEXT NOT NULL,
  method TEXT CHECK (method IN ('fifo', 'lifo')) DEFAULT 'fifo',
  total_gains DECIMAL(20, 2) DEFAULT 0,
  total_losses DECIMAL(20, 2) DEFAULT 0,
  net_taxable DECIMAL(20, 2) DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  pdf_url TEXT,
  csv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================
-- 5. PAYMENTS TABLE (for future use)
-- ============================================
-- Stores payment records

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  helio_tx_id TEXT,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_helio_tx_id ON payments(helio_tx_id);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6.1 PROFILES POLICIES
-- ============================================
-- Note: Since we use wallet-based auth without Supabase auth,
-- we use permissive policies. The service role key handles sensitive operations.

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Allow reading profiles (public wallet data)
CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
USING (true);

-- Allow inserting profiles (handled by service role in API)
CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
WITH CHECK (true);

-- Allow updating own profile (identified by wallet)
CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
USING (true);

-- Disallow direct deletion (only via service role)
CREATE POLICY "profiles_delete_policy"
ON profiles FOR DELETE
USING (false);

-- ============================================
-- 6.2 TRANSACTIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_update_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_policy" ON transactions;

-- Allow reading transactions
CREATE POLICY "transactions_select_policy"
ON transactions FOR SELECT
USING (true);

-- Allow inserting transactions (handled by service role in API)
CREATE POLICY "transactions_insert_policy"
ON transactions FOR INSERT
WITH CHECK (true);

-- Allow updating transactions (handled by service role)
CREATE POLICY "transactions_update_policy"
ON transactions FOR UPDATE
USING (true);

-- Disallow direct deletion
CREATE POLICY "transactions_delete_policy"
ON transactions FOR DELETE
USING (false);

-- ============================================
-- 6.3 REPORTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "reports_select_policy" ON reports;
DROP POLICY IF EXISTS "reports_insert_policy" ON reports;
DROP POLICY IF EXISTS "reports_update_policy" ON reports;
DROP POLICY IF EXISTS "reports_delete_policy" ON reports;

-- Allow reading reports
CREATE POLICY "reports_select_policy"
ON reports FOR SELECT
USING (true);

-- Allow inserting reports
CREATE POLICY "reports_insert_policy"
ON reports FOR INSERT
WITH CHECK (true);

-- Allow updating reports
CREATE POLICY "reports_update_policy"
ON reports FOR UPDATE
USING (true);

-- Disallow direct deletion
CREATE POLICY "reports_delete_policy"
ON reports FOR DELETE
USING (false);

-- ============================================
-- 6.4 PAYMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "payments_update_policy" ON payments;
DROP POLICY IF EXISTS "payments_delete_policy" ON payments;

-- Allow reading payments
CREATE POLICY "payments_select_policy"
ON payments FOR SELECT
USING (true);

-- Allow inserting payments
CREATE POLICY "payments_insert_policy"
ON payments FOR INSERT
WITH CHECK (true);

-- Allow updating payments
CREATE POLICY "payments_update_policy"
ON payments FOR UPDATE
USING (true);

-- Disallow direct deletion
CREATE POLICY "payments_delete_policy"
ON payments FOR DELETE
USING (false);

-- ============================================
-- 6.5 PLANS POLICIES
-- ============================================

DROP POLICY IF EXISTS "plans_select_policy" ON plans;
DROP POLICY IF EXISTS "plans_insert_policy" ON plans;
DROP POLICY IF EXISTS "plans_update_policy" ON plans;
DROP POLICY IF EXISTS "plans_delete_policy" ON plans;

-- Allow reading plans (public)
CREATE POLICY "plans_select_policy"
ON plans FOR SELECT
USING (true);

-- Disallow insert/update/delete (admin only via service role)
CREATE POLICY "plans_insert_policy"
ON plans FOR INSERT
WITH CHECK (false);

CREATE POLICY "plans_update_policy"
ON plans FOR UPDATE
USING (false);

CREATE POLICY "plans_delete_policy"
ON plans FOR DELETE
USING (false);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reports.updated_at
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments.updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles identified by Solana wallet address';
COMMENT ON TABLE transactions IS 'Cached transaction data per wallet';
COMMENT ON TABLE reports IS 'Generated tax reports';
COMMENT ON TABLE payments IS 'Payment records for premium features';
COMMENT ON TABLE plans IS 'Available subscription plans and their limits';

COMMENT ON COLUMN profiles.wallet_address IS 'Primary identifier - Solana wallet address';
COMMENT ON COLUMN profiles.plan IS 'User subscription plan (currently only free)';
COMMENT ON COLUMN profiles.scan_count IS 'Number of wallet scans performed';
COMMENT ON COLUMN profiles.export_count IS 'Number of report exports performed';

COMMENT ON COLUMN transactions.transactions_data IS 'JSONB array of parsed transaction objects';
COMMENT ON COLUMN transactions.transaction_count IS 'Total number of transactions';

COMMENT ON COLUMN reports.method IS 'Cost basis calculation method: fifo or lifo';
COMMENT ON COLUMN reports.status IS 'Report generation status';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- To apply this migration:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
--
-- Or use Supabase CLI:
-- npx supabase db push
-- ============================================
