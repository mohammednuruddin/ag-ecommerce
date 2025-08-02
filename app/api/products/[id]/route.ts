import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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