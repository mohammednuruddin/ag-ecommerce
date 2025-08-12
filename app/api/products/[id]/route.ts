import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        brand: products.brand,
        model: products.model,
        color: products.color,
        storage: products.storage,
        condition: products.condition,
        images: products.images,
        stock: products.stock,
        seller: {
          name: users.name,
          email: users.email,
        },
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, params.id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: product[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedKeys: (keyof typeof products["$inferInsert"])[] = [
      'name',
      'description',
      'price',
      'brand',
      'model',
      'color',
      'storage',
      'condition',
      'images',
      'stock',
      'isActive',
    ];

    const updateData: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    updateData.updatedAt = new Date();

    const result = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, params.id), eq(products.sellerId, session.user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 });
    }

    return NextResponse.json({ product: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .delete(products)
      .where(and(eq(products.id, params.id), eq(products.sellerId, session.user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}