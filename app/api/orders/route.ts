import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, cartItems, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cart items
    const userCartItems = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          stock: products.stock,
          isActive: products.isActive,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, session.user.id));

    if (userCartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate cart items
    for (const item of userCartItems) {
      if (!item.product || !item.product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.product?.name || 'Unknown'} is no longer available` },
          { status: 400 }
        );
      }
      
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const total = userCartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    // Create order
    const orderId = nanoid();
    const newOrder = await db.insert(orders).values({
      id: orderId,
      buyerId: session.user.id,
      status: 'pending',
      total,
    }).returning();

    // Create order items and update product stock
    for (const item of userCartItems) {
      if (!item.product) continue;
      
      // Create order item
      await db.insert(orderItems).values({
        id: nanoid(),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });

      // Update product stock
      await db
        .update(products)
        .set({
          stock: item.product.stock - item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    // Clear user's cart
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, session.user.id));

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order: newOrder[0],
        orderId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.buyerId, session.user.id))
      .orderBy(orders.createdAt);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}