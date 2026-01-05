import { supabase, Profile, TransactionDB } from "./supabase";
import { Transaction } from "./solana-transactions";

/**
 * Get or create user profile
 */
export async function getOrCreateProfile(walletAddress: string): Promise<Profile | null> {
  try {
    // Try to find existing profile by wallet address
    const { data: existing, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (existing) {
      return existing;
    }

    // If not found, call API route to create profile (uses service role key)
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error creating profile:", error);
      return null;
    }

    const { profile } = await response.json();
    return profile;
  } catch (error) {
    console.error("Error in getOrCreateProfile:", error);
    return null;
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Store transactions in database (via API route to bypass RLS)
 */
export async function storeTransactions(
  userId: string,
  walletAddress: string,
  transactions: Transaction[]
): Promise<boolean> {
  try {
    const response = await fetch("/api/transactions/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        transactions,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error storing transactions:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in storeTransactions:", error);
    return false;
  }
}

/**
 * Get user transactions from database
 */
export async function getUserTransactions(
  walletAddress: string,
  limit = 1000
): Promise<TransactionDB[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Get user transactions from transactions table (via API)
 */
export async function getUserTransactionsFromCache(
  walletAddress: string
): Promise<any[]> {
  try {
    const response = await fetch("/api/transactions/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error fetching transactions:", error);
      return [];
    }

    const { transactions } = await response.json();
    return transactions || [];
  } catch (error) {
    console.error("Error in getUserTransactionsFromCache:", error);
    return [];
  }
}

/**
 * Get transaction count for user
 */
export async function getUserTransactionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error counting transactions:", error);
    return 0;
  }

  return count || 0;
}
