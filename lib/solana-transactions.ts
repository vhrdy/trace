import { Connection, PublicKey, ParsedTransactionWithMeta, ParsedInstruction } from "@solana/web3.js";

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: "swap" | "transfer" | "nft" | "stake" | "unknown";
  direction: "in" | "out" | "swap"; // IN = reçu, OUT = envoyé, SWAP = échange
  from: string;
  to: string;
  amount: number;
  token: string;
  tokenMint?: string;
  amountUSD?: number;
  fee: number;
  preBalances?: TokenBalance[];
  postBalances?: TokenBalance[];
  description?: string;
}

// Fetch transactions using Helius Enhanced API with pagination
async function fetchWithHeliusAPI(
  walletAddress: string,
  apiKey: string,
  limit: number
): Promise<Transaction[]> {
  try {
    const allTransactions: any[] = [];
    let before: string | undefined;

    console.log(`Using Helius API to fetch up to ${limit} transactions`);

    // Pagination loop
    while (allTransactions.length < limit) {
      const batchLimit = Math.min(100, limit - allTransactions.length);
      const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=${batchLimit}${
        before ? `&before=${before}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        break; // No more transactions
      }

      allTransactions.push(...data);
      before = data[data.length - 1].signature;

      console.log(`Fetched ${data.length} transactions, total: ${allTransactions.length}`);

      // If we got fewer than requested, we've reached the end
      if (data.length < batchLimit) {
        break;
      }
    }

    console.log(`Total transactions from Helius: ${allTransactions.length}`);

    // Parse Helius transactions
    const transactions: Transaction[] = allTransactions
      .map((tx) => parseHeliusTransaction(tx, walletAddress))
      .filter((tx): tx is Transaction => tx !== null);

    console.log(`Successfully parsed ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error("Error fetching from Helius API:", error);
    throw error;
  }
}

// Parse Helius Enhanced API transaction
function parseHeliusTransaction(tx: any, walletAddress: string): Transaction | null {
  try {
    const signature = tx.signature;
    const timestamp = tx.timestamp ? tx.timestamp * 1000 : Date.now();
    const fee = (tx.fee || 0) / 1e9;

    let type: Transaction["type"] = "unknown";
    let amount = 0;
    let token = "SOL";
    let tokenMint: string | undefined;
    let description = tx.description || "";

    // Use Helius type if available
    if (tx.type) {
      const heliusType = tx.type.toLowerCase();

      switch (heliusType) {
        case "swap":
        case "trade":
          type = "swap";
          description = description || "Swap";
          break;
        case "transfer":
        case "sol_transfer":
        case "token_transfer":
          type = "transfer";
          description = description || "Transfer";
          break;
        case "nft_sale":
        case "nft_mint":
        case "nft_bid":
          type = "nft";
          description = description || "NFT Transaction";
          break;
        case "stake":
        case "unstake":
          type = "stake";
          description = description || "Staking";
          break;
        default:
          // Log unknown types to help debugging
          console.warn(`⚠️ Unknown Helius type: "${tx.type}" for tx ${signature.slice(0, 8)}`);
      }

      // Debug: Log source for swaps (Jupiter, Raydium, etc.)
      if (type === "swap" && tx.source) {
        console.log(`🔄 SWAP detected: ${tx.source} - ${description}`);
      }
    }

    // Get token changes from native transfers or token transfers
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const userTransfer = tx.nativeTransfers.find(
        (t: any) => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
      );
      if (userTransfer) {
        amount = Math.abs(userTransfer.amount) / 1e9;
        token = "SOL";
      }
    }

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const userTransfer = tx.tokenTransfers.find(
        (t: any) => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
      );
      if (userTransfer) {
        amount = Math.abs(userTransfer.tokenAmount || 0);
        token = userTransfer.mint?.slice(0, 8) || "TOKEN";
        tokenMint = userTransfer.mint;
      }
    }

    // Extract from/to addresses
    let from = tx.feePayer || "";
    let to = "";
    if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      from = tx.nativeTransfers[0].fromUserAccount || from;
      to = tx.nativeTransfers[0].toUserAccount || "";
    }

    // Determine direction
    let direction: Transaction["direction"] = "swap";

    if (type === "swap") {
      direction = "swap";
    } else if (type === "transfer") {
      // Check native transfers
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        const nativeTransfer = tx.nativeTransfers.find(
          (t: any) => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
        );
        if (nativeTransfer) {
          direction = nativeTransfer.fromUserAccount === walletAddress ? "out" : "in";
        }
      }

      // Check token transfers (override if found)
      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        const tokenTransfer = tx.tokenTransfers.find(
          (t: any) => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
        );
        if (tokenTransfer) {
          direction = tokenTransfer.fromUserAccount === walletAddress ? "out" : "in";
        }
      }
    } else {
      // For NFT, stake, and unknown types, determine based on transfers
      if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
        const nativeTransfer = tx.nativeTransfers.find(
          (t: any) => t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
        );
        if (nativeTransfer) {
          direction = nativeTransfer.fromUserAccount === walletAddress ? "out" : "in";
        }
      }
    }

    return {
      signature,
      timestamp,
      type,
      direction,
      from,
      to,
      amount,
      token,
      tokenMint,
      fee,
      description,
    };
  } catch (error) {
    console.error("Error parsing Helius transaction:", error);
    return null;
  }
}

