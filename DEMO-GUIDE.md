# Mon-AD Demo Showcase Guide

This guide explains how to create demo videos and showcases for your Mon-AD project.

---

## Part 1: Creating Demo Videos

### Video 1: "Ad Purchase Flow"

**Duration**: 30-60 seconds

**Steps to record**:
1. Open http://localhost:3000
2. Show homepage with ad slots
3. Click on a slot → Checkout page
4. Show custom amount field (0.00001 MON)
5. Click "Pay with MON"
6. Approve in MetaMask
7. Show redirect to upload page
8. Upload an image
9. Return to homepage → Show ad is live!

**Script**:
> "Welcome to Mon-AD - decentralized advertising on Monad! Let me show you how easy it is to purchase an ad slot. First, I click on the premium header slot. I can customize my bid amount - let's use 0.00001 MON for testing. Now I connect my wallet and pay with MON directly. After approving the transaction, I upload my ad image. And just like that, my ad is now live on the homepage!"

---

### Video 2: "SDK Integration"

**Duration**: 45-90 seconds

**Steps to record**:
1. Show a new Next.js project
2. Install: `npm install @monad-ad/monad-sdk`
3. Show code in `app/layout.tsx` with MonadProvider
4. Show code in `app/page.tsx` with MonadSlot
5. Run dev server
6. Show the ad slot rendered

**Script**:
> "Building your own ad platform with Mon-AD is simple. Install our SDK, wrap your app with MonadProvider, and add MonadSlot components. That's it! The SDK handles wallet connection, payments, and ad display automatically."

---

### Video 3: "Bidding System"

**Duration**: 60 seconds

**Steps to record**:
1. First user buys a slot (ad is live)
2. Second user clicks same slot (shows "Queued")
3. Second user pays higher amount
4. Wait for first ad to expire OR show queue button
5. Show queue position (+ button shows count)

---

## Part 2: SDK Usage Examples

### Example 1: Basic Integration

```tsx
// app/layout.tsx
import { MonadProvider } from '@monad-ad/monad-sdk';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MonadProvider
          config={{
            websiteId: 'my-blog',
            walletAddress: '0xYourPublisherWallet...',
          }}
        >
          {children}
        </MonadProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import { MonadSlot } from '@monad-ad/monad-sdk';

export default function HomePage() {
  return (
    <div>
      <header>
        <MonadSlot
          slotId="header-banner"
          size="banner"
          price="0.001"
          clickable={true}
        />
      </header>
      
      <aside>
        <MonadSlot
          slotId="sidebar-ad"
          size="square"
          price="0.0005"
          clickable={true}
        />
      </aside>
    </div>
  );
}
```

---

### Example 2: Custom Theme

```tsx
import { MonadProvider, MonadSlot } from '@monad-ad/monad-sdk';

const myConfig = {
  websiteId: 'my-website',
  walletAddress: '0x1234...',
  theme: {
    primaryColor: '#8B5CF6', // Purple
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    borderColor: '#8B5CF6',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8,
  },
};

export default function Page() {
  return (
    <MonadProvider config={myConfig}>
      <div>
        <h1>Welcome to My Site</h1>
        <MonadSlot 
          slotId="hero" 
          size="banner" 
          price="0.01" 
        />
      </div>
    </MonadProvider>
  );
}
```

---

### Example 3: Programmatic Ad Data

```tsx
import { useMonadApi } from '@monad-ad/monad-sdk';
import { useEffect, useState } from 'react';

function AdAnalytics({ slotId }) {
  const { fetchAdData, fetchQueueInfo } = useMonadApi();
  const [adData, setAdData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const data = await fetchAdData(slotId);
      setAdData(data);
    }
    loadData();
  }, [slotId]);

  if (!adData?.hasAd) return <p>No active ad</p>;

  return (
    <div>
      <p>Ad shown {adData.amountPaid} MON</p>
      <p>Advertiser: {adData.advertiserAddress}</p>
    </div>
  );
}
```

---

### Example 4: Using Contract Hooks (Advanced)

```tsx
import { 
  usePurchaseSlot, 
  useActiveSlot,
  useBidQueue 
} from '@monad-ad/monad-sdk';

function AdManagement({ slotId }) {
  const { data: activeSlot } = useActiveSlot(slotId);
  const { data: queue } = useBidQueue(slotId);
  const { purchase, hash, isPending } = usePurchaseSlot();

  const handlePurchase = () => {
    purchase(
      slotId,
      'ipfs://QmYourHash',
      3600, // 1 hour in seconds
      '1000000' // 1 MON in wei
    );
  };

  return (
    <div>
      {activeSlot ? (
        <p>Slot is occupied</p>
      ) : (
        <button onClick={handlePurchase} disabled={isPending}>
          {isPending ? 'Processing...' : 'Purchase Slot'}
        </button>
      )}
      {queue && <p>Queue: {queue.length} bids</p>}
    </div>
  );
}
```

---

## Part 3: NPM Package Publishing

### Build the SDK

```bash
cd ad_by_monad/monad-sdk
npm install
npm run build
```

### Publish to NPM (when ready)

```bash
npm login
npm publish
```

### Users will install like:

```bash
npm install @monad-ad/monad-sdk
```

---

## Demo Checklist

- [ ] Wallet connected to Monad Testnet
- [ ] MON tokens in wallet (get from faucet)
- [ ] Ad slots visible on homepage
- [ ] Purchase flow works end-to-end
- [ ] Image upload works
- [ ] Ad displays on homepage
- [ ] SDK builds without errors

---

## Key Talking Points for Demo

1. **Zero USDC needed** - Pay with native MON tokens
2. **Custom amounts** - Set any amount (even 0.00001 MON)
3. **Direct wallet payment** - No approval needed for MON
4. **Local storage fallback** - Works even if IPFS is down
5. **Monad Testnet** - Real blockchain, real transactions