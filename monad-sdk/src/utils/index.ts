import { MonadConfig, AdData, QueueInfo, MonadError } from '../types';

/**
 * Create a default Monad configuration
 */
export const createDefaultConfig = (websiteId: string, walletAddress: string, overrides?: Partial<MonadConfig>): MonadConfig => {
  return {
    websiteId,
    walletAddress,
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
      recipientAddress: walletAddress
    },
    ...overrides
  };
};

/**
 * Validate Monad configuration
 */
export const validateConfig = (config: MonadConfig): MonadError[] => {
  const errors: MonadError[] = [];

  if (!config.websiteId) {
    errors.push({
      code: 'MISSING_WEBSITE_ID',
      message: 'websiteId is required'
    });
  }

  if (!config.walletAddress) {
    errors.push({
      code: 'MISSING_WALLET_ADDRESS',
      message: 'walletAddress is required'
    });
  } else if (!isValidWalletAddress(config.walletAddress)) {
    errors.push({
      code: 'INVALID_WALLET_ADDRESS',
      message: 'walletAddress must be a valid Ethereum address (0x...)'
    });
  }

  if (config.apiBaseUrl && !isValidUrl(config.apiBaseUrl)) {
    errors.push({
      code: 'INVALID_API_URL',
      message: 'apiBaseUrl must be a valid URL'
    });
  }

  if (config.theme?.primaryColor && !isValidColor(config.theme.primaryColor)) {
    errors.push({
      code: 'INVALID_PRIMARY_COLOR',
      message: 'primaryColor must be a valid hex color'
    });
  }

  return errors;
};

/**
 * Check if a URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a color is valid
 */
export const isValidColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Check if a wallet address is valid (Ethereum format)
 */
export const isValidWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Format price for display
 */
export const formatPrice = (price: string, currency: string = 'USDC'): string => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return price;
  
  if (numPrice < 0.01) {
    return `${price} ${currency}`;
  }
  
  return `${numPrice.toFixed(2)} ${currency}`;
};

/**
 * Format time remaining
 */
export const formatTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

/**
 * Generate checkout URL
 */
export const generateCheckoutUrl = (
  slotId: string,
  price: string,
  size: string,
  websiteId: string,
  walletAddress: string,
  apiBaseUrl: string = 'https://Monad.io',
  additionalParams?: Record<string, string>
): string => {
  const params = new URLSearchParams({
    slotId,
    price,
    size,
    websiteId,
    walletAddress,
    ...additionalParams
  });
  
  return `${apiBaseUrl}/checkout?${params.toString()}`;
};

/**
 * Generate upload URL
 */
export const generateUploadUrl = (
  slotId: string,
  price: string,
  size: string,
  websiteId: string,
  walletAddress: string,
  apiBaseUrl: string = 'https://Monad.io',
  additionalParams?: Record<string, string>
): string => {
  const params = new URLSearchParams({
    slotId,
    price,
    size,
    websiteId,
    walletAddress,
    ...additionalParams
  });
  
  return `${apiBaseUrl}/upload?${params.toString()}`;
};

/**
 * Fetch ad data from API
 */
export const fetchAdData = async (
  slotId: string,
  apiBaseUrl: string = 'https://Monad.io'
): Promise<AdData> => {
  const response = await fetch(`${apiBaseUrl}/api/ads/${slotId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ad data: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Fetch queue info from API
 */
export const fetchQueueInfo = async (
  slotId: string,
  apiBaseUrl: string = 'https://Monad.io'
): Promise<QueueInfo> => {
  const response = await fetch(`${apiBaseUrl}/api/queue-info/${slotId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch queue info: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Create a custom hook for ad data
 */
export const createAdDataHook = (slotId: string, apiBaseUrl: string = 'https://Monad.io') => {
  return {
    fetchAdData: () => fetchAdData(slotId, apiBaseUrl),
    fetchQueueInfo: () => fetchQueueInfo(slotId, apiBaseUrl)
  };
};

/**
 * Generate unique slot ID
 */
export const generateSlotId = (prefix: string = 'slot'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Parse slot configuration from URL parameters
 */
export const parseSlotConfigFromUrl = (): Partial<MonadConfig> => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const config: Partial<MonadConfig> = {};
  
  if (params.get('websiteId')) {
    config.websiteId = params.get('websiteId')!;
  }
  
  if (params.get('apiBaseUrl')) {
    config.apiBaseUrl = params.get('apiBaseUrl')!;
  }
  
  return config;
};

/**
 * Track ad events
 */
export const trackAdEvent = (
  event: 'view' | 'click' | 'error',
  slotId: string,
  websiteId: string,
  additionalData?: Record<string, any>
): void => {
  if (typeof window === 'undefined') return;
  
  // Send to analytics endpoint
  fetch('https://Monad.io/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event,
      slotId,
      websiteId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalData
    })
  }).catch(error => {
    console.warn('Failed to track ad event:', error);
  });
};

/**
 * Read on-chain slot state from MonadAdRegistry via JSON-RPC.
 * Uses raw fetch instead of viem to avoid a heavy dependency in this utility layer.
 */
export const readOnChainSlot = async (
  slotId: string,
  rpcUrl: string = 'https://testnet-rpc.monad.xyz/',
  registryAddress: string = '0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb'
): Promise<{ owner: string; ipfsHash: string; price: string; expiry: string } | null> => {
  try {
    // Encode slotId to bytes32
    const encoder = new TextEncoder();
    const bytes = encoder.encode(slotId);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const slotBytes32 = `0x${hex.padEnd(64, '0')}`;

    // activeSlots(bytes32) selector = 0x8a0...
    const selector = '0x9e3d89d0'; // keccak256('activeSlots(bytes32)') first 4 bytes
    const calldata = selector + slotBytes32.slice(2);

    const body = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: registryAddress, data: calldata }, 'latest'],
      id: 1,
    });

    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const json = await res.json();
    if (json.error || !json.result || json.result === '0x') return null;
    return { owner: '', ipfsHash: '', price: '0', expiry: '0' }; // raw decode requires ABI — use wagmi hooks for full decode
  } catch {
    return null;
  }
};

/**
 * Verify a Monad Testnet transaction was successful and confirm its block.
 * Lightweight version using raw JSON-RPC — no viem dependency needed here.
 */
export const verifyTxOnChain = async (
  txHash: string,
  rpcUrl: string = 'https://testnet-rpc.monad.xyz/'
): Promise<{ success: boolean; blockNumber?: string; blockHash?: string }> => {
  try {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    });

    const res  = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const json = await res.json();

    const receipt = json.result;
    if (!receipt) return { success: false };

    return {
      success:     receipt.status === '0x1',
      blockNumber: parseInt(receipt.blockNumber, 16).toString(),
      blockHash:   receipt.blockHash,
    };
  } catch {
    return { success: false };
  }
};

