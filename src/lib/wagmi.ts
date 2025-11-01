import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Monad testnet configuration
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monad.xyz' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'Flappy Alien on Monad',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect
  chains: [monadTestnet as any],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: true,
});
