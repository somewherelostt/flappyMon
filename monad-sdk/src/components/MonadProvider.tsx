'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MonadConfig, MonadContextType, MonadError } from '../types';

// Create the context
const MonadContext = createContext<MonadContextType | null>(null);

// Provider component
export const MonadProvider: React.FC<{
  config: MonadConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [error, setError] = useState<MonadError | null>(null);

  // Validate configuration
  useEffect(() => {
    if (!config.websiteId) {
      setError({
        code: 'MISSING_WEBSITE_ID',
        message: 'websiteId is required in MonadConfig'
      });
      return;
    }

    if (!config.walletAddress) {
      setError({
        code: 'MISSING_WALLET_ADDRESS',
        message: 'walletAddress is required in MonadConfig'
      });
      return;
    }

    // Basic wallet address validation (Ethereum address format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(config.walletAddress)) {
      setError({
        code: 'INVALID_WALLET_ADDRESS',
        message: 'walletAddress must be a valid Ethereum address (0x...)'
      });
      return;
    }

    // Reset error if config is valid
    setError(null);
  }, [config]);

  // Default configuration values
  const defaultConfig: MonadConfig = {
    apiBaseUrl: 'https://Monad.io',
    theme: {
      primaryColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#e5e5e5',
      fontFamily: 'JetBrains Mono, monospace',
      borderRadius: 0
    },
    payment: {
      networks: ['monad'],
      defaultNetwork: 'monad',
      recipientAddress: config.walletAddress // Use the provided wallet address
    },
    ...config
  };

  const contextValue: MonadContextType = {
    config: defaultConfig,
    apiBaseUrl: defaultConfig.apiBaseUrl || 'https://Monad.io'
  };

  // If there's a configuration error, show it
  if (error) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c00'
      }}>
        <strong>Monad Configuration Error:</strong> {error.message}
      </div>
    );
  }

  return (
    <MonadContext.Provider value={contextValue}>
      {children}
    </MonadContext.Provider>
  );
};

// Hook to use the context
export const useMonadContext = (): MonadContextType => {
  const context = useContext(MonadContext);
  
  if (!context) {
    throw new Error('useMonadContext must be used within an MonadProvider');
  }
  
  return context;
};

// Hook to get configuration
export const useMonadConfig = (): MonadConfig => {
  const { config } = useMonadContext();
  return config;
};

// Hook to get API base URL
export const useMonadApi = (): string => {
  const { apiBaseUrl } = useMonadContext();
  return apiBaseUrl;
};
