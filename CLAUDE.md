# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run db:generate` - Generate database migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Architecture

This is a mobile-first e-commerce platform for buying and selling phones, built with:

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS v4** with inline theme configuration
- **Drizzle ORM** with SQLite for database
- **NextAuth.js** for authentication
- **Cloudinary** for image uploads (optional)

### User Roles

- **Buyer**: Can browse products, add to cart, and purchase
- **Seller**: Can list and manage their own products
- **Admin**: Can manage all products and users (dashboard pending)

### Key Directories

- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `lib/db/` - Database schema and connection

### Database Schema

The database includes tables for:
- `users` - User accounts with roles
- `products` - Phone listings with images and details
- `orders` and `orderItems` - Purchase history
- `cartItems` - Shopping cart functionality
- NextAuth.js tables for sessions and accounts

### Authentication

Uses NextAuth.js with credentials provider. Users can register as buyers or sellers. Authentication is required for:
- Adding products to cart
- Accessing seller dashboard
- Making purchases

### Image Upload

Products support multiple images uploaded to Cloudinary. The upload preset name is `phone_marketplace`. Set Cloudinary credentials in `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### API Routes

Key endpoints:
- `/api/auth/[...nextauth]` - NextAuth configuration
- `/api/products` - List and create products
- `/api/products/[id]` - Get single product details
- `/api/products/seller` - Get seller's products
- `/api/cart` - Shopping cart operations

### Environment Variables

Required environment variables (see `.env.example`):
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` for authentication
- `DATABASE_URL` for SQLite connection
- Cloudinary credentials for image uploads

### Mobile-First Design

The UI is designed with mobile users in mind, featuring:
- Clean, Apple-inspired aesthetic
- Responsive grid layouts
- Touch-friendly buttons and forms
- Optimized product images