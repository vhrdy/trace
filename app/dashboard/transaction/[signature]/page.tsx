"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const signature = params.signature as string;

  const [transaction, setTransaction] = useState<ParsedTransactionWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (signature) {
      fetchTransactionDetails();
    }
  }, [signature, isAuthenticated, router]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
      const endpoint = heliusKey
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : "https://api.mainnet-beta.solana.com";

      const connection = new Connection(endpoint, "confirmed");
      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      setTransaction(tx);
    } catch (error) {
      console.error("Error fetching transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-muted border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Transaction Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The transaction could not be found or loaded.
            </p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const date = transaction.blockTime
    ? new Date(transaction.blockTime * 1000)
    : null;
  const fee = (transaction.meta?.fee || 0) / 1e9;
  const status = transaction.meta?.err ? "Failed" : "Success";

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Transaction Details</h1>
        </div>

        {/* Status Card */}
        <div className=" border border-muted rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Status</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === "Success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </span>
          </div>
          {date && (
            <p className="text-sm text-muted-foreground">
              {date.toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Signature Card */}
        <div className=" border border-muted rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Signature</h2>
          <div className="flex items-center justify-between gap-4">
            <code className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1 break-all">
              {signature}
            </code>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(signature)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <a
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Account Keys */}
        <div className=" border border-muted rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Keys ({transaction.transaction.message.accountKeys.length})
          </h2>
          <div className="space-y-2">
            {transaction.transaction.message.accountKeys.map((key, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-muted last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{index}
                  </span>
                  <code className="text-sm font-mono">{key.pubkey.toString()}</code>
                </div>
                <div className="flex gap-2">
                  {key.signer && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Signer
                    </span>
                  )}
                  {key.writable && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                      Writable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Changes */}
        {transaction.meta && (
          <>
            {/* SOL Balance Changes */}
            {transaction.meta.preBalances && transaction.meta.postBalances && (
              <div className=" border border-muted rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  SOL Balance Changes
                </h2>
                <div className="space-y-2">
                  {transaction.meta.preBalances.map((preBalance, index) => {
                    const postBalance = transaction.meta!.postBalances[index];
                    const change = (postBalance - preBalance) / 1e9;
                    if (change === 0) return null;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                      >
                        <code className="text-sm font-mono">
                          {transaction.transaction.message.accountKeys[index]?.pubkey.toString()}
                        </code>
                        <span
                          className={`text-sm font-medium ${
                            change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(9)} SOL
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Token Balance Changes */}
            {transaction.meta.preTokenBalances && transaction.meta.postTokenBalances && (
              <div className=" border border-muted rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Token Balance Changes
                </h2>
                <div className="space-y-4">
                  {transaction.meta.postTokenBalances.map((postBalance, index) => {
                    const preBalance = transaction.meta!.preTokenBalances?.find(
                      (pre) => pre.accountIndex === postBalance.accountIndex
                    );
                    const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
                    const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;
                    const change = postAmount - preAmount;

                    if (change === 0 && preAmount === 0) return null;

                    return (
                      <div
                        key={index}
                        className="border border-muted rounded p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            Account #{postBalance.accountIndex}
                          </span>
                          {change !== 0 && (
                            <span
                              className={`text-sm font-medium ${
                                change > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {change > 0 ? "+" : ""}
                              {change.toFixed(6)}
                            </span>
                          )}
                        </div>
                        <code className="text-xs font-mono text-muted-foreground">
                          {postBalance.mint}
                        </code>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        <div className=" border border-muted rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Instructions ({transaction.transaction.message.instructions.length})
          </h2>
          <div className="space-y-4">
            {transaction.transaction.message.instructions.map((instruction, index) => (
              <div key={index} className="border border-muted rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  {"programId" in instruction && (
                    <code className="text-xs font-mono text-primary">
                      {instruction.programId.toString()}
                    </code>
                  )}
                </div>
                {"parsed" in instruction && instruction.parsed ? (
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(instruction.parsed, null, 2)}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground">Raw instruction data</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fee and Slot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className=" border border-muted rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Transaction Fee</h2>
            <p className="text-3xl font-bold text-primary">{fee.toFixed(9)} SOL</p>
          </div>
          <div className=" border border-muted rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Slot</h2>
            <p className="text-3xl font-bold text-foreground">{transaction.slot}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
