# Phone Marketplace

A mobile-first e-commerce platform for buying and selling phones, built with Next.js 15, TypeScript, and SQLite.

## Features

- **User Roles**: Buyers, Sellers, and Admins
- **Authentication**: Secure login and registration with NextAuth.js
- **Product Management**: Sellers can list and manage their phone listings
- **Shopping Cart**: Add products to cart and manage quantities
- **Image Upload**: Support for multiple product images via Cloudinary
- **Admin Dashboard**: Admin panel for managing users and products
- **Mobile-First Design**: Clean, Apple-inspired UI optimized for mobile devices

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your credentials:
   - `NEXTAUTH_URL=http://localhost:3000`
   - `NEXTAUTH_SECRET=your-secret-key`
   - Cloudinary credentials (optional for image uploads)

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Create an admin user** (optional):
   ```bash
   npx tsx scripts/create-admin.ts
   ```
   This creates an admin user with:
   - Email: admin@example.com
   - Password: admin123

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/           # Authentication pages
├── admin/           # Admin dashboard
├── api/             # API routes
├── auth/            # Auth pages
├── cart/            # Shopping cart
├── dashboard/       # Seller dashboard
├── products/        # Product listings and details
└── page.tsx         # Home page
components/         # Reusable components
lib/               # Utilities and configurations
scripts/           # Helper scripts
```

## Key Features

### For Buyers
- Browse and search for phones
- View detailed product information
- Add products to cart
- Manage cart quantities

### For Sellers
- Register as a seller
- Create product listings with multiple images
- Manage inventory and product status
- View their products in a dedicated dashboard

### For Admins
- View platform statistics
- Manage users and roles
- Monitor products and orders
- Access admin dashboard

## Database

The project uses SQLite with Drizzle ORM. The database includes tables for:
- Users (with roles: buyer, seller, admin)
- Products (with images, pricing, inventory)
- Orders and order items
- Shopping cart items
- Authentication sessions

To view the database:
```bash
npm run db:studio
```

## Image Upload

Products can have multiple images uploaded to Cloudinary. To enable image uploads:
1. Create a Cloudinary account
2. Set up an upload preset named `phone_marketplace`
3. Add your Cloudinary credentials to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## Deployment

The application can be deployed to any platform that supports Next.js. Make sure to:
1. Set all environment variables in production
2. Run `npm run build` before deploying
3. Use a production database (not SQLite for large-scale deployments)

## Technologies Used

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- SQLite
- NextAuth.js
- Cloudinary (for images)
- Lucide React (icons)