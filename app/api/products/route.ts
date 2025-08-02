import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.createdAt);

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      brand,
      model,
      color,
      storage,
      condition,
      stock,
      images,
    } = body;

    const newProduct = await db.insert(products).values({
      id: nanoid(),
      name,
      description,
      price: Number(price),
      brand,
      model,
      color,
      storage,
      condition,
      stock: Number(stock),
      images,
      sellerId: session.user.id,
      isActive: true,
    }).returning();

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}