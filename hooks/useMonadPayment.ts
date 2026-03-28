"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";

/**
 * Custom hook for MON (native token) payments.
 * Simple direct transfer to publisher wallet.
 */
export function useMonadPayment() {
  const { address } = useAccount();
  const { data: hash, isPending, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash 
  });

  /**
   * Send MON directly to publisher
   */
  const sendMON = (toAddress: string, amountMON: string) => {
    const amountWei = parseEther(amountMON);
    writeContract({
      address: toAddress,
      value: amountWei,
    });
  };

  return {
    sendMON,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}