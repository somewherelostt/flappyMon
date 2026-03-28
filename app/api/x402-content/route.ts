import { NextRequest, NextResponse } from 'next/server';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import type { Network } from '@x402/core/types';
import { getAdPlacement } from '@/lib/lighthouse-http-storage';

const MONAD_NETWORK: Network = 'eip155:10143';
const MONAD_USDC_TESTNET = '0x4b017c27e6ad4b44002c25ca5f1ced94815cab75';
const FACILITATOR_URL = 'https://x402-facilitator.molandak.org';

const PAY_TO = process.env.PAYMENT_RECIPIENT || '0x6730D29d8473F758893E454c247DFddFFE927BDB';

const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const server = x402ResourceServer(facilitatorClient);

const monadScheme = new ExactEvmScheme();
monadScheme.registerMoneyParser(async (amount: number, network: string) => {
  if (network === MONAD_NETWORK) {
    const tokenAmount = Math.floor(amount * 1_000_000).toString();
    return {
      amount: tokenAmount,
      asset: MONAD_USDC_TESTNET,
      extra: {
        name: 'USDC',
        version: '2',
      },
    };
  }
  return null;
});

server.register(MONAD_NETWORK, monadScheme);

const routeConfig = {
  accepts: {
    scheme: 'exact',
    network: MONAD_NETWORK,
    payTo: PAY_TO,
    price: '$0.01',
  },
  resource: '/api/x402-content',
};

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const slotId = url.searchParams.get('slotId');
  
  if (!slotId) {
    return NextResponse.json({ error: 'Missing slotId parameter' }, { status: 400 });
  }

  try {
    const placement = await getAdPlacement(slotId);
    
    if (!placement) {
      return NextResponse.json(
        { error: 'No active ad found for this slot' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slotId,
      contentUrl: placement.contentUrl,
      contentHash: placement.contentHash,
      advertiserWallet: placement.advertiserWallet,
      price: placement.price,
      expiresAt: placement.expiresAt,
      unlockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching ad content:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ad content' },
      { status: 500 }
    );
  }
}

const { GET } = server.createRouteHandler(routeConfig, handler);

export { GET };