'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Package } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            PhoneMarket
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
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
                <span className="text-sm font-medium">{session.user.name}</span>
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
      </div>
    </nav>
  );
}