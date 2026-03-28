import { x402Client } from '@x402/core/client';
import { ExactEvmScheme, type EvmSigner } from '@x402/evm';
import type { WalletClient } from 'wagmi';
import type { Address } from 'viem';

export const X402_CONFIG = {
  chainId: 'eip155:10143' as const,
  usdcAddress: '0x4b017c27e6ad4b44002c25ca5f1ced94815cab75',
  facilitator: 'https://x402-facilitator.molandak.org',
  defaultPrice: '0.01',
};

export function createX402Client(walletClient: WalletClient | null): x402Client {
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet not connected');
  }

  const evmSigner: EvmSigner = {
    address: walletClient.account.address as Address,
    signTypedData: async (message: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) => {
      return walletClient.signTypedData({
        domain: message.domain as Parameters<typeof walletClient.signTypedData>[0]['domain'],
        types: message.types as Parameters<typeof walletClient.signTypedData>[0]['types'],
        primaryType: message.primaryType,
        message: message.message,
      });
    },
  };

  const exactScheme = new ExactEvmScheme(evmSigner);

  return new x402Client().register(X402_CONFIG.chainId, exactScheme);
}

export async function fetchWithX402(
  client: x402Client,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const { wrapFetchWithPayment } = await import('@x402/fetch');
  const paymentFetch = wrapFetchWithPayment(fetch, client);
  return paymentFetch(url, options);
}