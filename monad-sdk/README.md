# Monad SDK for Next.js

A powerful, easy-to-use SDK for integrating Monad decentralized ad slots into your Next.js applications.

## 🚀 Features

- **Easy Integration**: Simple setup with just a few lines of code
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Customizable**: Flexible theming and configuration options
- **Bidding System**: Built-in support for competitive bidding
- **Responsive Design**: Works seamlessly across all device sizes
- **Real-time Updates**: Live ad status and queue information
- **Error Handling**: Robust error handling and fallback components
- **Revenue Generation**: Direct payments to your wallet address from ad purchases

## 📦 Installation

```bash
npm install Monad-sdk
# or
yarn add Monad-sdk
# or
pnpm add Monad-sdk
```

## 🎯 Quick Start

### Prerequisites

Before using the Monad SDK, you'll need:

- A **website ID** (unique identifier for your website)
- A **wallet address** (Ethereum address to receive payments from ad purchases)

### 1. Wrap your app with MonadProvider

```tsx
// app/layout.tsx or pages/_app.tsx
import { MonadProvider } from 'Monad-sdk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MonadProvider
          config={{
            websiteId: 'your-website-id',
            walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Your wallet address to receive payments
            apiBaseUrl: 'https://Monad.io', // optional
          }}
        >
          {children}
        </MonadProvider>
      </body>
    </html>
  );
}
```

### 2. Add ad slots to your pages

```tsx
// app/page.tsx
import { MonadSlot } from 'Monad-sdk';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      
      {/* Header banner ad */}
      <MonadSlot
        slotId="header-banner"
        size="banner"
        price="0.25"
        category="technology"
      />
      
      <main>
        <p>Your content here...</p>
      </main>
      
      {/* Sidebar ad */}
      <MonadSlot
        slotId="sidebar-ad"
        size="sidebar"
        price="0.15"
        category="general"
      />
    </div>
  );
}
```

## 🎨 Configuration

### Basic Configuration

```tsx
import { MonadProvider, createDefaultConfig } from 'Monad-sdk';

const config = createDefaultConfig('your-website-id', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', {
  apiBaseUrl: 'https://Monad.io',
  theme: {
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e5e5',
    fontFamily: 'JetBrains Mono, monospace',
    borderRadius: 0
  }
});

<MonadProvider config={config}>
  {children}
</MonadProvider>
```

### Advanced Configuration

```tsx
const advancedConfig = {
  websiteId: 'your-website-id',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Your wallet address to receive payments
  apiBaseUrl: 'https://Monad.io',
  theme: {
    primaryColor: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    textColor: '#333333',
    borderColor: '#dee2e6',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8
  },
  payment: {
    networks: ['monad', 'ethereum'],
    defaultNetwork: 'monad',
    recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' // Same as walletAddress
  },
  defaultSlotConfig: {
    durations: ['1h', '6h', '24h', '7d'],
    clickable: true
  }
};
```

## 🎯 Ad Slot Types

### Available Sizes

- **banner**: 728x90px - Perfect for headers and footers
- **square**: 300x250px - Great for sidebars and mid-content
- **mobile**: 320x60px - Optimized for mobile devices
- **sidebar**: 160x600px - Vertical sidebar placements

### Custom Dimensions

```tsx
<MonadSlot
  slotId="custom-size"
  size="banner"
  dimensions={{ width: 600, height: 100 }}
  price="0.20"
/>
```

## 🎨 Customization

### Custom Components

```tsx
<MonadSlot
  slotId="custom-slot"
  size="banner"
  price="0.25"
  loadingComponent={<div>Loading ad...</div>}
  errorComponent={<div>Ad failed to load</div>}
  emptySlotComponent={<div>Click to purchase this ad space</div>}
  onSlotClick={(slotId) => console.log('Slot clicked:', slotId)}
  onAdLoad={(adData) => console.log('Ad loaded:', adData)}
  onAdError={(error) => console.error('Ad error:', error)}
/>
```

### Custom Styling

```tsx
<MonadSlot
  slotId="styled-slot"
  size="square"
  price="0.15"
  className="my-custom-ad-slot"
  style={{
    margin: '20px 0',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }}
/>
```

## 🔧 Hooks and Utilities

### Using the Context

```tsx
import { useMonadContext, useMonadConfig } from 'Monad-sdk';

function MyComponent() {
  const { config, apiBaseUrl } = useMonadContext();
  const MonadConfig = useMonadConfig();
  
  return (
    <div>
      <p>Website ID: {config.websiteId}</p>
      <p>API Base URL: {apiBaseUrl}</p>
    </div>
  );
}
```

