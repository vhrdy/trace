"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { verifyWalletSignature } from "@/lib/wallet-auth";
import { getOrCreateProfile } from "@/lib/supabase-helpers";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, disconnect, signMessage, connected } = useWallet();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Reset authentication when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setIsAuthenticated(false);
    }
  }, [connected]);

  // Automatically request signature when wallet connects (but not if logging out)
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating && !isLoggingOut) {
      authenticate();
    }
  }, [connected, publicKey, isAuthenticated, isLoggingOut]);

  const authenticate = async () => {
    if (!publicKey || !signMessage) {
      return;
    }

    setIsAuthenticating(true);
    try {
      const message = `Sign in to Trace\n\nWallet: ${publicKey.toString()}\nTimestamp: ${new Date().toISOString()}\n\nThis signature proves you own this wallet.\nNo transaction will be made.`;

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      // Verify the signature
      const isValid = await verifyWalletSignature(
        publicKey.toString(),
        message,
        signature
      );

      if (isValid) {
        // Create or get profile in database
        const profile = await getOrCreateProfile(publicKey.toString());

        if (!profile) {
          toast.error("Failed to create profile. Please try again.");
          disconnect();
          return;
        }

        setIsAuthenticated(true);
        toast.success("Successfully authenticated!");
      } else {
        toast.error("Signature verification failed. Please try again.");
        disconnect();
      }
    } catch (error: any) {
      console.error("Error signing message:", error);

      // Check if user rejected the signature
      if (error.message?.includes("User rejected")) {
        toast.error("You must sign the message to use Trace.");
      } else {
        toast.error("Failed to sign message. Please try again.");
      }

      disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setIsAuthenticated(false);
    await disconnect();
    router.push("/");

    // Reset the logging out flag after a delay to allow reconnection later
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 1000);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
