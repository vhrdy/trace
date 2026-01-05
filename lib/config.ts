// Helius configuration
export const getHeliusEndpoint = () => {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

  if (!apiKey) {
    console.warn("Helius API key not found, using public RPC");
    return "https://api.mainnet-beta.solana.com";
  }

  return `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
};

export const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
