"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

export type Plan = "free" | "pro" | "trenchor";

export interface PlanLimits {
  maxScans: number;
  maxExports: number;
  maxWallets: number;
}

export interface UsageStats {
  scanCount: number;
  exportCount: number;
  scansRemaining: number;
  exportsRemaining: number;
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxScans: 2,
    maxExports: 2,
    maxWallets: 1,
  },
  pro: {
    maxScans: 999999,
    maxExports: 999999,
    maxWallets: 5,
  },
  trenchor: {
    maxScans: 999999,
    maxExports: 999999,
    maxWallets: 999999,
  },
};

export function usePlan() {
  const { publicKey } = useWallet();
  const [plan, setPlan] = useState<Plan>("free");
  const [usage, setUsage] = useState<UsageStats>({
    scanCount: 0,
    exportCount: 0,
    scansRemaining: 2,
    exportsRemaining: 2,
  });
  const [loading, setLoading] = useState(true);

  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    if (publicKey) {
      loadPlanAndUsage();
    } else {
      setLoading(false);
    }
  }, [publicKey]);

  const loadPlanAndUsage = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, scan_count, export_count")
        .eq("wallet_address", publicKey.toString())
        .maybeSingle();

      if (error) {
        console.error("Error loading plan:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("No profile found, using default free plan");
        setLoading(false);
        return;
      }

      if (data) {
        const userPlan = (data.plan || "free") as Plan;
        const scanCount = data.scan_count || 0;
        const exportCount = data.export_count || 0;
        const planLimits = PLAN_LIMITS[userPlan];

        setPlan(userPlan);
        setUsage({
          scanCount,
          exportCount,
          scansRemaining: Math.max(0, planLimits.maxScans - scanCount),
          exportsRemaining: Math.max(0, planLimits.maxExports - exportCount),
        });
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const canScan = () => {
    if (plan === "free") {
      return usage.scanCount < limits.maxScans;
    }
    return true;
  };

  const canExport = () => {
    if (plan === "free") {
      return usage.exportCount < limits.maxExports;
    }
    return true;
  };

  const incrementScan = async () => {
    if (!publicKey) return false;

    try {
      const newCount = usage.scanCount + 1;

      const { error } = await supabase
        .from("profiles")
        .update({
          scan_count: newCount,
          last_scan_at: new Date().toISOString(),
        })
        .eq("wallet_address", publicKey.toString());

      if (error) {
        console.error("Error incrementing scan count:", error);
        return false;
      }

      setUsage(prev => ({
        ...prev,
        scanCount: newCount,
        scansRemaining: Math.max(0, limits.maxScans - newCount),
      }));

      return true;
    } catch (error) {
      console.error("Error incrementing scan:", error);
      return false;
    }
  };

  const incrementExport = async () => {
    if (!publicKey) return false;

    try {
      const newCount = usage.exportCount + 1;

      const { error } = await supabase
        .from("profiles")
        .update({
          export_count: newCount,
          last_export_at: new Date().toISOString(),
        })
        .eq("wallet_address", publicKey.toString());

      if (error) {
        console.error("Error incrementing export count:", error);
        return false;
      }

      setUsage(prev => ({
        ...prev,
        exportCount: newCount,
        exportsRemaining: Math.max(0, limits.maxExports - newCount),
      }));

      return true;
    } catch (error) {
      console.error("Error incrementing export:", error);
      return false;
    }
  };

  return {
    plan,
    limits,
    usage,
    loading,
    canScan,
    canExport,
    incrementScan,
    incrementExport,
    refresh: loadPlanAndUsage,
  };
}
