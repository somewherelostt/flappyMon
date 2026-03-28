import { Router } from 'express';
import { z } from 'zod';
import { getDb, COLLECTION_NAME } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HashRecord, hashRecordSchema, getSchema } from '../types.js';
import { monadClient, MARKET_ADDRESS, MARKET_EVENTS_ABI } from '../monad-client.js';

export const hashRouter = Router();

/**
 * POST /hashes
 * Body: { index, media_hash, validUpto, txHash, AmountPaid, payerAddress, recieverAddress }
 * Stores the record under the doc id equal to "index".
 * Note: validUpto is user-specified Unix timestamp for ad expiration.
 */
hashRouter.post('/', async (req, res) => {
  try {
    const parsed = hashRecordSchema.parse(req.body);
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, parsed.index);
    await setDoc(docRef, parsed as HashRecord, { merge: false });

    res.status(201).json({ ok: true, id: parsed.index });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payload', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to store record' });
  }
});

/**
 * GET /hashes/:index
 * Retrieves the record stored under the provided index.
 */
hashRouter.get('/:index', async (req, res) => {
  try {
    const params = getSchema.parse({ index: req.params.index });
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, params.index);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(snap.data());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid index', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to retrieve record' });
  }
});

/**
 * Optional: GET /hashes?index=<index> to support query-based retrieval
 */
hashRouter.get('/', async (req, res) => {
  try {
    const indexParam = (req.query.index as string | undefined) ?? '';
    if (!indexParam) {
      return res.status(400).json({ error: 'index query parameter is required' });
    }
    const params = getSchema.parse({ index: indexParam });
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, params.index);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(snap.data());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid index', details: err.format() });
    }
    return res.status(500).json({ error: 'Failed to retrieve record' });
  }
});

/**
 * POST /hashes/verify-tx
 * Body: { txHash, expectedSlotId?, expectedBuyer? }
 *
 * Verifies a Monad Testnet transaction against the MonadAdMarket contract.
 * Uses viem to read the on-chain receipt and decode AdPurchased / BidPlaced
 * event logs — no trust required, fully on-chain verification.
 *
 * Response: { verified, event, contractAddress, blockNumber, slotId, ipfsHash, buyer, price }
 */
const verifyTxSchema = z.object({
  txHash:          z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  expectedSlotId:  z.string().optional(),
  expectedBuyer:   z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

hashRouter.post('/verify-tx', async (req, res) => {
  try {
    const { txHash, expectedBuyer } = verifyTxSchema.parse(req.body);

    // 1. Fetch on-chain receipt from Monad Testnet
    const receipt = await monadClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return res.status(404).json({ error: 'Transaction not found on Monad Testnet' });
    }

    if (receipt.status !== 'success') {
      return res.status(400).json({ error: 'Transaction reverted on-chain', status: receipt.status });
    }

    // 2. Verify the tx was sent to OUR MonadAdMarket contract
    const targetContract = MARKET_ADDRESS.toLowerCase();
    const txTo = receipt.to?.toLowerCase();
    if (txTo !== targetContract) {
      return res.status(400).json({
        error: 'Transaction was not sent to MonadAdMarket contract',
        expected: targetContract,
        received: txTo,
      });
    }

    // 4. Decode event logs from the receipt
    const { parseEventLogs } = await import('viem');
    const logs = parseEventLogs({
      abi: MARKET_EVENTS_ABI,
      logs: receipt.logs,
    });

    const purchaseEvent = logs.find(l => l.eventName === 'AdPurchased');
    const bidEvent      = logs.find(l => l.eventName === 'BidPlaced');
    const matchedEvent  = purchaseEvent ?? bidEvent;

    if (!matchedEvent) {
      return res.status(400).json({ error: 'No AdPurchased or BidPlaced event found in tx' });
    }

    // 5. EXTRACT DATA & SYNC TO IPFS (Mirroring Template Logic)
    const eventArgs = matchedEvent.args as any;
    const buyer     = purchaseEvent ? eventArgs.buyer : eventArgs.bidder;
    const slotId    = eventArgs.slotId; // hex string from bytes32
    const ipfsHash  = eventArgs.ipfsHash;
    const price     = (purchaseEvent ? eventArgs.price : eventArgs.amount);

    if (expectedBuyer && buyer?.toLowerCase() !== expectedBuyer.toLowerCase()) {
      return res.status(400).json({
        error: 'Buyer address mismatch',
        expected: expectedBuyer,
        onChain: buyer,
      });
    }

    // 🔥 AUTOMATIC SYNC TO IPFS REGISTRY 🔥
    const { storeAdPlacement } = await import('../lib/lighthouse.js');
    let syncStatus = 'skipped';
    let placementId = '';

    try {
      console.log(`🚀 Syncing Monad Tx to IPFS for slot ${slotId}...`);
      placementId = await storeAdPlacement(
        slotId,
        buyer,
        ipfsHash,
        price.toString(),
        60, // Default 60 mins duration (can be parameterized)
        matchedEvent.eventName === 'BidPlaced' ? price.toString() : undefined
      );
      syncStatus = 'success';
      console.log(`✅ IPFS Sync Complete: ${placementId}`);
    } catch (syncErr) {
      console.error('❌ IPFS Sync Failed:', syncErr);
      syncStatus = 'failed';
    }

    return res.status(200).json({
      verified: true,
      syncStatus,
      placementId,
      event:           matchedEvent.eventName,
      contractAddress: MARKET_ADDRESS,
      blockNumber:     receipt.blockNumber.toString(),
      txHash,
      slotId,
      ipfsHash,
      buyer,
      price:           price.toString(),
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payload', details: err.format() });
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Verification failed', details: msg });
  }
});
