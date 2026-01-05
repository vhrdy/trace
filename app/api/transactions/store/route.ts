import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Transaction } from "@/lib/solana-transactions";

// Create a Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, transactions } = await request.json();

    if (!walletAddress || !transactions) {
      return NextResponse.json(
        { error: "Wallet address and transactions are required" },
        { status: 400 }
      );
    }

    // Get profile to get user_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Upsert transactions data (single row per wallet)
    const { error: upsertError } = await supabaseAdmin
      .from("transactions")
      .upsert(
        {
          user_id: profile.id,
          wallet_address: walletAddress,
          transactions_data: transactions,
          transaction_count: transactions.length,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        }
      );

    if (upsertError) {
      console.error("Error storing transactions:", upsertError);
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: transactions.length,
    });
  } catch (error: any) {
    console.error("Error in store transactions API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
