# Mon-AD Testing Guide

Step-by-step instructions to test your Mon-AD decentralized advertising platform on Monad Testnet.

## Prerequisites

Before testing, ensure you have:

1. **Wallet**: MetaMask or any EVM-compatible wallet
2. **MON Tokens**: Get from [Monad Faucet](https://faucet.monad.xyz) - minimum 0.00001 MON
3. **Node.js**: Version 18+ installed

## Step 1: Environment Setup

```bash
# Clone and enter project
cd ad_by_monad

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

Update `.env` with your settings:

```env
# Database
DATABASE_URL="file:./dev.db"

# Lighthouse/IPFS Storage (get from https://lighthouse.storage)
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_api_key_here

# Blockchain RPC
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz/

# Publisher wallet (receives MON payments)
NEXT_PUBLIC_PUBLISHER_WALLET=0xYourWalletAddress
PAYMENT_RECIPIENT=0xYourWalletAddress
```

## Step 2: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 3: Connect Wallet

1. Click "Connect Wallet" button
2. Approve MetaMask connection request
3. Ensure you're connected to **Monad Testnet** (Chain ID: 10143)

## Step 4: Purchase an Ad Slot (MON)

1. Click any ad slot on the homepage (shows "Click to purchase")
2. On checkout page, you'll see:
   - Slot details (ID, size, price)
   - **Custom Amount** field - default is **0.00001 MON** (for testing)
   - Payment method: **Pay with MON** (default) or Pay with Contract (USDC)
3. Keep "Pay with MON" selected
4. Optionally adjust the custom amount (minimum 0.00001 MON)
5. Click **"Pay 0.00001 MON"** (or your custom amount)
6. Approve the MON transfer in MetaMask
7. Wait for payment confirmation

## Step 5: Upload Ad Content

After payment succeeds:
1. You'll be redirected to `/upload` page
2. Click the upload area to select an image (PNG/JPG, max 5MB)
3. Click **"Upload Ad"**
4. Wait for upload to complete

## Step 6: Verify Ad is Live

1. Return to homepage
2. Your uploaded ad should now be displayed in the slot
3. Click the **"+"** button to see queue info

---

## Alternative: Contract Payment (USDC)

If you prefer using USDC instead of MON:

1. On checkout page, select **"Pay with Contract (USDC)"**
2. Click **"Approve mUSDC"** (first time only)
3. Wait for approval confirmation
4. Click **"Purchase Now"**
5. Confirm transaction in MetaMask
6. Continue to upload page

---

## API Testing Commands

```bash
# Health check
curl http://localhost:3000/api/health

# Get ad for slot
curl "http://localhost:3000/api/ads/demo-header"

# Get queue info
curl "http://localhost:3000/api/queue-info/demo-header"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Wallet not connecting | Refresh page, ensure MetaMask is installed |
| MON payment fails | Get MON from https://faucet.monad.xyz |
| Ad not displaying | Check browser console for errors |
| Transaction stuck | Cancel in MetaMask, try again |

---

## Networks

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Monad Testnet | 10143 | https://testnet-rpc.monad.xyz |
| Monad Mainnet | 7553 | https://rpc.monad.xyz |

## Contract Addresses (Testnet)

| Contract | Address |
|----------|---------|
| MockUSDC | `0x4b017c27e6ad4b44002c25ca5f1ced94815cab75` |
| MonadAdRegistry | `0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb` |
| MonadAdVault | `0xff17790b38d752b4ee47a772ea63eac2daa6913a` |
| MonadAdMarket | `0x7e3c9284633bb5b58b8d6f3cf7fce906a89d24fc` |

## Next Steps

After testing locally:

1. **Deploy Contracts**: Use Foundry to deploy to testnet/mainnet
2. **Configure IPFS**: Set up Lighthouse storage with persistent hash
3. **Deploy Frontend**: Push to Vercel for public access
4. **Update SDK**: Build monad-sdk for third-party integration