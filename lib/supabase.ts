import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types (generated from Supabase schema)
export type Profile = {
  id: string;
  email: string | null;
  wallet_address: string | null;
  auth_provider: "email" | "google" | "solana" | null;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string;
  wallet_addresses: string[];
  year: number;
  country: string;
  method: "fifo" | "lifo";
  total_gains: number;
  total_losses: number;
  net_taxable: number;
  trade_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  pdf_url: string | null;
  csv_url: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionDB = {
  id: string;
  user_id: string;
  wallet_address: string;
  signature: string;
  timestamp: string;
  type: "swap" | "transfer" | "nft" | "stake" | "unknown";
  from_address: string | null;
  to_address: string | null;
  amount: number | null;
  token: string | null;
  token_mint: string | null;
  fee: number | null;
  description: string | null;
  raw_data: any;
  created_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  report_id: string | null;
  helio_tx_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata: any;
  created_at: string;
  updated_at: string;
};
