"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use Helius RPC endpoint if available, fallback to public RPC
  const endpoint = useMemo(() => {
    const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (heliusKey) {
      console.log("Using Helius RPC endpoint");
      return `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
    }

    console.log("Using public RPC endpoint");
    return "https://api.mainnet-beta.solana.com";
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