### Utility Functions

```tsx
import { 
  formatPrice, 
  formatTimeRemaining, 
  generateCheckoutUrl,
  fetchAdData,
  trackAdEvent 
} from 'Monad-sdk';

// Format price for display
const displayPrice = formatPrice('0.25', 'USDC'); // "0.25 USDC"

// Format time remaining
const timeLeft = formatTimeRemaining(1759020311); // "2h 30m"

// Generate checkout URL
const checkoutUrl = generateCheckoutUrl(
  'header-banner',
  '0.25',
  'banner',
  'your-website-id'
);

// Fetch ad data manually
const adData = await fetchAdData('header-banner');

// Track ad events
trackAdEvent('click', 'header-banner', 'your-website-id');
```

## 🎯 Bidding System

The SDK automatically handles the bidding system:

```tsx
<MonadSlot
  slotId="competitive-slot"
  size="banner"
  price="0.25" // Base price
  onSlotClick={(slotId) => {
    // This will open the bidding interface
    // Users can bid higher amounts for priority
  }}
/>
```

When a slot is occupied, users can:

- See the current ad
- Click the "+" button to bid for the next slot
- Set their bid amount (higher bids get priority)
- Join the queue automatically

## 📱 Responsive Design

The SDK automatically handles responsive design:

```tsx
<MonadSlot
  slotId="responsive-slot"
  size="banner"
  price="0.25"
  // Automatically adapts to container size
  // Maintains aspect ratio
  // Optimizes font sizes for readability
/>
```

## 🔒 Error Handling

The SDK includes comprehensive error handling:

```tsx
<MonadSlot
  slotId="error-handling-slot"
  size="banner"
  price="0.25"
  onAdError={(error) => {
    console.error('Ad failed to load:', error);
    // Handle error (e.g., show fallback content)
  }}
  errorComponent={
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6'
    }}>
      <p>Ad temporarily unavailable</p>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  }
/>
```

## 🧪 Testing

### Test with Development Slots

```tsx
<MonadSlot
  slotId="test-slot"
  size="banner"
  price="0.01" // Low price for testing
  category="demo"
/>
```

### Mock Data for Testing

```tsx
// In your test environment
const mockConfig = {
  websiteId: 'test-website',
  apiBaseUrl: 'http://localhost:3000' // Your local development server
};
```

## 🚀 Production Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_Monad_WEBSITE_ID=your-production-website-id
NEXT_PUBLIC_Monad_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
NEXT_PUBLIC_Monad_API_BASE_URL=https://Monad.io
```

### Production Configuration

```tsx
const productionConfig = {
  websiteId: process.env.NEXT_PUBLIC_Monad_WEBSITE_ID!,
  walletAddress: process.env.NEXT_PUBLIC_Monad_WALLET_ADDRESS!,
  apiBaseUrl: process.env.NEXT_PUBLIC_Monad_API_BASE_URL || 'https://Monad.io',
  theme: {
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e5e5',
    fontFamily: 'JetBrains Mono, monospace',
    borderRadius: 0
  }
};
```

## 📊 Analytics

The SDK automatically tracks ad events:

- **Ad Views**: When ads are displayed
- **Ad Clicks**: When users click on ads
- **Slot Clicks**: When users click to purchase slots
- **Errors**: When ads fail to load

## 🔧 Troubleshooting

### Common Issues

1. **Ad not loading**: Check your `websiteId` and `apiBaseUrl`
2. **Styling issues**: Ensure your CSS doesn't conflict with ad slot styles
3. **TypeScript errors**: Make sure you have the latest version of the SDK

### Debug Mode

```tsx
const debugConfig = {
  websiteId: 'your-website-id',
  apiBaseUrl: 'https://Monad.io',
  debug: true // Enable debug logging
};
```

## 📚 Examples

Check out the `/examples` directory for complete working examples:

- Basic integration
- Custom theming
- Advanced configuration
- Error handling
- Testing setup

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- 📖 [Documentation](https://docs.Monad.io)
- 🐛 [Report Issues](https://github.com/Monad/mon-AD/issues)
- 💬 [Discord Community](https://discord.gg/Monad)
- 📧 [Email Support](mailto:support@Monad.io)

---

**Monad SDK** - Making decentralized advertising simple and powerful! 🚀
