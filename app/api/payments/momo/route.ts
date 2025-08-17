import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  phoneNumber: string;
  currency?: string;
}

interface MoMoApiResponse {
  referenceId: string;
  status: string;
}

// Generate MoMo API access token
async function getMoMoAccessToken(): Promise<string> {
  const response = await fetch(`${process.env.MOMO_API_BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.MOMO_API_USER_ID}:${process.env.MOMO_API_KEY}`).toString('base64')}`,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY!,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get MoMo access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Request payment from MoMo
async function requestMoMoPayment(
  accessToken: string,
  referenceId: string,
  amount: number,
  phoneNumber: string,
  currency: string = 'EUR'
): Promise<MoMoApiResponse> {
  const paymentData = {
    amount: amount.toString(),
    currency,
    externalId: referenceId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phoneNumber,
    },
    payerMessage: 'Payment for order',
    payeeNote: 'Order payment',
  };

  const response = await fetch(`${process.env.MOMO_API_BASE_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': process.env.MOMO_ENVIRONMENT!,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MoMo payment request failed: ${errorText}`);
  }

  return {
    referenceId,
    status: 'PENDING',
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MoMoPaymentRequest = await request.json();
    const { orderId, amount, phoneNumber, currency = 'EUR' } = body;

    // Validate required fields
    if (!orderId || !amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, phoneNumber' },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order[0].buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    // Check if order is in pending status
    if (order[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      );
    }

    // Validate amount matches order total
    if (Math.abs(order[0].total - amount) > 0.01) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Generate reference ID for MoMo transaction
    const referenceId = uuidv4();

    try {
      // Get MoMo access token
      const accessToken = await getMoMoAccessToken();

      // Request payment from MoMo
      const paymentResponse = await requestMoMoPayment(
        accessToken,
        referenceId,
        amount,
        phoneNumber,
        currency
      );

      // Update order with payment reference
      await db
        .update(orders)
        .set({
          status: 'processing',
          // You might want to add a paymentReference field to your schema
        })
        .where(eq(orders.id, orderId));

      return NextResponse.json({
        success: true,
        referenceId: paymentResponse.referenceId,
        status: paymentResponse.status,
        message: 'Payment request sent. Please check your phone for MoMo prompt.',
      });
    } catch (momoError) {
      console.error('MoMo API Error:', momoError);
      return NextResponse.json(
        { error: 'Payment service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}