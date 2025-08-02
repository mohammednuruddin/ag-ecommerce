import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { cartItems, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
          stock: products.stock,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, session.user.id));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.user.id),
          eq(cartItems.productId, productId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      await db
        .update(cartItems)
        .set({
          quantity: existingItem[0].quantity + quantity,
        })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      await db.insert(cartItems).values({
        id: nanoid(),
        userId: session.user.id,
        productId,
        quantity,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}