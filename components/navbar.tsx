'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Package } from 'lucide-react';
import { MiniCart } from '@/components/minicart';
import MobileNav from '@/components/mobile-nav';
import SearchBar from '@/components/search-bar';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center gap-3 px-4">
        <div className="flex items-center min-w-0 shrink-0">
          <Link href="/" className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
            PhoneMarket
          </Link>
        </div>
        <div className="hidden md:flex flex-1 min-w-0">
          <SearchBar className="w-full" />
        </div>
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <MiniCart />
          {session ? (
            <>
              {(session.user.role === 'seller' || session.user.role === 'admin') && (
                <Button variant="ghost" asChild>
                  <Link 
                    href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>{session.user.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link href="/cart" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-[160px]">{session.user.name}</span>
              </div>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden ml-auto">
          <MiniCart />
          <MobileNav />
        </div>
      </div>
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </nav>
  );
}