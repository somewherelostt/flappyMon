"use client";

import { useWriteContract, useWatchContractEvent, useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, toSlotId } from "@/lib/contracts";

/**
 * Custom hook for interacting with the MonadAdMarket contract.
 * Mirrors the template logic but adapted for Monad's parallel-safe architecture.
 */
export function useMonadMarket() {
  const { address } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  // 1. Check mUSDC allowance
  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: CONTRACT_ABIS.erc20,
    functionName: "allowance",
    args: [address!, CONTRACT_ADDRESSES.market],
    query: { enabled: !!address },
  });

  // 2. Approve mUSDC
  const approve = (amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.usdc,
      abi: CONTRACT_ABIS.erc20,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.market, amount],
    });
  };

  // 3. Purchase or Bid on an ad slot
  const purchaseSlot = (slotId: string, ipfsHash: string, durationSecs: number, bidAmount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.market,
      abi: CONTRACT_ABIS.market,
      functionName: "purchaseSlot",
      args: [toSlotId(slotId), ipfsHash, BigInt(durationSecs), bidAmount],
    });
  };

  return {
    allowance,
    approve,
    purchaseSlot,
    isPending,
    hash,
    error,
  };
}
