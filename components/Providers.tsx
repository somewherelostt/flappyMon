// components/Providers.tsx — Monad Testnet wagmi + RainbowKit configuration
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "@/lib/contracts";

// Build wagmi config with Monad Testnet as primary chain.
// Using our custom monadTestnet definition from contracts.ts so all
// contract addresses and RPC endpoints stay in one place.
// Build wagmi config with Monad Testnet as primary chain.
// Build wagmi config with Monad Testnet as primary chain.
const config = getDefaultConfig({
  appName: "Mon-AD",
  // AppKit requires a valid registered ID. For local development on localhost, 
  // you will see a 403 error, but it successfully falls back to local values.
  // For production, create your own at cloud.reown.com and set NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "4fd658a785f64a25289468ba4133f4d2",
  // @ts-ignore
  chains: [monadTestnet],
  ssr: true,
});

const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 15,    // 15s — on Monad blocks are fast
            gcTime:    1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export { Providers };