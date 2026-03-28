'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

interface MonadProviderProps {
  publisherWallet: string;
  network?: string;
  currency?: string;
  apiBaseUrl?: string;
  children: React.ReactNode;
}

export const MonadProvider: React.FC<MonadProviderProps> = ({
  publisherWallet,
  network = 'base',
  currency = 'USDC',
  apiBaseUrl = '/api',
  children
}) => {
  useEffect(() => {
    const initMonad = () => {
      if ((window as any).Monad) {
        (window as any).Monad.init({
          publisherWallet,
          network,
          currency,
          apiBaseUrl
        });
      }
    };

    if ((window as any).Monad) {
      initMonad();
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).Monad) {
          initMonad();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [publisherWallet, network, currency, apiBaseUrl]);

  return (
    <>
      {/* Disabled Monad SDK to prevent modal conflicts with x402 */}
      {/* <Script
        src="/js/Monad-sdk.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Monad SDK loaded');
        }}
      /> */}
      {children}
    </>
  );
};