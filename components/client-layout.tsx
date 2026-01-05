"use client";

import { usePathname } from "next/navigation";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import { AuthProvider } from "@/components/auth-provider";
import { PlanProvider } from "@/components/plan-provider";
import { DevTools } from "@/components/dev-tools";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/page-transition";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages without footer
  const hideFooter = pathname === "/login" || pathname?.startsWith("/dashboard");

  return (
    <SolanaWalletProvider>
      <AuthProvider>
        <PlanProvider>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
          {!hideFooter && <Footer />}
        </PlanProvider>
      </AuthProvider>
      <Toaster position="top-right" richColors />
      <DevTools />
    </SolanaWalletProvider>
  );
}
