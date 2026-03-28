'use client';

/**
 * MonadSlot.tsx (SDK) — Hybrid on-chain + API ad slot component.
 *
 * Data strategy:
 * 1. Reads active ad from MonadAdRegistry via viem publicClient (on-chain, primary)
 * 2. Falls back to REST API fetch if on-chain read fails or returns empty
 * 3. IPFS hash is stored in the on-chain event; content URL served from IPFS gateway
 *
 * This means even if the backend API is down, the slot will still display
 * the correct ad by reading directly from Monad Testnet.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createPublicClient, http, defineChain } from 'viem';
import { MonadSlotProps, AdData, QueueInfo, MonadError } from '../types';
import { useMonadContext } from './MonadProvider';

// ─── Viem client (browser-side, read-only) ────────────────────────────────────
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz/'] } },
  blockExplorers: { default: { name: 'MonadVision', url: 'https://testnet.monadvision.com' } },
  testnet: true,
});

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz/'),
});

// Minimal Registry ABI for activeSlots read
const REGISTRY_ABI = [
  {
    type: 'function', name: 'activeSlots',
    inputs: [{ name: 'slotId', type: 'bytes32' }],
    outputs: [
      { name: 'owner',    type: 'address' },
      { name: 'ipfsHash', type: 'string'  },
      { name: 'price',    type: 'uint256' },
      { name: 'expiry',   type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const;

const REGISTRY_ADDRESS = '0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb' as `0x${string}`;
const IPFS_GATEWAYS = [
  'https://gateway.lighthouse.storage/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/'
];

// Simple in-memory cache for on-chain results to prevent redundant RPC calls
const slotCache = new Map<string, { data: AdData | null, timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

/** Convert a string slotId to bytes32 hex */
function toBytes32(id: string): `0x${string}` {
  const enc = new TextEncoder();
  const bytes = enc.encode(id);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hex.padEnd(64, '0')}` as `0x${string}`;
}

function isExpired(expiry: bigint): boolean {
  return Number(expiry) * 1000 < Date.now();
}

// ─── Dimensions ───────────────────────────────────────────────────────────────
const SLOT_DIMENSIONS = {
  banner:      { width: 728, height: 90  },
  square:      { width: 300, height: 250 },
  mobile:      { width: 320, height: 60  },
  sidebar:     { width: 160, height: 600 },
  leaderboard: { width: 728, height: 90  },
  card:        { width: 300, height: 220 },
};

const getOptimalFontSizes = (w: number, h: number) => {
  const base = Math.min(w, h) * 0.08;
  return {
    icon:     `${Math.max(12, Math.min(24, base * 1.5))}px`,
    title:    `${Math.max(8,  Math.min(14, base))}px`,
    subtitle: `${Math.max(7,  Math.min(12, base * 0.8))}px`,
    small:    `${Math.max(6,  Math.min(10, base * 0.7))}px`,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const NeonSpinner: React.FC = () => (
  <div style={{
    width: '20px', height: '20px',
    border: '2px solid #00f5ff33',
    borderTop: '2px solid #00f5ff',
    borderRadius: '50%',
    animation: 'monad-spin 0.8s linear infinite',
  }} />
);

export const MonadSlot: React.FC<MonadSlotProps> = ({
  slotId,
  size = 'banner',
  price = '0.10',
  durations = ['30m', '1h', '6h', '24h'],
  category = 'general',
  className = '',
  clickable = true,
  dimensions: customDimensions,
  onSlotClick,
  onAdLoad,
  onAdError,
  loadingComponent,
  errorComponent,
  emptySlotComponent,
  ...props
}) => {
  const { config, apiBaseUrl, contracts } = useMonadContext();
  const [adData, setAdData]       = useState<AdData | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<MonadError | null>(null);
  const [source, setSource]       = useState<'onchain' | 'api' | 'empty'>('empty');
  const slotRef = useRef<HTMLDivElement>(null);

  const dims     = customDimensions || SLOT_DIMENSIONS[size as keyof typeof SLOT_DIMENSIONS] || SLOT_DIMENSIONS.banner;
  const fontSize = getOptimalFontSizes(dims.width, dims.height);
  const theme    = config.theme || {};

  // ── Primary: on-chain read from MonadAdRegistry ─────────────────────────────
  const fetchOnChain = useCallback(async (): Promise<AdData | null> => {
    // Check cache first
    const cacheKey = `onchain-${slotId}`;
    const cached = slotCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const result = await publicClient.readContract({
        address: (contracts?.registry ?? REGISTRY_ADDRESS) as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: 'activeSlots',
        args: [toBytes32(slotId)],
      }) as [string, string, bigint, bigint];

      const [owner, ipfsHash, priceWei, expiry] = result;
      const zeroAddr = '0x0000000000000000000000000000000000000000';
      if (!owner || owner === zeroAddr || !ipfsHash || isExpired(expiry)) {
        slotCache.set(cacheKey, { data: null, timestamp: Date.now() });
        return null;
      }

      const contentUrl = ipfsHash.startsWith('Qm') || ipfsHash.startsWith('bafy')
        ? `${IPFS_GATEWAYS[0]}${ipfsHash}` // IPFS hash
        : ipfsHash.startsWith('/') 
          ? ipfsHash  // Local path
          : ipfsHash; // External URL

      const data = {
        hasAd: true,
        contentUrl,
        ipfsHash: ipfsHash.startsWith('Qm') || ipfsHash.startsWith('bafy') ? ipfsHash : undefined,
        expiresAt: Number(expiry) * 1000,
        amountPaid: (Number(priceWei) / 1_000_000).toFixed(2),
        advertiserAddress: owner,
      };

      slotCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    }
  }, [slotId, contracts]);

  // ── Fallback: REST API ───────────────────────────────────────────────────────
  const fetchFromApi = useCallback(async (): Promise<AdData | null> => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/ads/${slotId}`);
      
      if (res.status === 404) {
        return null; // Gracefully handle missing ads
      }
      
      if (!res.ok) return null;
      
      const data = await res.json();
      return data.hasAd ? data : null;
    } catch {
      return null;
    }
  }, [apiBaseUrl, slotId]);

  const fetchQueueInfo = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/queue-info/${slotId}`);
      if (res.ok) setQueueInfo(await res.json());
    } catch {}
  }, [apiBaseUrl, slotId]);

  // ── Load data on mount + poll every 30s ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // 1. Try on-chain first
        let data = await fetchOnChain();
        if (!cancelled && data) {
          setAdData(data);
          setSource('onchain');
          onAdLoad?.(data);
          return;
        }

        // 2. Fall back to API
        data = await fetchFromApi();
        if (!cancelled && data) {
          setAdData(data);
          setSource('api');
          onAdLoad?.(data);
          return;
        }

        // 3. Slot is empty
        if (!cancelled) {
          setAdData(null);
          setSource('empty');
        }
      } catch (err) {
        if (!cancelled) {
          const e: MonadError = { code: 'FETCH_ERROR', message: err instanceof Error ? err.message : 'Unknown error', details: err };
          setError(e);
          onAdError?.(err instanceof Error ? err : new Error('Fetch failed'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    fetchQueueInfo();

    // Poll every 30s to reflect on-chain state changes
    const interval = setInterval(() => { load(); fetchQueueInfo(); }, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [fetchOnChain, fetchFromApi, fetchQueueInfo, onAdLoad, onAdError]);

  // ── Set data attributes for external tracking ────────────────────────────────
  useEffect(() => {
    if (!slotRef.current) return;
    slotRef.current.setAttribute('data-slot-id', slotId);
    slotRef.current.setAttribute('data-size', size);
    slotRef.current.setAttribute('data-price', price);
    slotRef.current.setAttribute('data-source', source);
    slotRef.current.setAttribute('data-website-id', config.websiteId);
  }, [slotId, size, price, source, config.websiteId]);

  // ── Click handler ────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (onSlotClick) {
      onSlotClick(slotId);
    } else {
      const params = new URLSearchParams({ slotId, price, size, durations: durations.join(','), category, websiteId: config.websiteId, walletAddress: config.walletAddress });
      window.open(`${apiBaseUrl}/checkout?${params}`, '_blank');
    }
  }, [onSlotClick, slotId, price, size, durations, category, config, apiBaseUrl]);

  // ── Shared wrapper style ─────────────────────────────────────────────────────
  const wrapStyle: React.CSSProperties = {
    width: dims.width, height: dims.height,
    maxWidth: '100%', maxHeight: '100%',
    boxSizing: 'border-box', overflow: 'hidden',
    position: 'relative', margin: '0 auto',
    border: `1px solid ${theme.borderColor || '#00f5ff33'}`,
    backgroundColor: theme.backgroundColor || '#0a0a0f',
    fontFamily: theme.fontFamily || 'Space Grotesk, sans-serif',
  };

  // Loading
  if (isLoading) {
    return (
      <div ref={slotRef} className={`monad-slot ${className}`} style={{ ...wrapStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loadingComponent ?? <NeonSpinner />}
        <style>{`@keyframes monad-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div ref={slotRef} className={`monad-slot ${className}`} style={wrapStyle}>
        {errorComponent ?? (
          <div style={{ textAlign: 'center', color: '#ff6680', padding: '8px', fontSize: fontSize.small }}>
            ⚠ {error.message}
          </div>
        )}
      </div>
    );
  }

  // Ad exists
  if (adData?.hasAd && adData.contentUrl) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div ref={slotRef} className={`monad-slot ${className}`} style={wrapStyle}>
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src={adData?.contentUrl || ''}
                    alt="Advertisement"
                    fill
                    className="object-contain"
                    sizes={`${dimensions.width}px`}
                    onError={() => {
                      setAdData(null);
                    }}
                  />
                </div>
          {/* Source badge — shows "on-chain" vs "api" for transparency */}
          <div style={{
            position: 'absolute', bottom: 2, right: 4,
            fontSize: '8px', color: source === 'onchain' ? '#00f5ff88' : '#ffffff44',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {source === 'onchain' ? '⛓ monad' : '☁ api'}
          </div>
        </div>

        {clickable && (
          <button
            onClick={handleClick}
            title={queueInfo && queueInfo.totalInQueue > 0 ? `Book next slot (${queueInfo.totalInQueue} in queue)` : 'Book next slot'}
            style={{
              position: 'absolute', top: '-8px', right: '-8px',
              minWidth: '24px', height: '24px',
              background: 'linear-gradient(135deg, #00f5ff, #bf00ff)',
              color: '#000', border: 'none', borderRadius: '50%',
              fontSize: '10px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 8px #00f5ff80',
              transition: 'all 0.2s ease', zIndex: 10,
              padding: '0 6px',
            }}
          >
            {queueInfo && queueInfo.totalInQueue > 0 ? queueInfo.totalInQueue : '+'}
          </button>
        )}
      </div>
    );
  }

  // Empty slot — available for purchase
  return (
    <div ref={slotRef} className={`monad-slot ${className}`}
      style={{ ...wrapStyle, cursor: clickable ? 'pointer' : 'default',
        border: `2px dashed ${theme.borderColor || '#00f5ff44'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={clickable ? handleClick : undefined}
    >
      {emptySlotComponent ?? (
        <div style={{ textAlign: 'center', color: theme.textColor || '#e2e8f0', padding: '4px' }}>
          <div style={{ fontSize: fontSize.icon, marginBottom: '4px' }}>📡</div>
          <div style={{ fontSize: fontSize.title, fontWeight: 600, marginBottom: '2px' }}>Ad Slot: {slotId}</div>
          <div style={{ fontSize: fontSize.subtitle, color: '#00f5ff', marginBottom: '2px' }}>{price} mUSDC • {size}</div>
          {queueInfo && !queueInfo.isAvailable && (
            <div style={{ fontSize: fontSize.small, color: '#bf00ff', fontWeight: 'bold' }}>{queueInfo.totalInQueue} in queue</div>
          )}
          {clickable && (
            <div style={{ fontSize: fontSize.small, color: '#ffffff66', marginTop: '4px' }}>
              {queueInfo && !queueInfo.isAvailable ? '↗ Click to bid' : '↗ Click to purchase'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
