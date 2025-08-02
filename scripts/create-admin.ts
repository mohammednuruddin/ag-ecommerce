import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await db.insert(users).values({
    id: nanoid(),
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  }).returning();

  console.log('Admin user created:', adminUser[0]);
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
}

createAdminUser().catch(console.error);