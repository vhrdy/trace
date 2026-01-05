import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get transactions for this wallet
    const { data: transactionsRow, error } = await supabaseAdmin
      .from("transactions")
      .select("transactions_data, last_updated")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // No data yet for this wallet
    if (!transactionsRow || !transactionsRow.transactions_data) {
      return NextResponse.json({
        transactions: [],
        last_updated: null,
      });
    }

    // Return all transactions (no date filtering)
    return NextResponse.json({
      transactions: transactionsRow.transactions_data,
      last_updated: transactionsRow.last_updated,
    });
  } catch (error: any) {
    console.error("Error in get transactions API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
