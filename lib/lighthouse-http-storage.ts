// HTTP-based Lighthouse storage to avoid SDK dependencies
// This uses direct HTTP calls to Lighthouse API instead of the SDK

import { getLighthouseHash, updateLighthouseHash } from './storage-config';

// Lighthouse API key
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

export interface StoredPlacement {
  slotId: string;
  placementId: string;
  advertiserWallet: string;
  contentUrl: string;
  contentHash: string;
  price: string;
  currency: string;
  durationMinutes: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled' | 'queued';
  createdAt: string;
  bidAmount?: string;
}

export interface SlotQueue {
  slotId: string;
  queue: StoredPlacement[];
  lastUpdated: string;
}

export interface StorageData {
  activePlacements: Record<string, StoredPlacement>;
  slotQueues: Record<string, SlotQueue>;
  lastUpdated: string;
}

// Cache for current data (refreshed from IPFS)
let cachedData: StorageData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

const IPFS_GATEWAYS = [
  'https://gateway.lighthouse.storage/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/'
];

/**
 * Get the current storage data from IPFS using HTTP
 */
async function getStorageData(): Promise<StorageData> {
  const now = Date.now();
  try {
    // Check cache first
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedData;
    }

    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    // Get the current storage hash from database
    const storageHash = await getLighthouseHash();
    if (!storageHash) {
      // Initialize with empty data if no storage hash exists
      // In production, you'd set LIGHTHOUSE_STORAGE_HASH in environment
      const initialData: StorageData = {
        activePlacements: {},
        slotQueues: {},
        lastUpdated: new Date().toISOString()
      };
      cachedData = initialData;
      lastFetchTime = now;
      console.log('Initialized with empty data - configure LIGHTHOUSE_STORAGE_HASH for persistence');
      return initialData;
    }

    // Try multiple gateways for high availability
    let data: StorageData | null = null;
    let lastError: any = null;

    for (const gateway of IPFS_GATEWAYS) {
      try {
        console.log(`Fetching storage from gateway: ${gateway}`);
        const response = await fetch(`${gateway}${storageHash}`, { signal: AbortSignal.timeout(15000) });
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gateway ${gateway} failed:`, err instanceof Error ? err.message : err);
        continue;
      }
    }

    if (!data) {
      throw lastError || new Error('All IPFS gateways failed to resolve');
    }

    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error('Error in getStorageData:', error);
    // Return empty data if fetch fails
    const emptyData: StorageData = {
      activePlacements: {},
      slotQueues: {},
      lastUpdated: new Date().toISOString()
    };
    cachedData = emptyData;
    lastFetchTime = Date.now();
    return emptyData;
  }
}

/**
 * Save storage data to IPFS using HTTP
 */
async function saveStorageData(data: StorageData): Promise<string> {
  try {
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('Lighthouse API key not configured');
    }

    data.lastUpdated = new Date().toISOString();
    const jsonData = JSON.stringify(data, null, 2);
    
    // Upload to Lighthouse using HTTP API
    const formData = new FormData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    formData.append('file', blob, 'Monad-storage.json');

    const response = await fetch('https://upload.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Lighthouse: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result && result.Hash) {
      const hash = result.Hash;

      // Update cache and persist hash to database
      cachedData = data;
      lastFetchTime = Date.now();
      await updateLighthouseHash(hash);

      console.log(`Storage updated. New hash: ${hash}`);

      return hash;
    } else {
      throw new Error('Failed to upload storage data to Lighthouse');
    }
  } catch (error) {
    console.error('Error saving storage data:', error);
    throw error;
  }
}

/**
 * Store an ad placement
 */
export async function storeAdPlacement(
  slotId: string,
  advertiserWallet: string,
  contentHash: string,
  price: string,
  durationMinutes: number,
  bidAmount?: string,
  currency: string = 'USDC'
): Promise<string> {
  const data = await getStorageData();

  const placementId = `placement-${slotId}-${Date.now()}`;
  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  const placement: StoredPlacement = {
    slotId,
    placementId,
    advertiserWallet,
    contentUrl: contentHash.startsWith('/') 
      ? contentHash  // Local path
      : `https://gateway.lighthouse.storage/ipfs/${contentHash}`,  // IPFS hash
    contentHash,
    price,
    currency,
    durationMinutes,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
    bidAmount
  };

  const existingPlacement = data.activePlacements[slotId];

  if (existingPlacement) {
    // Slot is occupied, add to queue
    await addToQueue(data, slotId, placement);
    console.log(`Slot ${slotId} is occupied, added to queue. Queue position: ${getQueuePosition(slotId)}`);
    await saveStorageData(data);
    return `queued-${placementId}`;
  } else {
    // Slot is available, activate immediately
    data.activePlacements[slotId] = placement;
    data.lastUpdated = new Date().toISOString();
    await saveStorageData(data);
    console.log(`Stored placement for slot ${slotId}:`, placement);
    return `stored-${placementId}`;
  }
}

/**
 * Get an active ad placement
 */
export async function getAdPlacement(slotId: string): Promise<StoredPlacement | null> {
  const data = await getStorageData();
  const placement = data.activePlacements[slotId];
  
  if (!placement) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(placement.expiresAt);

  if (now > expiresAt) {
    placement.status = 'expired';
    delete data.activePlacements[slotId];
    console.log(`Ad expired for slot ${slotId} at ${expiresAt.toISOString()}`);

    // Activate next ad from queue
    const queue = data.slotQueues[slotId];
    if (queue && queue.queue.length > 0) {
      const nextPlacement = queue.queue.shift()!;
      nextPlacement.status = 'active';
      
      const now = new Date();
      const durationMs = nextPlacement.durationMinutes * 60 * 1000;
      nextPlacement.startsAt = now.toISOString();
      nextPlacement.expiresAt = new Date(now.getTime() + durationMs).toISOString();
      
      data.activePlacements[slotId] = nextPlacement;
      console.log(`Activated next ad in queue for slot ${slotId}: ${nextPlacement.placementId}`);
      
      if (queue.queue.length === 0) {
        delete data.slotQueues[slotId];
      }
      
      await saveStorageData(data);
    }
    
    return null;
  }

  return placement;
}

/**
 * Get queue information for a slot
 */
export async function getQueueInfo(slotId: string): Promise<{
  position: number;
  totalInQueue: number;
  nextActivation?: string;
  isAvailable: boolean;
}> {
  const data = await getStorageData();
  const queue = data.slotQueues[slotId];
  const activePlacement = data.activePlacements[slotId];

  return {
    position: queue ? queue.queue.length : 0,
    totalInQueue: queue ? queue.queue.length : 0,
    nextActivation: activePlacement ? activePlacement.expiresAt : undefined,
    isAvailable: !activePlacement || new Date(activePlacement.expiresAt) <= new Date()
  };
}

/**
 * Add placement to queue
 */
async function addToQueue(data: StorageData, slotId: string, placement: StoredPlacement): Promise<void> {
  if (!data.slotQueues[slotId]) {
    data.slotQueues[slotId] = {
      slotId,
      queue: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  placement.status = 'queued';
  data.slotQueues[slotId].queue.push(placement);
  
  // Sort by bid amount (highest first)
  data.slotQueues[slotId].queue.sort((a, b) => {
    const bidA = parseFloat(a.bidAmount || a.price);
    const bidB = parseFloat(b.bidAmount || b.price);
    return bidB - bidA;
  });
  
  data.slotQueues[slotId].lastUpdated = new Date().toISOString();
}

/**
 * Get queue position for a slot
 */
export function getQueuePosition(slotId: string): number {
  const data = cachedData; // Use cached data for quick access
  const queue = data?.slotQueues[slotId];
  return queue ? queue.queue.length : 0;
}
