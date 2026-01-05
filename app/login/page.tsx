"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useAuth } from "@/components/auth-provider";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, scaleIn } from "@/components/page-transition";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to dashboard only when authenticated
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <motion.div
            className=" border border-muted rounded-lg p-8 shadow-sm"
            variants={scaleIn}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="text-center mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.h1
                variants={staggerItem}
                className="text-3xl font-bold text-foreground mb-2"
              >
                Welcome to Trace
              </motion.h1>
              <motion.p
                variants={staggerItem}
                className="text-muted-foreground"
              >
                Connect your Solana wallet to get started
              </motion.p>
            </motion.div>

            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Wallet Connect Button */}
              <motion.div variants={staggerItem} className="flex flex-col gap-4">
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <WalletConnectButton />
                </motion.div>

                <motion.div variants={staggerItem} className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className=" px-2 text-muted-foreground">
                      How it works
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="space-y-4 text-sm"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={staggerItem} className="flex gap-3">
                    <motion.div
                      className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-primary font-semibold text-xs">1</span>
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground">Connect Wallet</p>
                      <p className="text-muted-foreground">
                        Use Phantom, Solflare, or any Solana wallet
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex gap-3">
                    <motion.div
                      className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-primary font-semibold text-xs">2</span>
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground">We Scan Your Transactions</p>
                      <p className="text-muted-foreground">
                        Automatically fetch all your trades and transfers
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex gap-3">
                    <motion.div
                      className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-accent font-semibold text-xs">3</span>
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground">Get Your Report</p>
                      <p className="text-muted-foreground">
                        Download PDF + CSV ready for your accountant
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Privacy Notice */}
              <motion.div
                variants={staggerItem}
                className="bg-muted/30 border border-muted rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
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
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">
                      Privacy First
                    </p>
                    <p className="text-muted-foreground">
                      Read-only access. We only ask for signature to register your account.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                ← Back to home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
