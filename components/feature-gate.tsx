"use client";

import { ReactNode } from "react";
import { usePlan } from "@/hooks/use-plan";
import Link from "next/link";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const { hasFeature, plan, isLoading } = usePlan();

  if (isLoading) {
    return null;
  }

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgrade) {
      return (
        <div className="border border-muted rounded-lg p-6 bg-muted/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Upgrade Required
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                This feature is not available on your current plan ({plan?.name || "free"}).
              </p>
              <Link
                href="/#pricing"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
