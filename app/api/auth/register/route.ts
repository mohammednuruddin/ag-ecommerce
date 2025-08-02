import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.insert(users).values({
      id: nanoid(),
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
    }).returning();

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}