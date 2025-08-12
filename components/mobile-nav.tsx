'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, Package, ShoppingCart, User } from 'lucide-react'

/**
 * MobileNav
 * A lightweight slide-in drawer used on small screens.
 * No external UI libs; mirrors the approach used by `components/minicart.tsx`.
 */
export default function MobileNav() {
  const { data: session } = useSession()
  const [open, setOpen] = React.useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={close}
          />
          <aside className="absolute left-0 top-0 h-full w-full max-w-sm bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl border-r border-border/60 shadow-lg flex flex-col rounded-r-2xl overflow-hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-[17px] font-semibold tracking-[-0.01em]">Menu</div>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={close}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 overflow-auto px-2 py-2">
              <ul className="space-y-1">
                <li>
                  <Button asChild variant="ghost" className="w-full justify-start h-12 text-[15px]">
                    <Link href="/products" onClick={close}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Browse Phones
                    </Link>
                  </Button>
                </li>

                {(session?.user?.role === 'seller' || session?.user?.role === 'admin') && (
                  <li>
                    <Button asChild variant="ghost" className="w-full justify-start h-12 text-[15px]">
                      <Link href={session.user.role === 'admin' ? '/admin' : '/dashboard'} onClick={close}>
                        <Package className="mr-2 h-4 w-4" />
                        {session.user.role === 'admin' ? 'Admin' : 'Dashboard'}
                      </Link>
                    </Button>
                  </li>
                )}

                {session ? (
                  <>
                    <li>
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="truncate">{session.user.name}</span>
                      </div>
                    </li>
                    <li>
                      <Button variant="ghost" className="w-full justify-start h-12 text-[15px]" onClick={() => { close(); signOut(); }}>
                        Sign out
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Button asChild variant="ghost" className="w-full justify-start h-12 text-[15px]">
                        <Link href="/auth/signin" onClick={close}>Sign in</Link>
                      </Button>
                    </li>
                    <li>
                      <Button asChild className="w-full justify-start h-12 text-[15px]">
                        <Link href="/auth/signup" onClick={close}>Sign up</Link>
                      </Button>
                    </li>
                  </>
                )}

                <li className="pt-2 border-t mt-2">
                  <Button asChild variant="outline" className="w-full justify-start h-12 text-[15px]">
                    <Link href="/auth/signup?role=seller" onClick={close}>Start Selling</Link>
                  </Button>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}


