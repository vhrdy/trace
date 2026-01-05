# Supabase Database Schema

## Tables Overview

### `profiles`
Stores user profile information including subscription plan.
- `id`: UUID (references auth.users)
- `email`: User email
- `wallet_address`: Solana wallet address (unique)
- `auth_provider`: 'email', 'google', or 'solana'
- `plan`: 'free', 'pro', or 'trenchor'
- `plan_started_at`: When the current plan started
- `plan_expires_at`: When the current plan expires
- `created_at`, `updated_at`: Timestamps

### `reports`
Tax reports generated for users.
- `id`: UUID
- `user_id`: References profiles
- `wallet_addresses`: Array of wallet addresses included in report
- `year`: Tax year
- `country`: User's country for tax purposes
- `method`: 'fifo' or 'lifo' cost basis method
- `total_gains`, `total_losses`, `net_taxable`: Calculated amounts
- `trade_count`: Number of trades in report
- `status`: 'pending', 'processing', 'completed', 'failed'
- `pdf_url`, `csv_url`: Links to generated files

### `transactions`
Raw transaction data fetched from blockchain.
- `signature`: Transaction signature (unique)
- `timestamp`: When transaction occurred
- `type`: 'swap', 'transfer', 'nft', 'stake', 'unknown'
- `amount`, `token`, `token_mint`: Transaction details
- `raw_data`: Full transaction data as JSONB

### `report_trades`
Calculated trade data for tax reports.
- `report_id`: References reports
- `tx_signature`: Transaction signature
- `token_in`, `token_out`: Tokens involved
- `usd_value`: USD value at time of trade
- `gain_loss`: Calculated gain/loss
- `cost_basis`: Cost basis for the trade

### `payments`
Payment records for subscriptions and reports.
- `user_id`: References profiles
- `helio_tx_id`: Helio payment transaction ID
- `amount`: Payment amount
- `status`: 'pending', 'completed', 'failed', 'refunded'

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Get API Keys
1. Go to **Settings** → **API**
2. Copy the following to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 3. Apply Database Schema

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire content from `migrations/001_initial_schema.sql`
4. Run the query

**Option B: Via Supabase CLI**
```bash
# Initialize Supabase (if not done)
npx supabase init

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
npx supabase db push
```

### 4. Verify Setup
1. Go to **Table Editor** in Supabase dashboard
2. You should see: `profiles`, `reports`, `transactions`, `report_trades`, `payments`
3. Check that RLS is enabled (shield icon should be on)

## Usage in Code

### Store Transactions
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    user_id: userId,
    wallet_address: walletAddress,
    signature: tx.signature,
    timestamp: new Date(tx.timestamp),
    type: tx.type,
    amount: tx.amount,
    token: tx.token,
    raw_data: tx // Store full transaction as JSONB
  });
```

### Update User Plan
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    plan: 'pro',
    plan_started_at: new Date(),
    plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  })
  .eq('id', userId);
```

### Query User Transactions
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(50);
```

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View/update their own profile
- Create/view/update/delete their own reports
- View/create their own transactions
- View their own payments

## Automatic Features

- **Auto Profile Creation**: When a user signs up, a profile is automatically created
- **Timestamps**: `updated_at` is automatically updated on changes
- **Indexes**: Optimized indexes for common queries
