import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get or create usage stats
    const { data: usage, error } = await supabaseAdmin
      .from("usage_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching usage stats:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Create if doesn't exist
    if (!usage) {
      const { data: newUsage, error: createError } = await supabaseAdmin
        .from("usage_stats")
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        console.error("Error creating usage stats:", createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ usage: newUsage });
    }

    return NextResponse.json({ usage });
  } catch (error: any) {
    console.error("Error in get usage API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
