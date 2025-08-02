import { integer, text, sqliteTable, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role', { enum: ['buyer', 'seller', 'admin'] }).notNull().default('buyer'),
  image: text('image'),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  color: text('color'),
  storage: text('storage'),
  condition: text('condition', { enum: ['new', 'like_new', 'good', 'fair'] }).notNull(),
  images: text('images', { mode: 'json' }).default('[]'),
  stock: integer('stock').notNull().default(1),
  sellerId: text('sellerId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: integer('isActive', { mode: 'boolean' }).default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  buyerId: text('buyerId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).notNull().default('pending'),
  total: real('total').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
});

export const orderItems = sqliteTable('orderItems', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
});

export const cartItems = sqliteTable('cartItems', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  addedAt: integer('addedAt', { mode: 'timestamp' }).default(new Date()),
});