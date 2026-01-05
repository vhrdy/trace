"use client";

import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { usePlan } from "@/components/plan-provider";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const { plan, limits, usage, loading } = usePlan();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bg-background top-0 w-full border-b border-muted z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">trace.</span>
          </Link>

          {/* Navigation Links - Only when not authenticated */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                {!loading && plan === "free" && usage && limits && (
                  <div className="text-xs text-muted-foreground">
                    {usage.scanCount}/{limits.maxScans} scans • {usage.exportCount}/{limits.maxExports} exports
                  </div>
                )}
                <WalletConnectButton />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
