"use client";

import { useState } from "react";
import { updateUserPlan } from "@/lib/supabase-helpers";

// Only show in development
const isDev = process.env.NODE_ENV === "development";

const TEST_WALLETS = {
  free: process.env.NEXT_PUBLIC_TEST_WALLET_FREE || "",
  pro: process.env.NEXT_PUBLIC_TEST_WALLET_PRO || "",
  trenchor: process.env.NEXT_PUBLIC_TEST_WALLET_TRENCHOR || "",
};

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isDev) return null;

  const hasTestWallets =
    TEST_WALLETS.free && TEST_WALLETS.pro && TEST_WALLETS.trenchor;

  if (!hasTestWallets) return null;

  const handleSetPlan = async (
    wallet: string,
    plan: "free" | "pro" | "trenchor"
  ) => {
    setLoading(true);
    try {
      // In a real app, you'd get the userId from the wallet
      // For now, we'll just show the wallet info
      console.log(`Setting ${wallet} to ${plan} plan`);

      // You can uncomment this when you have the userId
      // await updateUserPlan(userId, plan);

      alert(`Test wallet set to ${plan} plan!\n\nWallet: ${wallet}\n\nNow connect with this wallet in your app.`);
    } catch (error) {
      console.error("Error setting plan:", error);
      alert("Error setting plan. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition"
          title="Dev Tools"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      ) : (
        <div className=" border-2 border-purple-600 rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-purple-600">🛠️ Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-gray-600 mb-3">
              Test Wallets - Copy these addresses:
            </div>

            {/* Free Plan */}
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold text-base text-gray-900">Free Plan</span>
                  <div className="text-xs text-gray-600 mt-0.5">Tier: Free</div>
                </div>
                <span className="text-xs bg-gray-600 text-white font-semibold px-3 py-1.5 rounded-full">
                  1 wallet
                </span>
              </div>
              <div className="text-xs font-mono  border border-gray-200 p-2 rounded mb-2 break-all">
                {TEST_WALLETS.free}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(TEST_WALLETS.free);
                  alert("Free wallet copied!");
                }}
                className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-gray-800 w-full font-medium"
                disabled={loading}
              >
                Copy Address
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-muted rounded-lg p-3 bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold text-base text-primary">Pro Plan</span>
                  <div className="text-xs text-primary/80 mt-0.5">Tier: Pro ($29/mo)</div>
                </div>
                <span className="text-xs bg-primary text-white font-semibold px-3 py-1.5 rounded-full">
                  5 wallets
                </span>
              </div>
              <div className="text-xs font-mono  border border-muted/30 p-2 rounded mb-2 break-all">
                {TEST_WALLETS.pro}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(TEST_WALLETS.pro);
                  alert("Pro wallet copied!");
                }}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 w-full font-medium"
                disabled={loading}
              >
                Copy Address
              </button>
            </div>

            {/* Trenchor Plan */}
            <div className="border-2 border-purple-600 rounded-lg p-3 bg-purple-50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold text-base text-purple-600">Trenchor Plan</span>
                  <div className="text-xs text-purple-600/80 mt-0.5">Tier: Trenchor ($69/mo)</div>
                </div>
                <span className="text-xs bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-full">
                  ∞ wallets
                </span>
              </div>
              <div className="text-xs font-mono  border border-purple-300 p-2 rounded mb-2 break-all">
                {TEST_WALLETS.trenchor}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(TEST_WALLETS.trenchor);
                  alert("Trenchor wallet copied!");
                }}
                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 w-full font-medium"
                disabled={loading}
              >
                Copy Address
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <strong>How to test:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Copy a test wallet address</li>
                <li>Use it in your Phantom/Solflare wallet</li>
                <li>Connect to the app</li>
                <li>Test plan features!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
