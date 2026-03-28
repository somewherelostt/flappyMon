# Mon-AD: Decentralized Advertising Platform on Monad

A full-stack decentralized advertising platform built on Monad Testnet. This platform enables publishers to monetize ad slots and advertisers to purchase/bid on ad placements using USDC on Monad.

## Features

- **Ad Slot System**: Publishers can register and manage ad slots
- **Bidding Queue**: Competitive bidding system for ad placements
- **IPFS Storage**: Decentralized ad content storage via Lighthouse
- **USDC Payments**: Native USDC payments on Monad blockchain
- **SDK**: Easy integration via `@monad-ad/monad-sdk`

## Architecture

```
ad_by_monad/
├── app/                 # Next.js frontend (App Router)
│   ├── api/            # API routes for ads, queue, uploads
│   ├── checkout/       # Payment/checkout flow
│   ├── upload/         # Ad content upload
│   └── dashboard/      # Publisher dashboard
├── components/         # React components
│   ├── MonadSlot.tsx   # Main ad slot component
│   ├── MonadProvider.tsx
│   └── ui/             # shadcn-ui components
├── hooks/              # Custom React hooks
│   └── useMonadMarket.ts
├── lib/                # Core libraries
│   ├── contracts.ts    # Contract ABIs & addresses
│   ├── lighthouse-http-storage.ts  # IPFS storage
│   └── adService.ts
├── monad-sdk/          # SDK package for third-party integration
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
└── contracts/          # Solidity smart contracts
    ├── src/
    │   ├── MonadAdMarket.sol
    │   ├── MonadAdRegistry.sol
    │   └── MonadAdVault.sol
    └── broadcast/      # Deployment artifacts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn db:generate
```

### Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Lighthouse/IPFS Storage
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# Blockchain RPC (Monad Testnet)
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz/

# Payment Configuration
PAYMENT_RECIPIENT=0xYourWalletAddress
```

### Running the App

```bash
# Development
yarn dev

# Production
yarn build && yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Smart Contracts

The project includes three Solidity contracts deployed on Monad Testnet (chain ID: 10143):

| Contract | Address | Purpose |
|----------|---------|---------|
| MockUSDC | `0x4b017c27e6ad4b44002c25ca5f1ced94815cab75` | Test USDC token |
| MonadAdRegistry | `0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb` | Ad slot registry |
| MonadAdVault | `0xff17790b38d752b4ee47a772ea63eac2daa6913a` | Payment vault |
| MonadAdMarket | `0x7e3c9284633bb5b58b8d6f3cf7fce906a89d24fc` | Market & bidding |

## SDK Integration

Third-party sites can integrate Mon-AD ads using the SDK:

```tsx
import { MonadProvider, MonadSlot } from '@monad-ad/monad-sdk';

export default function MyPage() {
  return (
    <MonadProvider
      config={{
        websiteId: 'my-website',
        walletAddress: '0xPublisherWallet...'
      }}
    >
      <header>
        <MonadSlot
          slotId="header-banner"
          size="banner"
          price="0.10"
        />
      </header>
    </MonadProvider>
  );
}
```

## Demo Slots

The app includes these demo slots:
- `demo-header` - Banner (728x90)
- `demo-square` - Square (300x250)
- `demo-mobile` - Mobile (320x60)
- `demo-hero-background` - Hero (1200x400)
- `demo-hero-premium` - Leaderboard (970x250)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **Web3**: wagmi, viem, RainbowKit
- **Storage**: Lighthouse (IPFS)
- **Database**: SQLite (via Prisma)

## License

MIT
