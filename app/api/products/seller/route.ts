import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sellerProducts = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, session.user.id))
      .orderBy(products.createdAt);

    return NextResponse.json({ products: sellerProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}