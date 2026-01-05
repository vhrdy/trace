## Branding
- Read marketing.md for name, tagline, colors and visual direction
- Apply this branding consistently across all pages
- Font: font-sans (Geist or Inter)
- Tone: pro but friendly, not boring corporate

Create a Next.js 14 (app router) crypto tax report app with Supabase, Tailwind and shadcn/ui.

## Branding
- Name: [REPLACE]
- Tagline: [REPLACE]
- Palette: [REPLACE]
- Font: font-sans (Geist or Inter)
- Tone: pro but friendly, not boring corporate

## Stack
- Next.js 14 app router
- Supabase (auth + DB)
- Tailwind CSS
- shadcn/ui (custom theme)
- Helius API (fetch transactions)
- CoinGecko API (historical prices)
- @react-pdf/renderer (PDF generation)
- Helio (payments)

## Auth
- Google OAuth
- Email magic link
- Solana wallet (sign message)

## Database Schema

profiles:
- id (uuid, references auth.users)
- email (text)
- wallet_address (text)
- auth_provider (text)
- created_at (timestamp)

reports:
- id (uuid)
- user_id (uuid, references profiles)
- wallet_addresses (text[], wallet array)
- year (integer)
- country (text)
- method (text: 'fifo', 'lifo')
- total_gains (decimal)
- total_losses (decimal)
- net_taxable (decimal)
- trade_count (integer)
- status (text: 'pending', 'processing', 'completed', 'failed')
- pdf_url (text)
- csv_url (text)
- created_at (timestamp)

report_trades:
- id (uuid)
- report_id (uuid, references reports)
- tx_signature (text)
- date (timestamp)
- type (text: 'swap', 'transfer', 'airdrop', 'nft_sale')
- token_in (text)
- token_in_amount (decimal)
- token_out (text)
- token_out_amount (decimal)
- usd_value (decimal)
- gain_loss (decimal)
- cost_basis (decimal)
- notes (text)

payments:
- id (uuid)
- user_id (uuid, references profiles)
- report_id (uuid, references reports)
- helio_tx_id (text)
- amount (decimal)
- status (text)
- created_at (timestamp)

## Pages

### Landing / (public)
- Hero: catchy title + tagline
- 3 steps: Paste wallet → Select year → Get report
- Features section: FIFO/LIFO, multi-wallet, all DEXs supported
- Pricing: $20 per report
- FAQ: common tax questions
- Footer

### /new (public)
Step 1:
- Wallet address input (can add multiple)
- "Add another wallet" button
- Solana wallet format validation

Step 2:
- Select tax year (2024, 2023, 2022)
- Select country (France, USA, Germany, UK, Other)
- Select method (FIFO recommended, LIFO)

Step 3:
- "Analyze" button
- Loading with progress: "Fetching transactions...", "Calculating gains...", "Building report..."

### /preview/[id] (public, after analysis)
- Summary card:
  - Total gains (green)
  - Total losses (red)
  - Net taxable
  - Number of trades
- Top 5 winners (tokens)
- Top 5 losers (tokens)
- Preview table (first 10 rows blurred if not paid)
- Warnings: trades needing manual review
- CTA: "Get full report - $20"

### /login
- Google
- Email magic link
- Solana wallet

### /checkout/[report_id]
- Order summary
- Pay with Helio button ($20 USDC)
- Redirect to Helio Pay Link with report_id metadata

### /success
- Payment confirmation
- Download PDF + CSV buttons
- Dashboard link

### /dashboard (auth required)
- List of generated reports
- Status: completed, processing
- Actions: download PDF, download CSV, delete
- "New report" button

### /api routes
- /api/analyze: receives wallet(s) + year, fetches Helius, calculates, creates report
- /api/webhooks/helio: receives payment, updates status, generates PDF/CSV
- /api/download/[report_id]/pdf: generates and returns PDF
- /api/download/[report_id]/csv: generates and returns CSV

## Tax Calculation Logic

### Fetch transactions
- Use Helius Enhanced Transactions API
- Filter by year (timestamp)
- Parse types: SWAP, TRANSFER, NFT_SALE
- Identify DEX: Jupiter, Raydium, Pump.fun, Orca

### Calculate gains/losses
- FIFO (First In First Out) by default
- For each sale:
  - Find cost basis (purchase price)
  - Gain/loss = sale price - cost basis
- Handle partial sells
- Ignore dust (< $0.50)
- Flag transfers (not taxable, but track)
- Flag airdrops (income at received price)

### Historical prices
- CoinGecko API for USD price at each tx date
- Cache prices in DB to avoid rate limits
- Fallback: Jupiter price if token not on CoinGecko

## PDF Report (react-pdf)

Page 1: Summary
- Logo + app name
- "Tax Report [Year]"
- Wallet(s): truncated addresses
- Generated: date
- Summary table: gains, losses, net

Page 2+: Trade details
- Table: Date, Type, Token In, Token Out, USD Value, Gain/Loss
- Monthly subtotals

Last page:
- Disclaimer: "This report is for informational purposes only. Consult a tax professional."
- Method used (FIFO/LIFO)
- Verification link

## CSV Export
Columns:
- date
- type
- token_sold
- amount_sold
- token_received
- amount_received
- usd_value
- cost_basis
- gain_loss
- tx_signature

## Security
- Supabase RLS on all tables
- Users can only access their own reports
- Rate limit on /api/analyze (5/hour per IP)
- Zod validation on all inputs
- Helio webhook: verify signature

## File structure
/app
  page.tsx (landing)
  /new/page.tsx
  /preview/[id]/page.tsx
  /login/page.tsx
  /checkout/[id]/page.tsx
  /success/page.tsx
  /dashboard/page.tsx
  /api
    /analyze/route.ts
    /webhooks/helio/route.ts
    /download/[id]/pdf/route.ts
    /download/[id]/csv/route.ts
/components
  /ui (shadcn)
  wallet-input.tsx
  report-summary.tsx
  trades-table.tsx
  pdf-template.tsx
/lib
  supabase.ts
  helius.ts
  coingecko.ts
  tax-calculator.ts
  pdf-generator.ts

## Packages
@react-pdf/renderer, @upstash/ratelimit, @upstash/redis, zod, date-fns

Start with project setup + landing page + /new flow with 3 steps.