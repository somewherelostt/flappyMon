"use client";

import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { isAddress, parseEther, type Address } from "viem";

/**
 * Custom hook for MON (native token) payments.
 * Simple direct transfer to publisher wallet.
 */
export function useMonadPayment() {
  const { address } = useAccount();
  const {
    data: hash,
    isPending,
    error,
    sendTransaction,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Send MON directly to publisher
   */
  const sendMON = (toAddress: string, amountMON: string) => {
    if (!isAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    const amountWei = parseEther(amountMON);
    sendTransaction({
      to: toAddress as Address,
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
