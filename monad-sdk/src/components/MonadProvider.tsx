'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MonadConfig, MonadContextType, MonadError } from '../types';

// ─── Contract addresses type ──────────────────────────────────────────────────
export interface MonadContractAddresses {
  market:   `0x${string}`;
  registry: `0x${string}`;
  vault:    `0x${string}`;
  usdc:     `0x${string}`;
}

// Monad Testnet defaults — matches our deployed contracts
const DEFAULT_CONTRACT_ADDRESSES: MonadContractAddresses = {
  market:   '0x7e3c9284633bb5b58b8d6f3cf7fce906a89d24fc',
  registry: '0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb',
  vault:    '0xff17790b38d752b4ee47a772ea63eac2daa6913a',
  usdc:     '0x4b017c27e6ad4b44002c25ca5f1ced94815cab75',
};

// ─── Extended Context ─────────────────────────────────────────────────────────
interface MonadFullContextType extends MonadContextType {
  contracts: MonadContractAddresses;
  chainId: number;
  rpcUrl: string;
}

const MonadContext = createContext<MonadFullContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const MonadProvider: React.FC<{
  config: MonadConfig & {
    contracts?: Partial<MonadContractAddresses>;
    chainId?: number;
    rpcUrl?: string;
  };
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [error, setError] = useState<MonadError | null>(null);

  useEffect(() => {
    if (!config.websiteId) {
      setError({ code: 'MISSING_WEBSITE_ID', message: 'websiteId is required in MonadConfig' });
      return;
    }
    if (!config.walletAddress) {
      setError({ code: 'MISSING_WALLET_ADDRESS', message: 'walletAddress is required in MonadConfig' });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(config.walletAddress)) {
      setError({ code: 'INVALID_WALLET_ADDRESS', message: 'walletAddress must be a valid Ethereum address (0x...)' });
      return;
    }
    setError(null);
  }, [config]);

  const defaultConfig: MonadConfig = {
    apiBaseUrl: 'https://Monad.io',
    theme: {
      primaryColor:    '#00f5ff',
      backgroundColor: '#0a0a0f',
      textColor:       '#e2e8f0',
      borderColor:     '#00f5ff33',
      fontFamily:      'Space Grotesk, sans-serif',
      borderRadius:    4,
    },
    payment: {
      networks:         ['monad'],
      defaultNetwork:   'monad',
      recipientAddress: config.walletAddress,
    },
    ...config,
  };

  const contracts: MonadContractAddresses = {
    ...DEFAULT_CONTRACT_ADDRESSES,
    ...config.contracts,
  };

  const contextValue: MonadFullContextType = {
    config:   defaultConfig,
    apiBaseUrl: defaultConfig.apiBaseUrl || 'https://Monad.io',
    contracts,
    chainId:  config.chainId  ?? 10143,
    rpcUrl:   config.rpcUrl   ?? 'https://testnet-rpc.monad.xyz/',
  };

  if (error) {
    return (
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #0a0a0f, #1a0a1f)',
        border: '1px solid #ff006680',
        borderRadius: '8px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        color: '#ff6680',
      }}>
        <strong>⚠ MonadAd Config Error:</strong> {error.message}
      </div>
    );
  }

  return (
    <MonadContext.Provider value={contextValue}>
      {children}
    </MonadContext.Provider>
  );
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
export const useMonadContext = (): MonadFullContextType => {
  const context = useContext(MonadContext);
  if (!context) throw new Error('useMonadContext must be used within a MonadProvider');
  return context;
};

export const useMonadConfig = (): MonadConfig => {
  const { config } = useMonadContext();
  return config;
};

export const useMonadApi = (): string => {
  const { apiBaseUrl } = useMonadContext();
  return apiBaseUrl;
};

/** Returns the deployed contract addresses from context */
export const useMonadContracts = (): MonadContractAddresses => {
  const { contracts } = useMonadContext();
  return contracts;
};

/** Returns Monad Testnet chain ID (default: 10143) */
export const useMonadChainId = (): number => {
  const { chainId } = useMonadContext();
  return chainId;
};
