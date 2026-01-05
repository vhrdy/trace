"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from "@/components/page-transition";

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGenerateReport = () => {
    // Redirect to login page
    router.push("/login");
  };
  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={staggerItem}
            className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance"
          >
            Every trade, tracked{" "}
            <motion.span
              variants={staggerItem}
              className="block bg-gradient-to-r from-primary to-accent mt-3 bg-clip-text text-transparent"
            >
              automatically
            </motion.span>
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="text-xl text-muted-foreground mb-8 text-balance"
          >
            Paste your Solana wallet. Get your tax report. In seconds.
          </motion.p>
          <motion.p
            variants={staggerItem}
            className="text-base text-muted-foreground mb-12"
          >
            No manual entry. No missed transactions. No stress.
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Input
              type="text"
              placeholder="Paste your Solana address..."
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="w-full sm:w-96"
            />
            <Button
              onClick={handleGenerateReport}
              size="lg"
              className="w-full sm:w-auto"
            >
              Generate Report
            </Button>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex flex-wrap justify-center font-normal items-center gap-6 text-sm text-muted-foreground"
          >
            <span>Works with all Solana wallets.</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Forensic-level tracking
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We catch every swap, every transfer, every dust transaction
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From wallet paste to tax report in 60 seconds. No waiting, no manual entry.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Auto-Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Identifies DEX swaps, NFT sales, staking rewards, and transfers automatically.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle>Accountant-Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  PDF summary + CSV export for TurboTax. Your accountant will actually understand it.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to tax compliance
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={staggerItem} className="text-center">
            <motion.div
              className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              1
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet(s)</h3>
            <p className="text-muted-foreground">
              Paste your Solana address(es). We scan your entire transaction history.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="text-center">
            <motion.div
              className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              2
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">We Trace Everything</h3>
            <p className="text-muted-foreground">
              AI categorizes trades, transfers, fees. Calculates cost basis & capital gains.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="text-center">
            <motion.div
              className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              3
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Get Your Reports</h3>
            <p className="text-muted-foreground">
              Download PDF summary for accountants. Export CSV for TurboTax.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free, upgrade when you need more
          </p>

          {/* Billing Toggle */}
          <motion.div
            className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.645, 0.045, 0.355, 1.0] }}
          >
            <Button
              variant={!isYearly ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </Button>
            <Button
              variant={isYearly ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsYearly(true)}
            >
              Yearly <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">Save 46%</Badge>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Free Tier */}
          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground text-sm">/forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>1 wallet address</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>2 scans maximum</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>2 exports maximum</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited transactions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All DEX & bot support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Start Free</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Pro Tier */}
          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full border-2 opacity-60 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                Coming Soon
              </Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {isYearly ? "$249" : "$29"}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isYearly ? "/year" : "/month"}
                  </span>
                  {isYearly && (
                    <div className="text-sm text-muted-foreground mt-1">
                      $20.75/month - Save $99/year
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>5 wallet addresses</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited transactions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>FIFO/LIFO cost basis methods</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>PDF tax reports</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>CSV export for TurboTax</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority chat support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Trenchor Tier */}
          <motion.div variants={scaleIn} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
            <Card className="h-full opacity-60 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                Coming Soon
              </Badge>
              <CardHeader>
                <CardTitle>Trenchor</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {isYearly ? "$449" : "$69"}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isYearly ? "/year" : "/month"}
                  </span>
                  {isYearly && (
                    <div className="text-sm text-muted-foreground mt-1">
                      $37.42/month - Save $379/year
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Everything in Pro, plus:</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited wallet addresses</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced portfolio analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>API access</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>White-label reports</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        {/* Pricing Note */}
        {!isYearly && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-muted-foreground">
              💡 Switch to <span className="font-medium text-foreground">yearly billing</span> and save up to <span className="font-semibold text-primary">$379/year</span>
            </p>
          </motion.div>
        )}
        {isYearly && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-muted-foreground">
              ✨ Save up to <span className="font-semibold text-primary">46%</span> with yearly billing
            </p>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="bg-primary rounded-2xl p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1.0] }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.645, 0.045, 0.355, 1.0] }}
          >
            Tax season is coming
          </motion.h2>
          <motion.p
            className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.645, 0.045, 0.355, 1.0] }}
          >
            Don't wait until April 14th. Generate your report now.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.645, 0.045, 0.355, 1.0] }}
          >
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">
                Get Your Report Free
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
