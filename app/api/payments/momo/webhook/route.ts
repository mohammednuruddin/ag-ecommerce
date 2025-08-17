import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract payment information from webhook payload
    const {
      financialTransactionId,
      externalId, // This should be our order ID
      amount,
      currency,
      payer,
      payerMessage,
      payeeNote,
      status,
      reason
    } = body;

    console.log('MoMo webhook received:', {
      financialTransactionId,
      externalId,
      amount,
      status,
      reason
    });

    if (!externalId) {
      return NextResponse.json(
        { error: 'External ID (Order ID) is required' },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await db.select().from(orders).where(eq(orders.id, externalId));
    
    if (order.length === 0) {
      console.error('Order not found for webhook:', externalId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status based on payment status
    let newOrderStatus = order[0].status;
    
    if (status === 'SUCCESSFUL') {
      newOrderStatus = 'processing';
      console.log(`Payment successful for order ${externalId}`);
    } else if (status === 'FAILED') {
      newOrderStatus = 'cancelled';
      console.log(`Payment failed for order ${externalId}: ${reason}`);
    } else {
      console.log(`Payment pending for order ${externalId}`);
      // Keep current status for pending payments
    }

    // Update order status in database if status changed
    if (newOrderStatus !== order[0].status) {
      await db.update(orders)
        .set({ 
          status: newOrderStatus,
          updatedAt: new Date()
        })
        .where(eq(orders.id, externalId));
      
      console.log(`Order ${externalId} status updated to ${newOrderStatus}`);
    }

    // Log the webhook for debugging
    console.log('Webhook processed successfully:', {
      orderId: externalId,
      oldStatus: order[0].status,
      newStatus: newOrderStatus,
      paymentStatus: status,
      amount,
      currency
    });

    // Return success response to MoMo
    return NextResponse.json({
      message: 'Webhook processed successfully',
      orderId: externalId,
      status: newOrderStatus
    }, { status: 200 });

  } catch (error) {
    console.error('MoMo webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'MoMo webhook endpoint is active' },
    { status: 200 }
  );
}