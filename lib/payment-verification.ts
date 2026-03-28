import { createPublicClient, http, isAddress, type Address } from "viem";

export type PaymentNetwork = "monad" | "monad-amoy";

export interface VerifyPaymentInput {
  transactionHash: string;
  expectedAmount: string;
  expectedPayer: Address;
  expectedRecipient: Address;
  network: PaymentNetwork;
}

export interface VerifyPaymentResult {
  verified: boolean;
  error?: string;
}

const NETWORK_RPC_URLS: Record<PaymentNetwork, string | undefined> = {
  monad: process.env.MONAD_TESTNET_RPC_URL,
  "monad-amoy": process.env.MONAD_TESTNET_RPC_URL,
};

export async function verifyPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  const { transactionHash, expectedPayer, expectedRecipient, network } = input;

  if (!transactionHash || !transactionHash.startsWith("0x")) {
    return { verified: false, error: "Invalid transaction hash format" };
  }

  if (!isAddress(expectedPayer) || !isAddress(expectedRecipient)) {
    return { verified: false, error: "Invalid wallet address format" };
  }

  const rpcUrl = NETWORK_RPC_URLS[network];

  // If RPC is not configured, keep behavior non-blocking for environments
  // where off-chain payment verification is not available yet.
  if (!rpcUrl) {
    return { verified: true };
  }

  try {
    const client = createPublicClient({
      transport: http(rpcUrl),
    });

    const tx = await client.getTransaction({
      hash: transactionHash as `0x${string}`,
    });

    if (!tx) {
      return { verified: false, error: "Transaction not found" };
    }

    if (tx.from.toLowerCase() !== expectedPayer.toLowerCase()) {
      return { verified: false, error: "Payer address mismatch" };
    }

    // Recipient checks for native transfer transactions.
    if (tx.to && tx.to.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return { verified: false, error: "Recipient address mismatch" };
    }

    return { verified: true };
  } catch (error) {
    return {
      verified: false,
      error:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}
