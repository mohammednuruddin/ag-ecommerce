import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get MoMo access token
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

// Check payment status with MoMo API
async function checkMoMoPaymentStatus(referenceId: string): Promise<any> {
  const accessToken = await getMoMoAccessToken();
  
  const response = await fetch(`${process.env.MOMO_API_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY!,
      'X-Target-Environment': process.env.MOMO_ENVIRONMENT!,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const referenceId = searchParams.get('referenceId');

    if (!orderId || !referenceId) {
      return NextResponse.json(
        { error: 'Order ID and Reference ID are required' },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (order.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check payment status with MoMo
    const paymentStatus = await checkMoMoPaymentStatus(referenceId);
    
    // Update order status based on payment status
    let newOrderStatus = order[0].status;
    
    if (paymentStatus.status === 'SUCCESSFUL') {
      newOrderStatus = 'processing';
      
      // Update order status in database
      await db.update(orders)
        .set({ 
          status: newOrderStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
    } else if (paymentStatus.status === 'FAILED') {
      newOrderStatus = 'cancelled';
      
      // Update order status in database
      await db.update(orders)
        .set({ 
          status: newOrderStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json({
      orderId,
      referenceId,
      paymentStatus: paymentStatus.status,
      orderStatus: newOrderStatus,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      reason: paymentStatus.reason || null
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}