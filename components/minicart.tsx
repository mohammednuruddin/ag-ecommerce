'use client'

import * as React from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MiniCartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

export function MiniCart() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<MiniCartItem[]>([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        const mapped: MiniCartItem[] = (data.items ?? []).map((it: any) => ({
          id: it.id,
          name: it.product?.name ?? 'Item',
          price: it.product?.price ?? 0,
          image: it.product?.images?.[0],
          quantity: it.quantity ?? 1,
        }))
        setItems(mapped)
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) fetchCart()
  }, [open])

  return (
    <>
      {/* <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open cart">
        <ShoppingCart className="h-4 w-4" />
      </Button> */}
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl border-l border-border/60 shadow-lg flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right duration-200"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-[17px] font-semibold tracking-[-0.01em]">Your Cart</div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close cart">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-sm text-muted-foreground">Your cart is empty</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="size-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        // keep <img> to avoid domain config
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {item.quantity}</div>
                    </div>
                    <div className="text-[15px] font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t bg-white/60 supports-[backdrop-filter]:bg-white/50 backdrop-blur">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full h-11 rounded-full text-[15px]" disabled={items.length === 0}>Checkout</Button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

export default MiniCart


