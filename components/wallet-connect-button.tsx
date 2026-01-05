"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { LogOut } from "lucide-react";

export function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, isAuthenticating, authenticate, logout } = useAuth();

  const handleConnect = () => {
    setVisible(true);
  };

  if (!connected) {
    return (
      <Button onClick={handleConnect} size="lg">
        Connect Wallet
      </Button>
    );
  }

  if (isAuthenticating) {
    return (
      <Button disabled size="lg" variant="outline">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          <span>Sign to authenticate...</span>
        </div>
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={authenticate} size="lg">
        Sign Message
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 bg-muted rounded-lg text-sm font-mono">
        {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </div>
      <Button onClick={logout} variant="ghost" size="icon">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
