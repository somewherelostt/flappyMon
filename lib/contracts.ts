/**
 * contracts.ts — Central registry for all Monad Testnet deployed contracts.
 * Every frontend and SDK file should import from here, never hardcode addresses.
 *
 * MonadDB note: Our contracts use flat bytes32 mappings for parallel execution
 * compatibility. Each slotId maps to an independent storage slot so Monad's
 * optimistic parallel executor never hits state contention between ad purchases.
 */

import type { Abi, Chain } from 'viem';
import MonadAdMarketABI from './abis/MonadAdMarket.json';
import MonadAdRegistryABI from './abis/MonadAdRegistry.json';
import MonadAdVaultABI from './abis/MonadAdVault.json';

// ─── Monad Testnet Chain Definition ───────────────────────────────────────────
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
    public:  { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: {
      name: 'MonadVision',
      url: 'https://testnet.monadvision.com',
    },
  },
  testnet: true,
} as const satisfies Chain;

// ─── Deployed Contract Addresses ──────────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  /** Main bidding + rotation orchestrator */
  market:   '0x7e3c9284633bb5b58b8d6f3cf7fce906a89d24fc' as `0x${string}`,
  /** Flat bytes32→slot mapping optimised for MonadDB parallel reads */
  registry: '0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb' as `0x${string}`,
  /** Isolated publisher revenue treasury */
  vault:    '0xff17790b38d752b4ee47a772ea63eac2daa6913a' as `0x${string}`,
  /** MockUSDC deployed for testnet — 6 decimals, same interface as real USDC */
  usdc:     '0x4b017c27e6ad4b44002c25ca5f1ced94815cab75' as `0x${string}`,
} as const;

// ─── ABIs ─────────────────────────────────────────────────────────────────────
export const CONTRACT_ABIS = {
  market:   MonadAdMarketABI   as Abi,
  registry: MonadAdRegistryABI as Abi,
  vault:    MonadAdVaultABI    as Abi,
  /** Minimal ERC20 ABI for allowance checks and approve() calls */
  erc20: [
    {
      type: 'function', name: 'allowance',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function', name: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function', name: 'balanceOf',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function', name: 'decimals',
      inputs: [],
      outputs: [{ name: '', type: 'uint8' }],
      stateMutability: 'view',
    },
  ] as Abi,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a human-readable slotId string to bytes32 for contract calls */
export function toSlotId(id: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(id);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex.padEnd(64, '0')}` as `0x${string}`;
}

/** Convert USDC amount (human-readable) to 6-decimal bigint */
export function toUSDC(amount: string | number): bigint {
  return BigInt(Math.round(Number(amount) * 1_000_000));
}

/** Convert 6-decimal bigint USDC to human-readable string */
export function fromUSDC(amount: bigint): string {
  return (Number(amount) / 1_000_000).toFixed(2);
}

/** Duration presets in seconds for purchaseSlot */
export const DURATION_SECS = {
  '30m':  30  * 60,
  '1h':   1   * 60 * 60,
  '6h':   6   * 60 * 60,
  '24h':  24  * 60 * 60,
  '7d':   7   * 24 * 60 * 60,
} as const;

export type DurationKey = keyof typeof DURATION_SECS;

/** MonadVision block explorer link for a given address */
export function explorerLink(address: string): string {
  return `https://testnet.monadvision.com/address/${address}`;
}

/** MonadVision block explorer link for a given transaction hash */
export function txExplorerLink(txHash: string): string {
  return `https://testnet.monadvision.com/tx/${txHash}`;
}