export async function fetchWalletTransactions(
  walletAddress: string,
  endpoint?: string,
  options: { limit?: number; before?: string } = {}
): Promise<Transaction[]> {
  const { limit = 10 } = options;
  const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

  // Use Helius Enhanced API if available
  if (heliusKey) {
    return fetchWithHeliusAPI(walletAddress, heliusKey, limit);
  }

  // Fallback to standard RPC
  if (!endpoint) {
    endpoint = "https://api.mainnet-beta.solana.com";
  }

  try {
    const connection = new Connection(endpoint, "confirmed");
    const publicKey = new PublicKey(walletAddress);

    // Fetch transaction signatures with pagination
    let allSignatures: any[] = [];
    let before: string | undefined = options.before;

    while (allSignatures.length < limit) {
      const batchLimit = Math.min(50, limit - allSignatures.length);
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: batchLimit,
        before,
      });

      if (signatures.length === 0) break;

      allSignatures.push(...signatures);
      before = signatures[signatures.length - 1].signature;

      // If we got fewer than requested, we've reached the end
      if (signatures.length < batchLimit) break;
    }

    console.log(`Fetching ${allSignatures.length} signatures for ${walletAddress}`);

    // Fetch full transaction details in batches
    const transactions: Transaction[] = [];
    const BATCH_SIZE = 10;
    let successCount = 0;
    let errorCount = 0;
    let nullCount = 0;

    for (let i = 0; i < allSignatures.length; i += BATCH_SIZE) {
      const batch = allSignatures.slice(i, i + BATCH_SIZE);

      const txPromises = batch.map(async (sig) => {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx) {
            console.log(`Transaction not found: ${sig.signature}`);
            nullCount++;
            return null;
          }

          if (tx.meta?.err) {
            console.log(`Transaction with error: ${sig.signature}`, tx.meta.err);
            errorCount++;
            // Still parse failed transactions to show them
          }

          const parsed = parseTransaction(tx, walletAddress);
          if (parsed) {
            successCount++;
          } else {
            nullCount++;
            console.log(`Failed to parse transaction: ${sig.signature}`);
          }
          return parsed;
        } catch (error) {
          console.error(`Error fetching transaction ${sig.signature}:`, error);
          errorCount++;
          return null;
        }
      });

      const batchResults = await Promise.all(txPromises);
      transactions.push(...batchResults.filter((tx): tx is Transaction => tx !== null));

      // Small delay to avoid rate limiting
      if (i + BATCH_SIZE < allSignatures.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Results: ${successCount} parsed, ${errorCount} errors, ${nullCount} null, ${transactions.length} total`);
    return transactions;
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
}

// Known program IDs
const PROGRAM_IDS = {
  JUPITER_V6: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  JUPITER_V4: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
  RAYDIUM_AMM: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  ORCA_WHIRLPOOL: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
  TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  METAPLEX: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  STAKE: "Stake11111111111111111111111111111111111111",
};

function parseTransaction(
  tx: ParsedTransactionWithMeta,
  walletAddress: string
): Transaction | null {
  try {
    const signature = tx.transaction.signatures[0];
    const timestamp = tx.blockTime ? tx.blockTime * 1000 : Date.now();
    const fee = tx.meta?.fee || 0;

    const accountKeys = tx.transaction.message.accountKeys;
    const instructions = tx.transaction.message.instructions;

    // Get SOL balance changes
    const preBalances = tx.meta?.preBalances || [];
    const postBalances = tx.meta?.postBalances || [];
    const walletIndex = accountKeys.findIndex(
      (key) => key.pubkey.toString() === walletAddress
    );

    if (walletIndex === -1) {
      console.log(`Wallet ${walletAddress} not found in transaction ${signature}`);
      // Don't return null, continue with default values
    }

    const solBalanceChange = walletIndex !== -1
      ? (postBalances[walletIndex] || 0) - (preBalances[walletIndex] || 0)
      : 0;

    // Get token balance changes
    const preTokenBalances = tx.meta?.preTokenBalances || [];
    const postTokenBalances = tx.meta?.postTokenBalances || [];

    // Determine transaction type and details
    let type: Transaction["type"] = "unknown";
    let amount = 0;
    let token = "SOL";
    let tokenMint: string | undefined;
    let description = "";

    // Check for swaps
    const hasJupiter = instructions.some((ix) =>
      "programId" in ix && (
        ix.programId.toString() === PROGRAM_IDS.JUPITER_V6 ||
        ix.programId.toString() === PROGRAM_IDS.JUPITER_V4
      )
    );

    const hasRaydium = instructions.some((ix) =>
      "programId" in ix && ix.programId.toString() === PROGRAM_IDS.RAYDIUM_AMM
    );

    const hasOrca = instructions.some((ix) =>
      "programId" in ix && ix.programId.toString() === PROGRAM_IDS.ORCA_WHIRLPOOL
    );

    if (hasJupiter || hasRaydium || hasOrca) {
      type = "swap";

      // Try to determine swap details from token balance changes
      const tokenChanges = analyzeTokenBalanceChanges(
        preTokenBalances,
        postTokenBalances,
        walletAddress
      );

      if (tokenChanges.length > 0) {
        // First change is usually the "from" token
        const fromToken = tokenChanges[0];
        amount = Math.abs(fromToken.amount);
        tokenMint = fromToken.mint;
        token = fromToken.symbol || fromToken.mint.slice(0, 8);
        description = hasJupiter ? "Jupiter Swap" : hasRaydium ? "Raydium Swap" : "Orca Swap";
      } else if (solBalanceChange !== 0) {
        amount = Math.abs(solBalanceChange) / 1e9;
        token = "SOL";
      }
    }
    // Check for NFT transactions
    else if (instructions.some((ix) =>
      "programId" in ix && ix.programId.toString() === PROGRAM_IDS.METAPLEX
    )) {
      type = "nft";
      amount = Math.abs(solBalanceChange) / 1e9;
      description = "NFT Transaction";
    }
    // Check for staking
    else if (instructions.some((ix) =>
      "programId" in ix && ix.programId.toString() === PROGRAM_IDS.STAKE
    )) {
      type = "stake";
      amount = Math.abs(solBalanceChange) / 1e9;
      description = "Staking Transaction";
    }
    // Token transfer
    else if (preTokenBalances.length > 0 || postTokenBalances.length > 0) {
      const tokenChanges = analyzeTokenBalanceChanges(
        preTokenBalances,
        postTokenBalances,
        walletAddress
      );

      if (tokenChanges.length > 0) {
        type = "transfer";
        const change = tokenChanges[0];
        amount = Math.abs(change.amount);
        tokenMint = change.mint;
        token = change.symbol || change.mint.slice(0, 8);
        description = "Token Transfer";
      }
    }
    // SOL transfer
    else if (solBalanceChange !== 0) {
      type = "transfer";
      amount = Math.abs(solBalanceChange) / 1e9;
      token = "SOL";
      description = "SOL Transfer";
    }

    // Extract from/to addresses
    let from = "";
    let to = "";
    if (accountKeys.length > 1) {
      from = accountKeys[0].pubkey.toString();
      to = accountKeys[1]?.pubkey.toString() || "";
    }

    // Determine direction
    let direction: Transaction["direction"] = "swap";

    if (type === "swap") {
      direction = "swap";
    } else if (type === "transfer") {
      // For transfers, check if SOL balance went up or down
      if (solBalanceChange > 0) {
        direction = "in";
      } else if (solBalanceChange < 0) {
        direction = "out";
      } else {
        // No SOL change, check token balances
        const tokenChanges = analyzeTokenBalanceChanges(
          preTokenBalances,
          postTokenBalances,
          walletAddress
        );
        if (tokenChanges.length > 0) {
          direction = tokenChanges[0].amount > 0 ? "in" : "out";
        }
      }
    } else {
      // For NFT, stake, and unknown types
      if (solBalanceChange > 0) {
        direction = "in";
      } else if (solBalanceChange < 0) {
        direction = "out";
      }
    }

    return {
      signature,
      timestamp,
      type,
      direction,
      from,
      to,
      amount,
      token,
      tokenMint,
      fee: fee / 1e9,
      description,
    };
  } catch (error) {
    console.error("Error parsing transaction:", error);
    return null;
  }
}

function analyzeTokenBalanceChanges(
  preBalances: any[],
  postBalances: any[],
  walletAddress: string
): { mint: string; amount: number; decimals: number; symbol?: string }[] {
  const changes: { mint: string; amount: number; decimals: number; symbol?: string }[] = [];

  // Group balances by mint
  const mintBalances = new Map<string, { pre: number; post: number; decimals: number }>();

  preBalances.forEach((balance) => {
    if (balance.owner === walletAddress) {
      const mint = balance.mint;
      const amount = balance.uiTokenAmount?.uiAmount || 0;
      const decimals = balance.uiTokenAmount?.decimals || 0;
      mintBalances.set(mint, { pre: amount, post: 0, decimals });
    }
  });

  postBalances.forEach((balance) => {
    if (balance.owner === walletAddress) {
      const mint = balance.mint;
      const amount = balance.uiTokenAmount?.uiAmount || 0;
      const decimals = balance.uiTokenAmount?.decimals || 0;
      const existing = mintBalances.get(mint);
      if (existing) {
        existing.post = amount;
      } else {
        mintBalances.set(mint, { pre: 0, post: amount, decimals });
      }
    }
  });

  mintBalances.forEach((balance, mint) => {
    const change = balance.post - balance.pre;
    if (change !== 0) {
      changes.push({
        mint,
        amount: change,
        decimals: balance.decimals,
      });
    }
  });

  return changes;
}

export function categorizeTransactions(transactions: Transaction[]) {
  const trades = transactions.filter((tx) => tx.type === "swap");
  const transfers = transactions.filter((tx) => tx.type === "transfer");
  const nfts = transactions.filter((tx) => tx.type === "nft");
  const stakes = transactions.filter((tx) => tx.type === "stake");
  const unknown = transactions.filter((tx) => tx.type === "unknown");

  return {
    all: transactions,
    trades,
    transfers,
    nfts,
    stakes,
    unknown,
    stats: {
      total: transactions.length,
      trades: trades.length,
      transfers: transfers.length,
      nfts: nfts.length,
      stakes: stakes.length,
      unknown: unknown.length,
    },
  };
}
