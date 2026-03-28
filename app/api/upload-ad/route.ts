import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';

async function getLighthouseStorage() {
  try {
    const { storeAdPlacement } = await import('@/lib/lighthouse-http-storage');
    return { storeAdPlacement };
  } catch (error) {
    console.error('Failed to import lighthouse HTTP storage:', error);
    throw new Error('Lighthouse HTTP storage not available');
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const ipRateLimitResult = await applyRateLimit(request, {
      ipLimit: RATE_LIMITS.IP_LIMIT,
      windowMs: RATE_LIMITS.WINDOW_MS,
    });

    if (ipRateLimitResult) {
      return ipRateLimitResult;
    }

    console.log('Upload-ad API called');

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      slotId, 
      mediaHash, 
      paymentData, 
      paymentInfo 
    } = body;

    if (!slotId || !mediaHash || !paymentData || !paymentInfo) {
      console.error('Missing required fields:', { slotId, mediaHash, paymentData, paymentInfo });
      return NextResponse.json(
        { error: 'Missing required fields', received: { slotId, mediaHash, paymentData, paymentInfo } },
        { status: 400 }
      );
    }

    if (!paymentData.transactionHash || !paymentData.payerAddress || !paymentData.AmountPaid) {
      return NextResponse.json(
        { error: 'Invalid payment data. Missing transactionHash, payerAddress, or amountPaid' },
        { status: 400 }
      );
    }

    const walletAddress = paymentData.payerAddress;
    console.log('Payment data:', paymentData);

    const { storeAdPlacement } = await getLighthouseStorage();
    
    const bidAmount = paymentData.bidAmount || paymentData.AmountPaid;
    
    console.log('Storing ad placement:', {
      slotId,
      advertiserWallet: walletAddress,
      contentHash: mediaHash,
      price: bidAmount,
      durationMinutes: 60
    });

    const result = await storeAdPlacement(
      slotId,
      walletAddress.toLowerCase(),
      mediaHash,
      bidAmount,
      60,
      bidAmount,
      'MON'
    );

    console.log('Ad placement stored result:', result);

    try {
      const payment = await prisma.payment.create({
        data: {
          slotId,
          transactionHash: paymentData.transactionHash,
          payerAddress: walletAddress.toLowerCase(),
          amount: bidAmount,
          currency: 'MON',
          network: 'monad-testnet',
          status: 'completed',
          paymentMethod: paymentData.paymentMethod || 'mon',
        },
      });
      console.log('Payment record created:', payment.id);
    } catch (dbError) {
      console.warn('Payment record creation failed (non-critical):', dbError);
    }

    return NextResponse.json({
      success: true,
      slotId,
      mediaHash,
      message: 'Ad uploaded successfully',
      placement: result,
    });

  } catch (error) {
    console.error('Error in upload-ad API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}