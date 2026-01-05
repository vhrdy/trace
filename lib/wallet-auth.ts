import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: Uint8Array
): Promise<boolean> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signature,
      publicKey.toBytes()
    );

    return verified;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}
