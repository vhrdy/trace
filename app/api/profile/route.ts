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

    // Try to find existing profile by wallet address
    const { data: existing, error: findError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (existing) {
      // Ensure existing profile has free plan
      if (existing.plan !== "free") {
        const { data: updated } = await supabaseAdmin
          .from("profiles")
          .update({ plan: "free" })
          .eq("wallet_address", walletAddress)
          .select("*")
          .single();
        return NextResponse.json({ profile: updated || existing });
      }
      return NextResponse.json({ profile: existing });
    }

    // Create new profile directly (no auth user needed)
    const { data: profile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert({
        wallet_address: walletAddress,
        auth_provider: "solana",
        plan: "free",
      })
      .select("*")
      .single();

    if (createError) {
      console.error("Error creating profile:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
