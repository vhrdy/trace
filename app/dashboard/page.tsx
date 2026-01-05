"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWalletTransactions, categorizeTransactions, Transaction } from "@/lib/solana-transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth-provider";
import { getUserTransactionsFromCache, storeTransactions } from "@/lib/supabase-helpers";
import { getOrCreateProfile } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, scaleIn, fadeInUp } from "@/components/page-transition";
import { exportTransactionsToCSV } from "@/lib/csv-export";
import { usePlan } from "@/components/plan-provider";

type FilterType = "all" | "swap" | "transfer" | "nft" | "stake";
type SortType = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { plan, limits, usage, loading: planLoading, canScan, canExport, incrementScan, incrementExport } = usePlan();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("date_desc");
  const [stats, setStats] = useState({
    total: 0,
    trades: 0,
    transfers: 0,
    nfts: 0,
    stakes: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load transactions from Supabase on mount
  useEffect(() => {
    if (publicKey) {
      loadTransactionsFromDB();
    }
  }, [publicKey]);

  const loadTransactionsFromDB = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const cachedTransactions = await getUserTransactionsFromCache(
        publicKey.toString()
      );

      console.log("📊 Loaded from cache:", cachedTransactions.length, "transactions");

      if (cachedTransactions.length > 0) {
        console.log("🔍 First transaction:", cachedTransactions[0]);
        console.log("🔍 Last transaction:", cachedTransactions[cachedTransactions.length - 1]);
      }

      // Transactions are already in the correct format
      const txs: Transaction[] = cachedTransactions as Transaction[];

      // Filter out small transfers
      const filteredTxs = txs.filter(tx => {
        if (tx.type === "transfer" && tx.token === "SOL" && tx.amount < 0.01) {
          return false;
        }
        return true;
      });

      console.log("🔍 After filtering:", filteredTxs.length);

      const categorized = categorizeTransactions(filteredTxs);
      setTransactions(filteredTxs);
      setStats(categorized.stats);
    } catch (error) {
      console.error("Error loading transactions from cache:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanTransactions = async () => {
    if (!publicKey) return;

    // Check plan limits
    if (planLoading) {
      toast.error("Loading your plan... Please wait.");
      return;
    }

    if (!canScan()) {
      toast.error(`Scan limit reached! You've used ${usage.scanCount}/${limits.maxScans} scans.`, {
        description: "Upgrade to Pro for unlimited scans",
        duration: 5000,
      });
      return;
    }

    setScanning(true);
    setScanProgress(0);

    try {
      console.log("🔍 Starting scan for wallet:", publicKey.toString());

      setScanProgress(5);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI update

      // Get profile to get user_id
      const profile = await getOrCreateProfile(publicKey.toString());
      if (!profile) {
        toast.error("Failed to get profile");
        setScanning(false);
        return;
      }

      setScanProgress(15);
      console.log("👤 Profile found:", profile.id);

      setScanProgress(25);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI update

      // Fetch transactions from Helius (no date limit, fetch all)
      console.log("📡 Fetching transactions from Helius...");
      setScanProgress(30);

      const txs = await fetchWalletTransactions(
        publicKey.toString(),
        undefined,
        { limit: 1000 }
      );

      setScanProgress(65);
      console.log("📥 Fetched from Helius:", txs.length, "transactions");

      setScanProgress(75);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI update

      // Store in Supabase
      console.log("💾 Storing transactions in database...");
      const stored = await storeTransactions(
        profile.id,
        publicKey.toString(),
        txs
      );

      if (stored) {
        setScanProgress(85);
        console.log("💾 Transactions stored successfully");

        // Wait a bit for DB to settle
        await new Promise(resolve => setTimeout(resolve, 300));

        setScanProgress(92);

        // Reload from cache
        await loadTransactionsFromDB();

        setScanProgress(95);

        // Increment scan count
        const incremented = await incrementScan();
        if (!incremented) {
          console.error("Failed to increment scan count");
        }

        setScanProgress(100);

        toast.success(`Scanned and stored ${txs.length} transactions!`, {
          description: `Scans remaining: ${usage.scansRemaining - 1}/${limits.maxScans}`,
        });

        // Reset progress after a short delay
        setTimeout(() => setScanProgress(0), 500);
      } else {
        console.error("❌ Failed to store transactions");
        toast.error("Failed to store transactions");
      }
    } catch (error) {
      console.error("Error scanning transactions:", error);
      toast.error("Failed to scan transactions. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = transactions;

    // Apply filter
    if (filterType !== "all") {
      filtered = transactions.filter(tx => tx.type === filterType);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case "date_desc":
          return b.timestamp - a.timestamp;
        case "date_asc":
          return a.timestamp - b.timestamp;
        case "amount_desc":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const handleGenerateReport = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    // Check plan limits
    if (planLoading) {
      toast.error("Loading your plan... Please wait.");
      return;
    }

    if (!canExport()) {
      toast.error(`Export limit reached! You've used ${usage.exportCount}/${limits.maxExports} exports.`, {
        description: "Upgrade to Pro for unlimited exports",
        duration: 5000,
      });
      return;
    }

    try {
      exportTransactionsToCSV(transactions, publicKey.toString());

      // Increment export count
      const incremented = await incrementExport();
      if (!incremented) {
        console.error("Failed to increment export count");
      }

      toast.success(`Exported ${transactions.length} transactions to CSV!`, {
        description: `Exports remaining: ${usage.exportsRemaining - 1}/${limits.maxExports}`,
      });
    } catch (error) {
      console.error("Error generating CSV:", error);
      toast.error("Failed to generate CSV report");
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Progress Bar */}
      {scanning && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={scanProgress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Connected: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={scaleIn} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardDescription>Total Transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardDescription>Trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.trades}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardDescription>Transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.transfers}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardDescription>NFTs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.nfts}</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle>Your Transactions</CardTitle>
              {transactions.length > 0 && (
                <CardDescription>
                  Loaded {transactions.length} transactions from database
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {/* Usage Stats */}
              {!planLoading && plan === "free" && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex justify-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Scans</p>
                      <p className="text-lg font-semibold">
                        {usage.scanCount}/{limits.maxScans}
                      </p>
                      {usage.scansRemaining === 0 && (
                        <p className="text-xs text-destructive mt-1">Limit reached</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Exports</p>
                      <p className="text-lg font-semibold">
                        {usage.exportCount}/{limits.maxExports}
                      </p>
                      {usage.exportsRemaining === 0 && (
                        <p className="text-xs text-destructive mt-1">Limit reached</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleScanTransactions}
                    disabled={scanning || loading || planLoading || !canScan()}
                    size="lg"
                    className="min-w-[250px]"
                  >
                    {scanning ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Scanning...
                      </span>
                    ) : !canScan() ? (
                      "Scan Limit Reached"
                    ) : (
                      "Scan for New Transactions"
                    )}
                  </Button>
                </motion.div>
                {transactions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGenerateReport}
                      disabled={planLoading || !canExport()}
                    >
                      {!canExport() ? "Export Limit Reached" : "Generate CSV Report"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.645, 0.045, 0.355, 1.0] }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Recent Transactions</CardTitle>

                  <div className="flex flex-wrap gap-3">
                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant={filterType === "all" ? "accent" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("all")}
                      >
                        All ({stats.total})
                      </Button>
                      <Button
                        variant={filterType === "swap" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("swap")}
                      >
                        Trades ({stats.trades})
                      </Button>
                      <Button
                        variant={filterType === "transfer" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("transfer")}
                      >
                        Transfers ({stats.transfers})
                      </Button>
                    </div>

                    {/* Sort Dropdown */}
                    <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">Date (Newest)</SelectItem>
                        <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                        <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredAndSortedTransactions().slice(0, 50).map((tx) => (
                      <TableRow key={tx.signature}>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tx.type === "swap" ? "default" : "secondary"}
                            className="w-[65px] justify-center"
                          >
                            {tx.type === "swap" ? "trade" : tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.direction === "in" && "↓ IN"}
                          {tx.direction === "out" && "↑ OUT"}
                          {tx.direction === "swap" && "⇄ SWAP"}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {tx.description || "Transaction"}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.amount.toFixed(4)} {tx.token}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/transaction/${tx.signature}`}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            View Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              {getFilteredAndSortedTransactions().length > 50 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Showing 50 of {getFilteredAndSortedTransactions().length} transactions
                </p>
              )}
              {getFilteredAndSortedTransactions().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found for this filter
                </p>
              )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
