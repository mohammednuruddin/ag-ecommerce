import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, products, orders, orderItems } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [userCount, productCount, orderCount, revenueResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ total: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)` })
        .from(orderItems)
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.status, 'delivered')),
    ]);

    return NextResponse.json({
      totalUsers: userCount[0].count,
      totalProducts: productCount[0].count,
      totalOrders: orderCount[0].count,
      totalRevenue: revenueResult[0].total || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}